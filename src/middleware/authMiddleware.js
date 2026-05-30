import { supabase } from '@/lib/supabaseClient';

/**
 * Authentication and Authorization Middleware for API Routes (Pages Router).
 * @param {string[]} allowedRoles - Array of roles allowed to access the route.
 */
export const authMiddleware = (allowedRoles = []) => (handler) => async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { data: profile } = await supabase
    .from('usuario')
    .select('rol')
    .eq('id', user.id)
    .single();

  if (allowedRoles.length > 0 && (!profile || !allowedRoles.includes(profile?.rol))) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  req.user = { ...user, role: profile?.rol };
  req.token = token;
  return handler(req, res);
};