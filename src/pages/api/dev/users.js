import { supabase } from '@/lib/supabaseClient';

/**
 * GET /api/dev/users
 * Solo disponible en entorno de desarrollo (NODE_ENV !== 'production').
 * Devuelve la lista de correos y nombres de usuarios registrados en public.usuario.
 * Útil para el modal de login simulado con Google.
 */
export default async function handler(req, res) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ code: 1, error: 'Not found' });
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ code: 1, error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { data, error } = await supabase
      .from('usuario')
      .select('id, email, nombre, rol, avatar_url')
      .order('nombre', { ascending: true })
      .limit(50);

    if (error) {
      return res.status(500).json({ code: 1, error: error.message });
    }

    return res.status(200).json({ code: 0, users: data ?? [] });
  } catch (err) {
    return res.status(500).json({ code: 1, error: 'Error al obtener usuarios de desarrollo.' });
  }
}
