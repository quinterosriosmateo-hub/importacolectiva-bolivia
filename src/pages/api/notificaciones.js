// GET  /api/notificaciones      → obtener las notificaciones del usuario
// PATCH /api/notificaciones     → marcar todas como leídas
// PATCH /api/notificaciones?id  → marcar una como leída
import { authMiddleware } from '@/middleware/authMiddleware';
import { supabase } from '@/lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';

async function handler(req, res) {
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${req.token}` } } }
  );

  const { data: { user } } = await client.auth.getUser();
  if (!user) return res.status(401).json({ error: 'No autorizado' });

  if (req.method === 'GET') {
    const { data, error } = await client
      .from('notificacion')
      .select('*')
      .eq('usuario_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data || []);
  }

  if (req.method === 'PATCH') {
    const { id } = req.query;
    const filter = client.from('notificacion').update({ leida: true }).eq('usuario_id', user.id);
    const { error } = id ? await filter.eq('id', id) : await filter.eq('leida', false);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', ['GET', 'PATCH']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default authMiddleware()(handler);
