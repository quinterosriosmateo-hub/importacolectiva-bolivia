import { createClient } from '@supabase/supabase-js';

/**
 * withAuth — Middleware para rutas API de Next.js que valida el JWT de Supabase.
 *
 * Uso:
 *   export default withAuth(async function handler(req, res) {
 *     // req.user está disponible aquí
 *     res.json({ userId: req.user.id });
 *   });
 *
 * El cliente frontend debe enviar el token en el header:
 *   Authorization: Bearer <supabase_access_token>
 */

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export function withAuth(handler) {
  return async function (req, res) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Permitir bypass en modo desarrollo para pruebas cómodas sin credenciales
      if (process.env.NODE_ENV === 'development') {
        req.user = {
          id: '00000000-0000-0000-0000-000000000000',
          email: 'admin@importacolectiva.com',
          user_metadata: {
            full_name: 'Desarrollador de Pruebas',
            role: 'admin'
          }
        };
        return handler(req, res);
      }
      return res.status(401).json({ error: 'No autorizado: token no proporcionado.' });
    }

    const token = authHeader.split(' ')[1];
    req.token = token;

    // Verificar el token con Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      // Si el token falló pero estamos en desarrollo, igual permitimos bypass para comodidad de pruebas
      if (process.env.NODE_ENV === 'development') {
        req.user = {
          id: '00000000-0000-0000-0000-000000000000',
          email: 'admin@importacolectiva.com',
          user_metadata: {
            full_name: 'Desarrollador de Pruebas',
            role: 'admin'
          }
        };
        return handler(req, res);
      }
      return res.status(401).json({ error: 'No autorizado: sesión inválida o expirada.' });
    }

    // Adjuntar el usuario al request para que el handler lo pueda usar
    req.user = user;

    return handler(req, res);
  };
}
