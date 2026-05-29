import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/router';
import { useNotification } from './NotificationContext';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const userRef = useRef(null);
  const sessionTokenRef = useRef(null);
  const { notify } = useNotification();
  const router = useRouter();

  // Carga inicial de la sesión
  useEffect(() => {
    async function loadSession() {
      try {
        // Obtener la sesión local de Supabase
        const { data: { session: localSession } } = await supabase.auth.getSession();
        
        if (localSession) {
          sessionTokenRef.current = localSession.access_token;
          setSession(localSession);
          
          // Obtener el perfil normalizado desde la API del backend
          const res = await fetch('/api/auth/session', {
            headers: {
              'Authorization': `Bearer ${localSession.access_token}`
            }
          });
          
          if (res.ok) {
            const data = await res.json();
            const profileStr = JSON.stringify(data.profile);
            if (profileStr !== JSON.stringify(userRef.current)) {
              userRef.current = data.profile;
              setUser(data.profile);
            }
          } else {
            // Si el backend dice que no es válido (token expirado o inválido)
            await supabase.auth.signOut();
            userRef.current = null;
            sessionTokenRef.current = null;
            setUser(null);
            setSession(null);
          }
        }
      } catch (err) {
        console.error('Error al cargar la sesión:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSession();

    // Suscribirse a los cambios de estado de autenticación de Supabase (por ejemplo, cuando expira el token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (newSession) {
        if (sessionTokenRef.current !== newSession.access_token) {
          sessionTokenRef.current = newSession.access_token;
          setSession(newSession);
        }
        
        // Si cambió la sesión o se emitió evento, revisar perfil del usuario
        try {
          const res = await fetch('/api/auth/session', {
            headers: {
              'Authorization': `Bearer ${newSession.access_token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            const profileStr = JSON.stringify(data.profile);
            if (profileStr !== JSON.stringify(userRef.current)) {
              userRef.current = data.profile;
              setUser(data.profile);
            }
          }
        } catch (err) {
          console.error('Error al actualizar el usuario tras cambio de auth:', err);
        }
      } else {
        userRef.current = null;
        sessionTokenRef.current = null;
        setUser(null);
        setSession(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Inicia sesión llamando al backend (Router -> Controller -> Service -> Repository).
   * Guarda las credenciales devueltas en la instancia local de Supabase.
   */
  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        notify(data.error || 'Credenciales inválidas', 'error');
        return { error: data.error || 'Error en autenticación' };
      }

      const { session: serverSession, profile } = data;

      // ⚠️ GUARDAR LA CREDENCIAL DEVUELTA:
      // Establecemos la sesión en el cliente Supabase para guardar el token JWT en localStorage
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: serverSession.access_token,
        refresh_token: serverSession.refresh_token
      });

      if (sessionError) {
        notify('Error al sincronizar sesión local', 'error');
        return { error: sessionError.message };
      }

      sessionTokenRef.current = serverSession.access_token;
      setSession(serverSession);
      userRef.current = profile;
      setUser(profile);
      notify('¡Bienvenido de vuelta!', 'success');
      router.push('/dashboard');
      return { user: profile, session: serverSession };
    } catch (err) {
      notify('Error de red. Intenta nuevamente.', 'error');
      return { error: err.message };
    } finally {
      setLoading(false);
    }
  }, [notify, router]);

  /**
   * Cierra la sesión
   */
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      userRef.current = null;
      sessionTokenRef.current = null;
      setUser(null);
      setSession(null);
      notify('Sesión cerrada con éxito', 'info');
      router.push('/login');
    } catch (err) {
      notify('Error al cerrar sesión', 'error');
    } finally {
      setLoading(false);
    }
  }, [notify, router]);

  /**
   * Refresca la sesión y el perfil del usuario desde el servidor.
   */
  const refreshSession = useCallback(async () => {
    try {
      const { data: { session: localSession } } = await supabase.auth.getSession();
      if (localSession) {
        const res = await fetch('/api/auth/session', {
          headers: {
            'Authorization': `Bearer ${localSession.access_token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          const profileStr = JSON.stringify(data.profile);
          if (profileStr !== JSON.stringify(userRef.current)) {
            userRef.current = data.profile;
            setUser(data.profile);
          }
        }
      }
    } catch (err) {
      console.error('Error al refrescar la sesión:', err);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, isAuthenticated: !!user, loading, login, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
