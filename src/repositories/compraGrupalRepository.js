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

const mockCompras = [
  {
    id: 1,
    titulo: 'Lote de 50 Laptops Lenovo',
    estado: 'Abierta',
    cupo_maximo: 50,
    costo_total: 25000,
    producto_id: 1,
    meta_minima: 30,
    fecha_cierre: '2026-12-31',
    imagen_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=400',
    participantes_count: 12
  },
  {
    id: 2,
    titulo: 'Contenedor de Scooters Eléctricos',
    estado: 'En proceso',
    cupo_maximo: 100,
    costo_total: 15000,
    producto_id: 2,
    meta_minima: 80,
    fecha_cierre: '2026-06-15',
    imagen_url: 'https://images.unsplash.com/photo-1593813957805-4c6328325cc1?q=80&w=400',
    participantes_count: 85
  }
];

export const compraGrupalRepository = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('compra_grupal')
        .select(`
          *,
          participante_compra (count)
        `)
        .order('id', { ascending: false });

      if (error) {
        console.warn('Error fetching compra_grupal (using mock fallback):', error);
        return mockCompras;
      }

      if (!data || data.length === 0) return mockCompras;

      return data.map(item => ({
        ...item,
        participantes_count: item.participante_compra?.[0]?.count || 0
      }));
    } catch (err) {
      console.warn('Network error in compraGrupalRepository.getAll (fallback):', err);
      return mockCompras;
    }
  },

  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('compra_grupal')
        .select(`
          *,
          producto (id, nombre, precio, image),
          proveedor (id, nombre, pais, estado_verificacion),
          participante_compra (
            id,
            usuario_id,
            monto,
            estado_pago
          )
        `)
        .eq('id', id)
        .single();

      if (error || !data) {
        console.warn(`Error fetching compra_grupal ${id} (using mock fallback):`, error);
        return mockCompras.find(c => c.id === parseInt(id));
      }
      
      data.participantes_count = data.participante_compra ? data.participante_compra.length : 0;
      return data;
    } catch (err) {
      console.warn(`Error in compraGrupalRepository.getById for ${id} (fallback):`, err);
      return mockCompras.find(c => c.id === parseInt(id));
    }
  },

  async getMyPurchases(token) {
    const client = getAuthenticatedClient(token);
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) return { error: new Error('No autorizado') };

    const { data: compras, error } = await client
      .from('participante_compra')
      .select(`
        id,
        monto,
        estado_pago,
        hito_actual,
        estado_aduanas,
        compra_grupal (
          id,
          titulo,
          estado,
          imagen_url,
          fecha_cierre,
          meta_minima,
          participante_compra (count)
        )
      `)
      .eq('usuario_id', user.id)
      .order('id', { ascending: false });

    return { compras, error };
  },

  async create(data, token) {
    const client = getAuthenticatedClient(token);
    const { titulo, estado, cupo_maximo, costo_total, producto_id, proveedor_id, meta_minima, fecha_cierre, imagen_url, tipo_capacidad } = data;

    const { data: compra, error } = await client
      .from('compra_grupal')
      .insert({ titulo, estado, cupo_maximo, costo_total, producto_id, proveedor_id, meta_minima, fecha_cierre, imagen_url, tipo_capacidad })
      .select()
      .single();

    return { compra, error };
  },

  async update(id, data, token) {
    const client = getAuthenticatedClient(token);
    
    const { data: compra, error } = await client
      .from('compra_grupal')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    return { compra, error };
  },

  async join(compra_grupal_id, monto, token) {
    const client = getAuthenticatedClient(token);
    
    // Obtenemos el usuario autenticado
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) return { error: new Error('No autorizado') };

    const { data: participante, error } = await client
      .from('participante_compra')
      .insert({
        usuario_id: user.id,
        compra_grupal_id,
        monto,
        estado_pago: 'Pendiente',
        hito_actual: 1
      })
      .select()
      .single();

    return { participante, error };
  },

  async leave(compra_grupal_id, token) {
    const client = getAuthenticatedClient(token);
    
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) return { error: new Error('No autorizado') };

    const { error } = await client
      .from('participante_compra')
      .delete()
      .eq('compra_grupal_id', compra_grupal_id)
      .eq('usuario_id', user.id);

    return { error };
  },

  async advanceMilestone(participante_id, next_hito, token) {
    const client = getAuthenticatedClient(token);
    // Lógica para avanzar hitos (Ej: de Hito 1 Anticipo -> Hito 2 Aduanas)
    const { data: participante, error } = await client
      .from('participante_compra')
      .update({ hito_actual: next_hito, estado_pago: 'Pendiente' }) // Reset payment status for the new milestone
      .eq('id', participante_id)
      .select()
      .single();

    return { participante, error };
  }
};
