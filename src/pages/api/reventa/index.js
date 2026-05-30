import { supabase } from '@/lib/supabaseClient';
import { authMiddleware } from '@/middleware/authMiddleware';

export default async function handler(req, res) {
  await new Promise((resolve) => authMiddleware(req, res, resolve));
  if (res.headersSent) return;

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('reventa')
        .select(`
          id,
          precio,
          motivo,
          estado,
          producto (
            id,
            nombre,
            image,
            descripcion
          )
        `)
        .eq('estado', 'Disponible')
        .order('id', { ascending: false });

      if (error) throw error;
      
      return res.status(200).json(data || []);
    } catch (error) {
      console.error('[API Reventa] Error fetching opportunities:', error);
      return res.status(500).json({ error: 'Error fetching resale opportunities' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
