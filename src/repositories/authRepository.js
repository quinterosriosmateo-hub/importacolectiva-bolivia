import { supabase } from '@/lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';

const getAuthenticatedClient = (token) => {
  if (!token) return supabase;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  );
};

/**
 * authRepository — Capa de acceso a datos de autenticación.
 * Única capa que llama a Supabase auth directamente.
 */
export const authRepository = {
  /**
   * Inicia sesión con email y contraseña.
   * Supabase almacena automáticamente el token en localStorage.
   * @returns {{ session, user, error }}
   */
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { session: data?.session ?? null, user: data?.user ?? null, error };
  },

  /**
   * Registra un nuevo usuario en Supabase Auth con metadatos.
   * @param {string} email
   * @param {string} password
   * @param {object} metadata - Contiene { nombre, telefono, rol, biografia, ubicacion, avatar_url }
   */
  async signUp(email, password, metadata) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre: metadata.nombre,
          telefono: metadata.telefono,
          rol: metadata.rol || 'Cliente',
          biografia: metadata.biografia || 'Miembro de Importacolectiva.',
          ubicacion: metadata.ubicacion || 'Bolivia',
          avatar_url: metadata.avatar_url || null
        }
      }
    });
    return { session: data?.session ?? null, user: data?.user ?? null, error };
  },

  /**
   * Obtiene la información de la tabla public.usuario.
   * @param {string} userId
   */
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('usuario')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    return { data, error };
  },

  /**
   * Actualiza la información de la tabla public.usuario.
   * @param {string} userId
   * @param {object} profileData
   * @param {string} token
   */
  async updateProfile(userId, profileData, token) {
    console.log("[updateProfile] userId:", userId, "token exists:", !!token);
    // Intentamos actualizar primero
    const client = getAuthenticatedClient(token);
    const { data, error } = await client
      .from('usuario')
      .update(profileData)
      .eq('id', userId)
      .select()
      .maybeSingle();
      
    // Si la actualización es exitosa o si hay error (que no sea que falte la fila) lo devolvemos
    if (error || data) {
      return { data, error };
    }
    
    // Si no hubo error pero data es nulo, significa que la fila no existe.
    // Insertamos la fila completa con el ID. (Requiere que profileData tenga lo mínimo necesario, 
    // pero si falla, al menos devolveremos el error correspondiente de la base de datos).
    const { data: insertData, error: insertError } = await client
      .from('usuario')
      .insert({ id: userId, ...profileData })
      .select()
      .maybeSingle();

    return { data: insertData, error: insertError };
  },

  /**
   * Envía un correo de recuperación de contraseña.
   * @param {string} email
   */
  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/update-password`
    });
    return { error };
  },

  /**
   * Cierra la sesión actual.
   * @returns {{ error }}
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  /**
   * Obtiene la sesión activa del almacenamiento local.
   * @returns {{ session, user }}
   */
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return { session, user: session?.user ?? null };
  },

  /**
   * Suscribe un listener a los cambios de estado de auth.
   * Retorna la función de desuscripción.
   * @param {(event: string, session: object|null) => void} callback
   * @returns {() => void} unsubscribe
   */
  onAuthStateChange(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
    return () => subscription.unsubscribe();
  },
};
