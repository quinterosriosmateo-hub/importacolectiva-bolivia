import { compraGrupalService } from '@/services/compraGrupalService';

export const compraGrupalController = {

  // ─────────────────────────────────────────────
  // LECTURA
  // ─────────────────────────────────────────────

  async getAll(req, res) {
    try {
      const authHeader = req.headers.authorization || '';
      const token = req.token || authHeader.replace(/^Bearer\s+/i, '').trim();
      const compras = await compraGrupalService.getAll(token);
      return res.status(200).json(compras);
    } catch (error) {
      console.error('[compraGrupalController.getAll]', error);
      return res.status(500).json({ error: 'Error al obtener compras grupales' });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.query;
      const authHeader = req.headers.authorization || '';
      const token = req.token || authHeader.replace(/^Bearer\s+/i, '').trim();
      const compra = await compraGrupalService.getById(id, token);
      if (!compra) return res.status(404).json({ error: 'Compra grupal no encontrada' });
      return res.status(200).json(compra);
    } catch (error) {
      console.error('[compraGrupalController.getById]', error);
      return res.status(500).json({ error: 'Error al obtener compra grupal' });
    }
  },

  async getMyPurchases(req, res) {
    try {
      const { compras, error } = await compraGrupalService.getMyPurchases(req.token);
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json(compras || []);
    } catch (error) {
      console.error('[compraGrupalController.getMyPurchases]', error);
      return res.status(500).json({ error: 'Error al obtener mis compras' });
    }
  },

  async getParticipants(req, res) {
    try {
      const { id } = req.query;
      const authHeader = req.headers.authorization || '';
      const token = req.token || authHeader.replace(/^Bearer\s+/i, '').trim();
      const { data, error } = await compraGrupalService.getParticipants(id, token);
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json(data || []);
    } catch (error) {
      console.error('[compraGrupalController.getParticipants]', error);
      return res.status(500).json({ error: 'Error al obtener participantes' });
    }
  },

  async getChatMessages(req, res) {
    try {
      const { id } = req.query;
      const { data, error } = await compraGrupalService.getChatMessages(id, req.token);
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json(data || []);
    } catch (error) {
      console.error('[compraGrupalController.getChatMessages]', error);
      return res.status(500).json({ error: 'Error al obtener mensajes' });
    }
  },

  // ─────────────────────────────────────────────
  // ESCRITURA
  // ─────────────────────────────────────────────

  async create(req, res) {
    try {
      const { compra, error } = await compraGrupalService.create(req.body, req.token);
      if (error) return res.status(400).json({ error: error.message });
      return res.status(201).json({ message: 'Compra grupal creada', compra });
    } catch (error) {
      console.error('[compraGrupalController.create]', error);
      return res.status(500).json({ error: 'Error al crear compra grupal' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.query;
      const { compra, error } = await compraGrupalService.update(id, req.body, req.token);
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ message: 'Compra grupal actualizada', compra });
    } catch (error) {
      console.error('[compraGrupalController.update]', error);
      return res.status(500).json({ error: 'Error al actualizar compra grupal' });
    }
  },

  async join(req, res) {
    try {
      const { id } = req.query;
      const { monto, cantidad, metodo, referencia, comprobante_url } = req.body;
      const { participante, error } = await compraGrupalService.join(id, monto, cantidad, metodo, referencia, comprobante_url, req.token);
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ message: 'Te has unido a la compra grupal', participante });
    } catch (error) {
      console.error('[compraGrupalController.join]', error);
      return res.status(500).json({ error: 'Error al unirse' });
    }
  },

  async leave(req, res) {
    try {
      const { id } = req.query;
      const { error } = await compraGrupalService.leave(id, req.token);
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ message: 'Has salido de la compra grupal' });
    } catch (error) {
      console.error('[compraGrupalController.leave]', error);
      return res.status(500).json({ error: 'Error al salir' });
    }
  },

  // ─────────────────────────────────────────────
  // ESTADO
  // ─────────────────────────────────────────────

  async transitionState(req, res) {
    try {
      const { id } = req.query;
      const { estado } = req.body;
      if (!estado) return res.status(400).json({ error: 'El campo "estado" es requerido' });
      const { compra, error } = await compraGrupalService.transitionState(id, estado, req.token);
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ message: `Estado cambiado a "${estado}"`, compra });
    } catch (error) {
      console.error('[compraGrupalController.transitionState]', error);
      return res.status(500).json({ error: 'Error al cambiar estado' });
    }
  },

  // ─────────────────────────────────────────────
  // ESCROW
  // ─────────────────────────────────────────────

  async registrarPago(req, res) {
    try {
      const { id } = req.query;
      const { usuario_id, monto, metodo, referencia, comprobante_url } = req.body;
      const { pago, error } = await compraGrupalService.registrarPago(
        id, usuario_id, monto, metodo, referencia, comprobante_url, req.token
      );
      if (error) return res.status(400).json({ error: error.message });
      return res.status(201).json({ message: 'Pago registrado en retención', pago });
    } catch (error) {
      console.error('[compraGrupalController.registrarPago]', error);
      return res.status(500).json({ error: 'Error al registrar pago' });
    }
  },

  async confirmarPago(req, res) {
    try {
      const { participante_id } = req.body;
      const { data, error } = await compraGrupalService.confirmarPago(participante_id, req.token);
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ message: 'Pago confirmado', data });
    } catch (error) {
      console.error('[compraGrupalController.confirmarPago]', error);
      return res.status(500).json({ error: 'Error al confirmar pago' });
    }
  },

  // ─────────────────────────────────────────────
  // CHAT
  // ─────────────────────────────────────────────

  async sendChatMessage(req, res) {
    try {
      const { id } = req.query;
      const { usuario_id, contenido } = req.body;
      const { data, error } = await compraGrupalService.sendMessage(id, usuario_id, contenido, req.token);
      if (error) return res.status(400).json({ error: error.message });
      return res.status(201).json(data);
    } catch (error) {
      console.error('[compraGrupalController.sendChatMessage]', error);
      return res.status(500).json({ error: 'Error al enviar mensaje' });
    }
  },

  // ─────────────────────────────────────────────
  // DISTRIBUCIÓN DE COSTOS
  // ─────────────────────────────────────────────

  async distribuirCostos(req, res) {
    try {
      const { id } = req.query;
      const { costo_logistico, costo_aduana, tipo_division } = req.body;
      const result = await compraGrupalService.distribuirCostos(
        id, costo_logistico, costo_aduana, tipo_division, req.token
      );
      if (result.error) return res.status(400).json({ error: result.error.message });
      return res.status(200).json({ message: 'Costos distribuidos', ...result });
    } catch (error) {
      console.error('[compraGrupalController.distribuirCostos]', error);
      return res.status(500).json({ error: 'Error al distribuir costos' });
    }
  },

  // ─────────────────────────────────────────────
  // ENTREGA
  // ─────────────────────────────────────────────

  async confirmarEntrega(req, res) {
    try {
      const { participanteId } = req.query;
      const { rol } = req.body; // 'Admin' o 'Cliente'
      const result = await compraGrupalService.confirmarEntrega(participanteId, rol, req.token);
      if (result.error) return res.status(400).json({ error: result.error.message });
      return res.status(200).json({ message: 'Entrega confirmada', ...result });
    } catch (error) {
      console.error('[compraGrupalController.confirmarEntrega]', error);
      return res.status(500).json({ error: 'Error al confirmar entrega' });
    }
  },

  // ─────────────────────────────────────────────
  // CRON JOBS
  // ─────────────────────────────────────────────

  async checkExpiradas(req, res) {
    try {
      const { cerrados, error } = await compraGrupalService.checkExpiradas();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ message: `${cerrados.length} grupos cerrados`, cerrados });
    } catch (error) {
      console.error('[compraGrupalController.checkExpiradas]', error);
      return res.status(500).json({ error: 'Error al verificar grupos expirados' });
    }
  },

  async checkAbandonos(req, res) {
    try {
      const { reventados, error } = await compraGrupalService.checkAbandonos();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ message: `${reventados.length} abandonos procesados`, reventados });
    } catch (error) {
      console.error('[compraGrupalController.checkAbandonos]', error);
      return res.status(500).json({ error: 'Error al verificar abandonos' });
    }
  }
};
