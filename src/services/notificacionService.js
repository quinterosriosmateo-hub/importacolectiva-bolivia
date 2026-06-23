import { supabase } from '@/lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';

const getAuthenticatedClient = (token) => {
  if (!token) return supabase;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
};

/**
 * Crea una o varias notificaciones para usuarios.
 * 
 * @param {Array<{usuario_id, tipo, titulo, mensaje, url}>} notificaciones
 */
export async function crearNotificaciones(notificaciones) {
  if (!notificaciones || notificaciones.length === 0) return;
  const { error } = await supabase.from('notificacion').insert(notificaciones);
  if (error) console.error('[notificacionService] Error al insertar notificaciones:', error);
}

/**
 * Mensajes predefinidos por tipo de evento de compra grupal.
 */
export const NOTIF_TIPOS = {
  ESTADO_CAMBIADO:          'estado_cambiado',
  ENTREGA_LISTA:            'entrega_lista',
  ENTREGA_CONFIRMADA_ADMIN: 'entrega_confirmada_admin',
  ENTREGA_CONFIRMADA_TOTAL: 'entrega_confirmada_total',
  PAGO_CONFIRMADO:          'pago_confirmado',
  SALDO_PENDIENTE:          'saldo_pendiente',
};

const ESTADO_MENSAJES = {
  'En proceso':        { titulo: '🚀 Tu importación avanzó', mensaje: 'La compra grupal "{{titulo}}" pasó a la fase de pago. Por favor confirma tu participación.' },
  'Pagada':            { titulo: '✅ Pagos confirmados',     mensaje: 'La compra grupal "{{titulo}}" está completamente pagada. ¡Pronto se envía!' },
  'En tránsito':       { titulo: '🚢 En camino',             mensaje: 'Tu pedido en "{{titulo}}" está en tránsito hacia Bolivia.' },
  'En aduana':         { titulo: '⚖️ En aduana',             mensaje: 'Tu pedido en "{{titulo}}" está en proceso aduanero. Pronto disponible.' },
  'Lista para retiro': { titulo: '📦 ¡Listo para retirar!', mensaje: 'Tu pedido de "{{titulo}}" está listo para ser retirado. ¡Ve a confirmarlo!' },
  'Completada':        { titulo: '🎉 Importación completada', mensaje: 'La compra grupal "{{titulo}}" fue completada exitosamente.' },
  'Cancelada':         { titulo: '❌ Compra cancelada',      mensaje: 'La compra grupal "{{titulo}}" fue cancelada. Se procesará tu reembolso.' },
  'Entregada':         { titulo: '📦 ¡Listo para retirar!', mensaje: 'Tu pedido de "{{titulo}}" está listo. ¡Entra y confirma la recepción!' },
};

/**
 * Notifica a todos los participantes de una compra grupal sobre un cambio de estado.
 */
export async function notificarCambioEstado(compraGrupalId, nuevoEstado, tituloCompra, token) {
  const client = getAuthenticatedClient(token);

  const msgTemplate = ESTADO_MENSAJES[nuevoEstado];
  if (!msgTemplate) return; // Estado sin mensaje predefinido

  const { data: participantes } = await client
    .from('participante_compra')
    .select('usuario_id')
    .eq('compra_grupal_id', compraGrupalId);

  if (!participantes || participantes.length === 0) return;

  const url = `/compras-grupales/${compraGrupalId}`;
  const mensaje = msgTemplate.mensaje.replace('{{titulo}}', tituloCompra);

  const notificaciones = participantes.map((p) => ({
    usuario_id: p.usuario_id,
    tipo:       NOTIF_TIPOS.ESTADO_CAMBIADO,
    titulo:     msgTemplate.titulo,
    mensaje,
    url,
  }));

  await crearNotificaciones(notificaciones);
}

/**
 * Notifica al cliente que el admin confirmó su entrega.
 */
export async function notificarEntregaAdmin(usuarioId, tituloCompra, compraGrupalId) {
  await crearNotificaciones([{
    usuario_id: usuarioId,
    tipo:       NOTIF_TIPOS.ENTREGA_LISTA,
    titulo:     '📦 ¡Tu pedido está listo!',
    mensaje:    `El administrador confirmó que tu mercancía de "${tituloCompra}" está lista. Por favor confirma la recepción.`,
    url:        `/compras-grupales/${compraGrupalId}`,
  }]);
}

/**
 * Notifica al admin que el cliente confirmó la recepción.
 */
export async function notificarEntregaCliente(adminIds, tituloCompra, compraGrupalId, nombreCliente) {
  if (!adminIds || adminIds.length === 0) return;
  await crearNotificaciones(adminIds.map((uid) => ({
    usuario_id: uid,
    tipo:       NOTIF_TIPOS.ENTREGA_CONFIRMADA_TOTAL,
    titulo:     '✅ Cliente confirmó recepción',
    mensaje:    `${nombreCliente} confirmó haber recibido su mercancía de "${tituloCompra}".`,
    url:        `/admin/compras-grupales/${compraGrupalId}`,
  })));
}
