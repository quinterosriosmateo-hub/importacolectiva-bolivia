import { createClient } from '@supabase/supabase-js';

/**
 * withRole — Middleware de autorización por rol para rutas API de Next.js.
 *
 * Debe usarse DESPUÉS de withAuth (o de forma combinada). Verifica que el
 * usuario autenticado (req.user) tenga uno de los roles permitidos consultando
 * la tabla public.usuario.
 *
 * Uso:
 *   export default withAuth(withRole(['Administrador'], async function handler(req, res) {
 *     res.json({ ok: true });
 *   }));
 *
 * @param {string[]} allowedRoles - Lista de roles permitidos, ej: ['Administrador']
 * @param {Function} handler      - El handler de la ruta API
 */

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export function withRole(allowedRoles, handler) {
  return async function (req, res) {
    if (!req.user) {
      return res.status(401).json({ code: 1, error: 'No autorizado: sesión requerida.' });
    }

    // Bypass para el ID mock de desarrollo
    if (req.user.id === '00000000-0000-0000-0000-000000000000' && process.env.NODE_ENV === 'development') {
      req.userRole = 'Administrador';
      return handler(req, res);
    }

    try {
      // Consultar el rol real desde la tabla public.usuario
      const { data: profile, error } = await supabaseAdmin
        .from('usuario')
        .select('rol, estado')
        .eq('id', req.user.id)
        .maybeSingle();

      if (error || !profile) {
        return res.status(403).json({ code: 1, error: 'Acceso denegado: perfil no encontrado.' });
      }

      if (!allowedRoles.includes(profile.rol)) {
        return res.status(403).json({
          code: 1,
          error: `Acceso denegado: se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}.`,
        });
      }

      if (profile.estado === 'suspendido' || profile.estado === 'baneado') {
        return res.status(403).json({
          code: 1,
          error: 'Tu cuenta está suspendida o baneada. Contacta al soporte.',
        });
      }

      // Adjuntar el rol al request para uso posterior en el handler
      req.userRole = profile.rol;

      return handler(req, res);
    } catch (err) {
      console.error('[withRole] Error al verificar rol:', err);
      return res.status(500).json({ code: 1, error: 'Error interno al verificar permisos.' });
    }
  };
}
