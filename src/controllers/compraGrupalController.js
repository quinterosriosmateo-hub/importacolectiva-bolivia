import { compraGrupalService } from '@/services/compraGrupalService';

export const compraGrupalController = {
  async getAll(req, res) {
    try {
      const compras = await compraGrupalService.getAll();
      return res.status(200).json(compras);
    } catch (error) {
      console.error('[compraGrupalController.getAll] Error:', error);
      return res.status(500).json({ error: 'Error al obtener compras grupales' });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.query;
      const compra = await compraGrupalService.getById(id);
      if (!compra) return res.status(404).json({ error: 'Compra grupal no encontrada' });
      return res.status(200).json(compra);
    } catch (error) {
      console.error('[compraGrupalController.getById] Error:', error);
      return res.status(500).json({ error: 'Error al obtener detalle de compra grupal' });
    }
  },

  async getMyPurchases(req, res) {
    try {
      const { compras, error } = await compraGrupalService.getMyPurchases(req.token);
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json(compras);
    } catch (error) {
      console.error('[compraGrupalController.getMyPurchases] Error:', error);
      return res.status(500).json({ error: 'Error al obtener mis compras' });
    }
  },

  async create(req, res) {
    try {
      const { titulo, estado, cupo_maximo, costo_total, producto_id, meta_minima, fecha_cierre, imagen_url, tipo_capacidad } = req.body;
      const { compra, error } = await compraGrupalService.create(
        { titulo, estado, cupo_maximo, costo_total, producto_id, meta_minima, fecha_cierre, imagen_url, tipo_capacidad },
        req.token
      );
      if (error) return res.status(400).json({ error: error.message });
      return res.status(201).json({ message: 'Compra grupal creada', compra });
    } catch (error) {
      console.error('[compraGrupalController.create] Error:', error);
      return res.status(500).json({ error: 'Error interno al crear compra grupal' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.query;
      const data = req.body;
      const { compra, error } = await compraGrupalService.update(id, data, req.token);
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ message: 'Compra grupal actualizada', compra });
    } catch (error) {
      console.error('[compraGrupalController.update] Error:', error);
      return res.status(500).json({ error: 'Error interno al actualizar compra grupal' });
    }
  },

  async join(req, res) {
    try {
      const { id } = req.query;
      const { monto } = req.body; // Puede ser opcional si el costo se divide automáticamente
      const { participante, error } = await compraGrupalService.join(id, monto, req.token);
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ message: 'Te has unido a la compra grupal', participante });
    } catch (error) {
      console.error('[compraGrupalController.join] Error:', error);
      return res.status(500).json({ error: 'Error interno al unirse' });
    }
  },

  async leave(req, res) {
    try {
      const { id } = req.query;
      const { error } = await compraGrupalService.leave(id, req.token);
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ message: 'Has salido de la compra grupal' });
    } catch (error) {
      console.error('[compraGrupalController.leave] Error:', error);
      return res.status(500).json({ error: 'Error interno al salir' });
    }
  }
};
