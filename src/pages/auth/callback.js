import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { supabase } from '@/lib/supabaseClient';

/**
 * Página de callback para OAuth (Google, etc.)
 * Supabase redirige aquí tras autenticarse con un proveedor externo.
 * La sesión se establece automáticamente a través de onAuthStateChange en AuthContext.
 */
export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Supabase v2: cuando se usa signInWithOAuth con redirectTo,
    // el SDK detecta el fragmento #access_token en la URL y establece la sesión
    // de forma automática al llamar a getSession/onAuthStateChange.
    // Solo necesitamos esperar brevemente y luego redirigir.
    const handleCallback = async () => {
      try {
        // Forzar que Supabase procese el hash de la URL si existe
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error en callback OAuth:', error.message);
          router.replace('/login');
          return;
        }

        if (data?.session) {
          // Sesión establecida correctamente → ir al dashboard
          router.replace('/dashboard');
        } else {
          // Sin sesión (usuario canceló, etc.) → volver al login
          router.replace('/login');
        }
      } catch (err) {
        console.error('Error inesperado en callback:', err);
        router.replace('/login');
      }
    };

    // Pequeño delay para asegurar que Supabase procese el fragmento de la URL
    const timer = setTimeout(handleCallback, 300);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 3,
      }}
    >
      <CircularProgress size={48} />
      <Typography variant="h6" color="text.secondary">
        Verificando tu cuenta con Google...
      </Typography>
    </Box>
  );
}
