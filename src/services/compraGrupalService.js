import { compraGrupalRepository } from '@/repositories/compraGrupalRepository';

// Estados válidos del ciclo de vida de una compra grupal
const ESTADOS_VALIDOS = [
  'Abierta',
  'En proceso',
  'Pagada',
  'En tránsito',
  'En aduana',
  'Lista para retiro',
  'Completada',
  'Cancelada'
];

const TRANSICIONES_VALIDAS = {
  'Abierta':            ['En proceso', 'Cancelada'],
  'En proceso':         ['Pagada', 'Cancelada'],
  'Pagada':             ['En tránsito', 'Cancelada'],
  'En tránsito':        ['En aduana'],
  'En aduana':          ['Lista para retiro'],
  'Lista para retiro':  ['Completada'],
  'Completada':         [],
  'Cancelada':          []
};

export const compraGrupalService = {

  // ─────────────────────────────────────────────
  // LECTURA
  // ─────────────────────────────────────────────

  async getAll(token) {
    return await compraGrupalRepository.getAll(token);
  },

  async getById(id, token) {
    return await compraGrupalRepository.getById(id, token);
  },

  async getMyPurchases(token) {
    if (!token) return { error: new Error('Token requerido') };
    return await compraGrupalRepository.getMyPurchases(token);
  },

  async getParticipants(compra_grupal_id, token) {
    if (!compra_grupal_id) return { error: new Error('ID requerido') };
    return await compraGrupalRepository.getParticipants(compra_grupal_id, token);
  },

  async getChatMessages(compra_grupal_id, token) {
    if (!token) return { error: new Error('Token requerido') };
    if (!compra_grupal_id) return { error: new Error('ID de compra requerido') };
    return await compraGrupalRepository.getChatMessages(compra_grupal_id, token);
  },

  // ─────────────────────────────────────────────
  // ESCRITURA
  // ─────────────────────────────────────────────

  async create(data, token) {
    if (!data.titulo || !data.producto_id || !data.cupo_maximo) {
      return { error: new Error('Faltan datos obligatorios: titulo, producto_id, cupo_maximo') };
    }
    if (data.meta_minima && data.meta_minima > data.cupo_maximo) {
      return { error: new Error('La meta mínima no puede superar el cupo máximo') };
    }
    return await compraGrupalRepository.create(data, token);
  },

  async update(id, data, token) {
    if (!id) return { error: new Error('ID requerido') };
    return await compraGrupalRepository.update(id, data, token);
  },

  async join(id, monto, cantidad, metodo, referencia, comprobante_url, token) {
    if (!token) return { error: new Error('Token requerido') };
    if (!id) return { error: new Error('ID de compra requerido') };
    return await compraGrupalRepository.join(id, monto || 0, cantidad || 1, metodo, referencia, comprobante_url, token);
  },

  async leave(id, token) {
    if (!token) return { error: new Error('Token requerido') };
    if (!id) return { error: new Error('ID de compra requerido') };
    return await compraGrupalRepository.leave(id, token);
  },

  // ─────────────────────────────────────────────
  // TRANSICIÓN DE ESTADOS
  // ─────────────────────────────────────────────

  async transitionState(id, newState, token) {
    if (!token) return { error: new Error('Token requerido') };
    if (!ESTADOS_VALIDOS.includes(newState)) {
      return { error: new Error(`Estado inválido: ${newState}`) };
    }

    // Verificar que la transición sea válida
    const compra = await compraGrupalRepository.getById(id);
    if (!compra) return { error: new Error('Compra grupal no encontrada') };

    const transicionesPermitidas = TRANSICIONES_VALIDAS[compra.estado] || [];
    if (!transicionesPermitidas.includes(newState)) {
      return {
        error: new Error(
          `No se puede pasar de "${compra.estado}" a "${newState}". ` +
          `Transiciones válidas: ${transicionesPermitidas.join(', ') || 'ninguna'}`
        )
      };
    }

    return await compraGrupalRepository.transitionState(id, newState, token);
  },

  // ─────────────────────────────────────────────
  // ESCROW / RETENCIONES
  // ─────────────────────────────────────────────

  async registrarPago(compra_grupal_id, usuario_id, monto, metodo, referencia, comprobante_url, token) {
    if (!token) return { error: new Error('Token requerido') };
    if (!compra_grupal_id || !monto || !metodo) {
      return { error: new Error('Faltan datos: compra_grupal_id, monto, metodo') };
    }
    return await compraGrupalRepository.registrarPagoEscrow(
      compra_grupal_id, usuario_id, monto, metodo, referencia, comprobante_url, token
    );
  },

  async confirmarPago(participante_id, token) {
    if (!token) return { error: new Error('Token requerido') };
    if (!participante_id) return { error: new Error('participante_id requerido') };
    return await compraGrupalRepository.confirmarPago(participante_id, token);
  },

  async liberarEscrow(compra_grupal_id, token) {
    if (!token) return { error: new Error('Token requerido') };
    return await compraGrupalRepository.releaseEscrow(compra_grupal_id, token);
  },

  async reembolsarTodos(compra_grupal_id, token) {
    if (!token) return { error: new Error('Token requerido') };
    return await compraGrupalRepository.refundAll(compra_grupal_id, token);
  },

  // ─────────────────────────────────────────────
  // CHAT GRUPAL
  // ─────────────────────────────────────────────

  async sendMessage(compra_grupal_id, usuario_id, contenido, token) {
    if (!token) return { error: new Error('Token requerido') };
    if (!contenido || contenido.trim().length === 0) {
      return { error: new Error('El mensaje no puede estar vacío') };
    }
    if (contenido.length > 1000) {
      return { error: new Error('El mensaje no puede exceder 1000 caracteres') };
    }
    return await compraGrupalRepository.sendChatMessage(
      compra_grupal_id, usuario_id, contenido.trim(), token
    );
  },

  // ─────────────────────────────────────────────
  // DISTRIBUCIÓN DE COSTOS
  // ─────────────────────────────────────────────

  async distribuirCostos(compra_grupal_id, costoLogistico, costoAduana, tipoDivision, token) {
    if (!token) return { error: new Error('Token requerido') };
    if (!compra_grupal_id) return { error: new Error('ID de compra requerido') };

    const costoTotal = parseFloat(costoLogistico || 0) + parseFloat(costoAduana || 0);
    if (costoTotal <= 0) {
      return { error: new Error('Los costos deben ser mayores a 0') };
    }

    // Verificar que la compra esté en estado correcto
    const compra = await compraGrupalRepository.getById(compra_grupal_id);
    if (!compra) return { error: new Error('Compra grupal no encontrada') };

    const estadosValidos = ['Pagada', 'En tránsito', 'En aduana'];
    if (!estadosValidos.includes(compra.estado)) {
      return { error: new Error(`Solo se pueden distribuir costos en estados: ${estadosValidos.join(', ')}`) };
    }

    return await compraGrupalRepository.distributeCosts(
      compra_grupal_id, costoLogistico, costoAduana, tipoDivision, token
    );
  },

  // ─────────────────────────────────────────────
  // CIERRE AUTOMÁTICO Y ABANDONO
  // ─────────────────────────────────────────────

  async checkExpiradas() {
    return await compraGrupalRepository.closeExpiredGroups();
  },

  async checkAbandonos() {
    return await compraGrupalRepository.checkAbandonExpiry();
  },

  async crearRegistrosAbandono(compra_grupal_id, diasLimite, token) {
    if (!token) return { error: new Error('Token requerido') };
    return await compraGrupalRepository.createAbandonRecords(
      compra_grupal_id, diasLimite || 15, token
    );
  },

  // ─────────────────────────────────────────────
  // LEGACY
  // ─────────────────────────────────────────────

  async advanceMilestone(participante_id, next_hito, token) {
    if (!token) return { error: new Error('Token requerido') };
    return await compraGrupalRepository.advanceMilestone(participante_id, next_hito, token);
  }
};
