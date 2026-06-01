import { proveedorService } from '@/services/proveedorService';

export const proveedorController = {
  async getAll(req, res) {
    try {
      const { proveedores, error } = await proveedorService.getAll();
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(proveedores);
    } catch (err) {
      return res.status(500).json({ error: 'Error interno al obtener proveedores' });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.query;
      const { proveedor, error } = await proveedorService.getById(id);
      if (error) return res.status(404).json({ error: 'Proveedor no encontrado' });
      return res.status(200).json(proveedor);
    } catch (err) {
      return res.status(500).json({ error: 'Error interno al obtener proveedor' });
    }
  },

  async create(req, res) {
    try {
      const { proveedor, error } = await proveedorService.create(req.body, req.token);
      if (error) return res.status(400).json({ error: error.message });
      return res.status(201).json(proveedor);
    } catch (err) {
      return res.status(500).json({ error: 'Error interno al crear proveedor' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.query;
      const { proveedor, error } = await proveedorService.update(id, req.body, req.token);
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json(proveedor);
    } catch (err) {
      return res.status(500).json({ error: 'Error interno al actualizar proveedor' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.query;
      const { error } = await proveedorService.delete(id, req.token);
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ message: 'Proveedor eliminado' });
    } catch (err) {
      return res.status(500).json({ error: 'Error interno al eliminar proveedor' });
    }
  }
};
