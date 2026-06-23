import { supabase } from '@/lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';
import { notificarCambioEstado, notificarEntregaAdmin, notificarEntregaCliente } from '@/services/notificacionService';

const getAuthenticatedClient = (token) => {
  if (!token) return supabase;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        },
        fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' })
      }
    }
  );
};

// getAdminClient eliminado: el contador participantes_count
// se actualiza de forma atómica mediante un TRIGGER en Supabase.

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
  // ─────────────────────────────────────────────
  // LECTURA
  // ─────────────────────────────────────────────

  async getAll(token) {
    try {
      const client = getAuthenticatedClient(token);
      const { data, error } = await client
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
        participantes_count: item.participantes_count ?? item.participante_compra?.[0]?.count ?? 0
      }));
    } catch (err) {
      console.warn('Network error in compraGrupalRepository.getAll (fallback):', err);
      return mockCompras;
    }
  },

  async getById(id, token) {
    try {
      const client = getAuthenticatedClient(token);
      const { data, error } = await client
        .from('compra_grupal')
        .select(`
          *,
          producto (id, nombre, precio, image, descripcion, cbm, peso_kg),
          proveedor (id, nombre, pais, estado_verificacion),
          participante_compra (
            id,
            usuario_id,
            monto,
            monto_final,
            estado_pago,
            hito_actual,
            estado_aduanas,
            es_premium,
            fecha_ingreso,
            pago_id,
            confirmacion_entrega_admin,
            confirmacion_entrega_cliente
          )
        `)
        .eq('id', id)
        .single();

      if (error || !data) {
        console.warn(`Error fetching compra_grupal ${id} (using mock fallback):`, error);
        return mockCompras.find(c => c.id === parseInt(id));
      }

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
        monto_final,
        monto_ajuste,
        estado_pago,
        hito_actual,
        estado_aduanas,
        es_premium,
        fecha_ingreso,
        compra_grupal_id,
        confirmacion_entrega_admin,
        confirmacion_entrega_cliente,
        compra_grupal (
          id,
          titulo,
          estado,
          imagen_url,
          fecha_cierre,
          meta_minima,
          cupo_maximo,
          costo_logistico,
          costo_aduana,
          participante_compra (count)
        )
      `)
      .eq('usuario_id', user.id)
      .order('id', { ascending: false });

    return { compras, error };
  },

  async getParticipants(compra_grupal_id, token) {
    const client = getAuthenticatedClient(token);
    const { data, error } = await client
      .from('participante_compra')
      .select(`
        id,
        usuario_id,
        monto,
        monto_final,
        estado_pago,
        hito_actual,
        es_premium,
        fecha_ingreso,
        confirmacion_entrega_admin,
        confirmacion_entrega_cliente,
        usuario (id, nombre, avatar_url, rol, reputacion)
      `)
      .eq('compra_grupal_id', compra_grupal_id)
      .order('fecha_ingreso', { ascending: true });

    return { data, error };
  },

  async getExpiredGroups() {
    const { data, error } = await supabase
      .from('compra_grupal')
      .select('id, titulo, meta_minima, fecha_cierre, participantes_count')
      .eq('estado', 'Abierta')
      .lt('fecha_cierre', new Date().toISOString());

    return { data, error };
  },

  async isUserParticipant(compra_grupal_id, usuario_id) {
    const { data, error } = await supabase
      .from('participante_compra')
      .select('id, estado_pago')
      .eq('compra_grupal_id', compra_grupal_id)
      .eq('usuario_id', usuario_id)
      .single();

    return { data, error };
  },

  // ─────────────────────────────────────────────
  // ESCRITURA / MUTACIONES
  // ─────────────────────────────────────────────

  async create(data, token) {
    const client = getAuthenticatedClient(token);
    const {
      titulo, estado, cupo_maximo, costo_total, producto_id, proveedor_id,
      meta_minima, fecha_cierre, imagen_url, tipo_capacidad, descripcion,
      costo_logistico, costo_aduana, created_by
    } = data;

    const { data: compra, error } = await client
      .from('compra_grupal')
      .insert({
        titulo, estado: estado || 'Abierta', cupo_maximo, costo_total,
        producto_id, proveedor_id, meta_minima, fecha_cierre, imagen_url,
        tipo_capacidad, descripcion, costo_logistico, costo_aduana, created_by
      })
      .select()
      .single();

    return { compra, error };
  },

  async update(id, data, token) {
    const client = getAuthenticatedClient(token);

    let oldEstado = null;
    let oldPrecioCongelado = null;
    if (data.estado) {
      const { data: current } = await client
        .from('compra_grupal')
        .select('estado, precio_congelado')
        .eq('id', id)
        .single();
      if (current) {
        oldEstado = current.estado;
        oldPrecioCongelado = current.precio_congelado;
      }
    }

    const updateData = { ...data };
    if (data.estado === 'En proceso' && oldEstado !== 'En proceso' && !oldPrecioCongelado) {
      const { data: compra } = await client
        .from('compra_grupal')
        .select('costo_total, cupo_maximo')
        .eq('id', id)
        .single();

      if (compra && compra.cupo_maximo > 0) {
        updateData.precio_congelado = parseFloat(compra.costo_total) / compra.cupo_maximo;
      }
    }

    const { data: compra, error } = await client
      .from('compra_grupal')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (!error && compra && data.estado && oldEstado !== data.estado) {
      notificarCambioEstado(id, data.estado, compra.titulo, token).catch(console.error);
    }

    return { compra, error };
  },

  async transitionState(id, newState, token) {
    const client = getAuthenticatedClient(token);
    const updateData = { estado: newState };

    // Si alcanzó la meta y pasa a "En proceso", congelamos el precio
    if (newState === 'En proceso') {
      const { data: compra } = await client
        .from('compra_grupal')
        .select('costo_total, cupo_maximo, participantes_count')
        .eq('id', id)
        .single();

      if (compra && compra.cupo_maximo > 0) {
        updateData.precio_congelado = parseFloat(compra.costo_total) / compra.cupo_maximo;
      }
    }

    const { data: compra, error } = await client
      .from('compra_grupal')
      .update(updateData)
      .eq('id', id)
      .select('id, titulo, estado')
      .single();

    if (!error && compra) {
      // Notificar async a todos los participantes (sin bloquear la respuesta)
      notificarCambioEstado(id, newState, compra.titulo, token).catch(console.error);
    }

    return { compra, error };
  },

  async freezePrice(id, precioCongelado, token) {
    const client = getAuthenticatedClient(token);
    const { data: compra, error } = await client
      .from('compra_grupal')
      .update({ precio_congelado: precioCongelado })
      .eq('id', id)
      .select('id, precio_congelado')
      .single();

    return { compra, error };
  },

  // ─────────────────────────────────────────────
  // JOIN / LEAVE CON ESCROW
  // ─────────────────────────────────────────────

  async join(compra_grupal_id, monto, cantidad = 1, metodo = null, referencia = null, comprobante_url = null, token) {
    const client = getAuthenticatedClient(token);

    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) return { error: new Error('No autorizado') };

    // Verificar si ya es participante
    const { data: existing } = await client
      .from('participante_compra')
      .select('id')
      .eq('compra_grupal_id', compra_grupal_id)
      .eq('usuario_id', user.id)
      .single();

    if (existing) return { error: new Error('Ya eres participante de esta compra grupal') };

    // Verificar cupo y estado
    const { data: compra } = await client
      .from('compra_grupal')
      .select('estado, cupo_maximo, participantes_count, meta_minima')
      .eq('id', compra_grupal_id)
      .single();

    if (!compra) return { error: new Error('Compra grupal no encontrada') };
    if (compra.estado !== 'Abierta') return { error: new Error('Esta compra grupal ya no acepta nuevos participantes') };
    if ((compra.participantes_count + cantidad) > compra.cupo_maximo) return { error: new Error('La cantidad solicitada supera el cupo disponible') };

    // Verificar si el usuario es premium
    const { data: usuarioData } = await client
      .from('usuario')
      .select('rol')
      .eq('id', user.id)
      .single();

    const esPremium = usuarioData?.rol === 'Premium';

    const { data: participante, error } = await client
      .from('participante_compra')
      .insert({
        usuario_id: user.id,
        compra_grupal_id,
        monto,
        cantidad,
        estado_pago: 'Pendiente',
        hito_actual: 1,
        es_premium: esPremium,
        fecha_ingreso: new Date().toISOString()
      })
      .select()
      .single();

    if (error) return { error };

    // Si se envía método de pago, registrar el pago (retención) automáticamente
    if (metodo) {
      const { pago, error: pagoErr } = await this.registrarPagoEscrow(
        compra_grupal_id, user.id, monto, metodo, referencia, comprobante_url, token
      );
      if (pagoErr) return { error: pagoErr };
    }

    // NOTA: participantes_count se actualiza automáticamente vía TRIGGER en Supabase.
    // No hay condición de carrera ni necesidad de adminClient.

    return { participante, error: null };
  },

  async leave(compra_grupal_id, token) {
    const client = getAuthenticatedClient(token);

    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) return { error: new Error('No autorizado') };

    // Obtener participación para saber el pago_id
    const { data: participacion } = await client
      .from('participante_compra')
      .select('id, pago_id, estado_pago')
      .eq('compra_grupal_id', compra_grupal_id)
      .eq('usuario_id', user.id)
      .single();

    if (!participacion) return { error: new Error('No eres participante de esta compra') };

    // Si tiene un pago retenido, marcarlo como reembolsado
    if (participacion.pago_id) {
      await client
        .from('pago')
        .update({ estado: 'Reembolsado', estado_retencion: 'reembolsado' })
        .eq('id', participacion.pago_id);
    }

    const { error } = await client
      .from('participante_compra')
      .delete()
      .eq('compra_grupal_id', compra_grupal_id)
      .eq('usuario_id', user.id);

    // NOTA: participantes_count se actualiza automáticamente vía TRIGGER en Supabase
    // al hacer DELETE en participante_compra.

    return { error };
  },

  // ─────────────────────────────────────────────
  // ESCROW / RETENCIONES
  // ─────────────────────────────────────────────

  async registrarPagoEscrow(compra_grupal_id, usuario_id, monto, metodo, referencia, comprobante_url, token) {
    const client = getAuthenticatedClient(token);

    // Crear el pago con estado retenido
    const { data: pago, error: pagoError } = await client
      .from('pago')
      .insert({
        usuario_id,
        monto,
        metodo,
        estado: 'Retenido',
        fecha: new Date().toISOString(),
        compra_grupal_id,
        estado_retencion: 'retenido',
        referencia_externa: referencia,
        comprobante_url
      })
      .select()
      .single();

    if (pagoError) return { error: pagoError };

    // Vincular el pago al participante
    const { error: updateError } = await client
      .from('participante_compra')
      .update({ pago_id: pago.id, estado_pago: 'Parcial' })
      .eq('compra_grupal_id', compra_grupal_id)
      .eq('usuario_id', usuario_id);

    return { pago, error: updateError };
  },

  async confirmarPago(participante_id, token) {
    const client = getAuthenticatedClient(token);

    const { data: participante } = await client
      .from('participante_compra')
      .select('pago_id, compra_grupal_id')
      .eq('id', participante_id)
      .single();

    if (!participante) return { error: new Error('Participante no encontrado') };

    // Marcar pago como confirmado
    if (participante.pago_id) {
      await client
        .from('pago')
        .update({ estado: 'Pagado', estado_retencion: 'retenido' })
        .eq('id', participante.pago_id);
    }

    const { data, error } = await client
      .from('participante_compra')
      .update({ estado_pago: 'Pagado' })
      .eq('id', participante_id)
      .select()
      .single();

    // Verificar si TODOS pagaron => transición automática a "Pagada"
    if (!error) {
      const { data: pendientes } = await client
        .from('participante_compra')
        .select('id')
        .eq('compra_grupal_id', participante.compra_grupal_id)
        .neq('estado_pago', 'Pagado');

      if (!pendientes || pendientes.length === 0) {
        await this.releaseEscrow(participante.compra_grupal_id, token);
      }
    }

    return { data, error };
  },

  async releaseEscrow(compra_grupal_id, token) {
    const client = getAuthenticatedClient(token);

    // Liberar todos los pagos retenidos
    await client
      .from('pago')
      .update({ estado: 'Pagado', estado_retencion: 'liberado' })
      .eq('compra_grupal_id', compra_grupal_id)
      .eq('estado_retencion', 'retenido');

    // Transicionar grupo a "Pagada"
    return await this.transitionState(compra_grupal_id, 'Pagada', token);
  },

  async refundAll(compra_grupal_id, token) {
    const client = getAuthenticatedClient(token);

    // Reembolsar todos los pagos retenidos
    await client
      .from('pago')
      .update({ estado: 'Reembolsado', estado_retencion: 'reembolsado' })
      .eq('compra_grupal_id', compra_grupal_id)
      .in('estado_retencion', ['retenido', 'libre']);

    // Marcar participantes como reembolsados
    await client
      .from('participante_compra')
      .update({ estado_pago: 'Reembolsado' })
      .eq('compra_grupal_id', compra_grupal_id);

    // Transicionar a "Cancelada"
    return await this.transitionState(compra_grupal_id, 'Cancelada', token);
  },

  // ─────────────────────────────────────────────
  // DISTRIBUCIÓN DE COSTOS
  // ─────────────────────────────────────────────

  async distributeCosts(compra_grupal_id, costoLogistico, costoAduana, tipoDivision, token) {
    const client = getAuthenticatedClient(token);

    // Obtener participantes
    const { data: participantes, error } = await client
      .from('participante_compra')
      .select('id, monto, usuario_id')
      .eq('compra_grupal_id', compra_grupal_id)
      .eq('estado_pago', 'Pagado');

    if (error || !participantes || participantes.length === 0) {
      return { error: error || new Error('No hay participantes con pago confirmado') };
    }

    const costoExtra = parseFloat(costoLogistico || 0) + parseFloat(costoAduana || 0);
    const costoPorParticipante = costoExtra / participantes.length;

    // Actualizar montos finales
    for (const p of participantes) {
      const montoFinal = parseFloat(p.monto) + costoPorParticipante;
      await client
        .from('participante_compra')
        .update({
          monto_ajuste: costoPorParticipante,
          monto_final: montoFinal,
          estado_pago: 'Saldo Pendiente'
        })
        .eq('id', p.id);
    }

    // Actualizar costos en la compra grupal
    await client
      .from('compra_grupal')
      .update({ costo_logistico: costoLogistico, costo_aduana: costoAduana })
      .eq('id', compra_grupal_id);

    return { distribuido: participantes.length, costoPorParticipante, error: null };
  },

  // ─────────────────────────────────────────────
  // ENTREGA
  // ─────────────────────────────────────────────

  async confirmarEntrega(participante_id, rol, token) {
    const client = getAuthenticatedClient(token);

    // Obtener datos del participante para validar
    const { data: participante, error: fetchError } = await client
      .from('participante_compra')
      .select('id, usuario_id, compra_grupal_id, compra_grupal(estado)')
      .eq('id', participante_id)
      .single();

    if (fetchError || !participante) return { error: new Error('Participante no encontrado') };

    // Validar que la compra esté en fase de entrega
    const estadoCompra = participante.compra_grupal?.estado;
    const estadosPermitidos = ['Lista para retiro', 'Entregada'];
    if (!estadosPermitidos.includes(estadoCompra)) {
      return { error: new Error(`Solo se puede confirmar entrega cuando la compra está en: ${estadosPermitidos.join(', ')}`) };
    }

    // Si es Cliente, verificar que sea el dueño de la participación
    if (rol === 'Cliente') {
      const { data: { user }, error: authError } = await client.auth.getUser();
      if (authError || !user) return { error: new Error('No autorizado') };
      if (participante.usuario_id !== user.id) {
        return { error: new Error('No puedes confirmar la entrega de otro participante') };
      }
    }

    // Definir los campos a actualizar según el rol
    const updates = {};
    if (rol === 'Admin') {
      updates.confirmacion_entrega_admin = true;
      updates.fecha_confirmacion_admin = new Date().toISOString();
    } else if (rol === 'Cliente') {
      updates.confirmacion_entrega_cliente = true;
      updates.fecha_confirmacion_cliente = new Date().toISOString();
    }

    const { data, error } = await client
      .from('participante_compra')
      .update(updates)
      .eq('id', participante_id)
      .select('id, usuario_id, confirmacion_entrega_admin, confirmacion_entrega_cliente, compra_grupal_id')
      .single();

    if (!error && data) {
      // Obtener título de la compra grupal para las notificaciones
      const { data: compra } = await supabase
        .from('compra_grupal')
        .select('titulo')
        .eq('id', participante.compra_grupal_id)
        .single();

      const tituloCompra = compra?.titulo || 'la compra grupal';

      if (rol === 'Admin') {
        // Notificar al cliente que el admin confirmó su entrega
        notificarEntregaAdmin(participante.usuario_id, tituloCompra, participante.compra_grupal_id)
          .catch(console.error);
      } else if (rol === 'Cliente') {
        // Notificar a los admins que el cliente confirmó
        const { data: admins } = await supabase
          .from('usuario')
          .select('id')
          .eq('rol', 'Administrador');

        const { data: usuarioInfo } = await supabase
          .from('usuario')
          .select('nombre')
          .eq('id', participante.usuario_id)
          .single();

        const adminIds = (admins || []).map((a) => a.id);
        notificarEntregaCliente(adminIds, tituloCompra, participante.compra_grupal_id, usuarioInfo?.nombre || 'El cliente')
          .catch(console.error);
      }
    }

    return { data, error: error || null };
  },

  // ─────────────────────────────────────────────
  // CIERRE AUTOMÁTICO POR TIEMPO LÍMITE
  // ─────────────────────────────────────────────

  async closeExpiredGroups() {
    // Obtener grupos expirados sin meta alcanzada
    const { data: expirados, error } = await supabase
      .from('compra_grupal')
      .select('id, titulo, meta_minima, participantes_count')
      .eq('estado', 'Abierta')
      .lt('fecha_cierre', new Date().toISOString());

    if (error || !expirados) return { cerrados: [], error };

    const cerrados = [];
    for (const grupo of expirados) {
      if ((grupo.participantes_count || 0) < grupo.meta_minima) {
        // No alcanzó la meta => Cancelar y reembolsar
        const { error: refundError } = await this.refundAll(grupo.id, null);
        if (!refundError) cerrados.push({ id: grupo.id, titulo: grupo.titulo });
      }
    }

    return { cerrados, error: null };
  },

  // ─────────────────────────────────────────────
  // CHAT GRUPAL
  // ─────────────────────────────────────────────

  async getChatMessages(compra_grupal_id, token) {
    const client = getAuthenticatedClient(token);

    const { data, error } = await client
      .from('mensaje_grupal')
      .select(`
        id,
        contenido,
        created_at,
        usuario_id,
        usuario (id, nombre, avatar_url, rol)
      `)
      .eq('compra_grupal_id', compra_grupal_id)
      .order('created_at', { ascending: true })
      .limit(100);

    return { data, error };
  },

  async sendChatMessage(compra_grupal_id, usuario_id, contenido, token) {
    const client = getAuthenticatedClient(token);

    const { data, error } = await client
      .from('mensaje_grupal')
      .insert({
        compra_grupal_id,
        usuario_id,
        contenido,
        created_at: new Date().toISOString()
      })
      .select(`
        id,
        contenido,
        created_at,
        usuario_id,
        usuario (id, nombre, avatar_url, rol)
      `)
      .single();

    return { data, error };
  },

  // ─────────────────────────────────────────────
  // ABANDONO Y REVENTA AUTOMÁTICA
  // ─────────────────────────────────────────────

  async createAbandonRecords(compra_grupal_id, diasLimite = 15, token) {
    const client = getAuthenticatedClient(token);

    const { data: participantes, error } = await client
      .from('participante_compra')
      .select('id, usuario_id, compra_grupal_id')
      .eq('compra_grupal_id', compra_grupal_id)
      .eq('estado_pago', 'Pagado');

    if (error || !participantes) return { error };

    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + diasLimite);

    const { data: compra } = await client
      .from('compra_grupal')
      .select('producto_id')
      .eq('id', compra_grupal_id)
      .single();

    const records = participantes.map(p => ({
      participante_compra_id: p.id,
      usuario_id: p.usuario_id,
      compra_grupal_id: p.compra_grupal_id,
      producto_id: compra?.producto_id,
      fecha_limite_reclamo: fechaLimite.toISOString(),
      estado: 'pendiente'
    }));

    const { data, error: insertError } = await client
      .from('abandono_participante')
      .insert(records)
      .select();

    return { data, error: insertError };
  },

  async checkAbandonExpiry() {
    // Buscar abandonos cuyo tiempo expiró y aún están pendientes
    const { data: vencidos, error } = await supabase
      .from('abandono_participante')
      .select('id, usuario_id, compra_grupal_id, producto_id')
      .eq('estado', 'pendiente')
      .lt('fecha_limite_reclamo', new Date().toISOString());

    if (error || !vencidos) return { error };

    const reventados = [];
    for (const abandono of vencidos) {
      // Obtener datos del producto para el precio de reventa
      const { data: producto } = await supabase
        .from('producto')
        .select('precio, nombre')
        .eq('id', abandono.producto_id)
        .single();

      // Crear registro en reventa
      const { data: reventa } = await supabase
        .from('reventa')
        .insert({
          producto_id: abandono.producto_id,
          precio: producto ? producto.precio * 0.8 : 0, // 80% del precio original
          motivo: 'abandono',
          estado: 'disponible'
        })
        .select()
        .single();

      // Marcar como abandonado
      await supabase
        .from('abandono_participante')
        .update({
          estado: 'abandonado',
          fecha_abandono: new Date().toISOString(),
          reventa_id: reventa?.id
        })
        .eq('id', abandono.id);

      reventados.push({ abandono_id: abandono.id, reventa_id: reventa?.id });
    }

    return { reventados, error: null };
  },

  async claimProduct(abandono_id, token) {
    const client = getAuthenticatedClient(token);
    const { data: { user } } = await client.auth.getUser();

    const { data, error } = await client
      .from('abandono_participante')
      .update({ estado: 'reclamado' })
      .eq('id', abandono_id)
      .eq('usuario_id', user.id)
      .eq('estado', 'pendiente')
      .select()
      .single();

    return { data, error };
  },

  // ─────────────────────────────────────────────
  // LEGACY
  // ─────────────────────────────────────────────

  async advanceMilestone(participante_id, next_hito, token) {
    const client = getAuthenticatedClient(token);
    const { data: participante, error } = await client
      .from('participante_compra')
      .update({ hito_actual: next_hito, estado_pago: 'Pendiente' })
      .eq('id', participante_id)
      .select()
      .single();

    return { participante, error };
  }
};
