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
    const isApiDocs = req.headers.referer?.includes('api-docs') || req.headers.referer?.includes('api/doc');

    // Bypass para api-docs en desarrollo cuando no se proveen credenciales
    if (!authHeader && isApiDocs && process.env.NODE_ENV === 'development') {
      req.token = 'mock-admin-token';
      req.user = {
        id: '00000000-0000-0000-0000-000000000000',
        email: 'admin@importacolectiva.com',
        user_metadata: {
          nombre: 'Desarrollador de Pruebas',
          rol: 'Administrador'
        }
      };
      return handler(req, res);
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No autorizado: token no proporcionado.' });
    }

    const token = authHeader.split(' ')[1];
    req.token = token;

    // Si es el token mock de admin en desarrollo, inyectamos directamente el usuario mock
    if (token === 'mock-admin-token' && process.env.NODE_ENV === 'development') {
      req.user = {
        id: '00000000-0000-0000-0000-000000000000',
        email: 'admin@importacolectiva.com',
        user_metadata: {
          nombre: 'Desarrollador de Pruebas',
          rol: 'Administrador'
        }
      };
      return handler(req, res);
    }

    // Verificar el token con Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'No autorizado: sesión inválida o expirada.' });
    }

    // Adjuntar el usuario al request para que el handler lo pueda usar
    req.user = user;

    return handler(req, res);
  };
}
