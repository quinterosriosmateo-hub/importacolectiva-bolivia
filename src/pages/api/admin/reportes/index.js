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

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const token = req.headers.authorization?.split(' ')[1];
  const client = getAuthenticatedClient(token);

  // Authenticate user
  const { data: { user }, error: authError } = await client.auth.getUser();
  if (authError || !user) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    // Verificar rol de admin
    const { data: usuarioData } = await client
      .from('usuario')
      .select('rol')
      .eq('id', user.id)
      .single();

    if (!usuarioData || (usuarioData.rol !== 'Administrador' && usuarioData.rol !== 'Admin')) {
       return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
    }

    // 1. Obtener pagos
    const { data: pagos, error: pagosError } = await client
      .from('pago')
      .select(`
        id,
        monto,
        metodo,
        estado,
        estado_retencion,
        fecha,
        referencia_externa,
        usuario:usuario_id (nombre, email),
        compra_grupal:compra_grupal_id (titulo)
      `)
      .order('fecha', { ascending: false });

    // 2. Obtener estadísticas agregadas (Total Recaudado, Pendiente)
    const { data: pagosStats } = await client
      .from('pago')
      .select('monto, estado, estado_retencion');

    let totalRecaudado = 0;
    let totalRetenido = 0;
    let totalReembolsado = 0;

    if (pagosStats) {
      pagosStats.forEach(p => {
        const monto = parseFloat(p.monto) || 0;
        if (p.estado === 'Pagado' || p.estado_retencion === 'liberado') {
          totalRecaudado += monto;
        } else if (p.estado === 'Retenido' || p.estado_retencion === 'retenido') {
          totalRetenido += monto;
        } else if (p.estado === 'Reembolsado') {
          totalReembolsado += monto;
        }
      });
    }

    return res.status(200).json({
      pagos: pagos || [],
      stats: {
        totalRecaudado,
        totalRetenido,
        totalReembolsado
      }
    });

  } catch (error) {
    console.error('Error in /api/admin/reportes:', error);
    return res.status(500).json({ error: 'Error del servidor al obtener reportes.' });
  }
}
