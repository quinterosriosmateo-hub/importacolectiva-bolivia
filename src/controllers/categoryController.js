import { categoryService } from '@/services/categoryService';

export const categoryController = {
  /**
   * GET /api/admin/categories
   * Lista todas las categorías
   */
  async getCategories(req, res) {
    try {
      const categories = await categoryService.getCategories(req.token);
      return res.status(200).json({ code: 0, categories });
    } catch (err) {
      console.error('[categoryController.getCategories] Error:', err);
      return res.status(500).json({ code: 1, error: 'Error al obtener las categorías del sistema.' });
    }
  },

  /**
   * POST /api/admin/categories
   * Crea una nueva categoría
   */
  async createCategory(req, res) {
    const { nombre } = req.body;
    if (!nombre) {
      return res.status(400).json({ code: 1, error: 'El nombre de la categoría es requerido.' });
    }

    try {
      const { data, error } = await categoryService.createCategory(nombre, req.token);
      if (error) {
        return res.status(400).json({ code: 1, error: error.message });
      }
      return res.status(201).json({ code: 0, message: 'Categoría creada con éxito.', category: data });
    } catch (err) {
      console.error('[categoryController.createCategory] Error:', err);
      return res.status(500).json({ code: 1, error: 'Error interno del servidor al crear la categoría.' });
    }
  },

  /**
   * PUT /api/admin/categories/[id]
   * Actualiza el nombre de una categoría
   */
  async updateCategory(req, res) {
    const { id } = req.query;
    const { nombre } = req.body;

    if (!id) {
      return res.status(400).json({ code: 1, error: 'El ID de la categoría es requerido.' });
    }
    if (!nombre) {
      return res.status(400).json({ code: 1, error: 'El nombre de la categoría es requerido.' });
    }

    try {
      const { data, error } = await categoryService.updateCategory(id, nombre, req.token);
      if (error) {
        return res.status(400).json({ code: 1, error: error.message });
      }
      return res.status(200).json({ code: 0, message: 'Categoría actualizada con éxito.', category: data });
    } catch (err) {
      console.error('[categoryController.updateCategory] Error:', err);
      return res.status(500).json({ code: 1, error: 'Error interno al actualizar la categoría.' });
    }
  },

  /**
   * DELETE /api/admin/categories/[id]
   * Elimina una categoría
   */
  async deleteCategory(req, res) {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ code: 1, error: 'El ID de la categoría es requerido.' });
    }

    try {
      const { error } = await categoryService.deleteCategory(id, req.token);
      if (error) {
        return res.status(400).json({ code: 1, error: error.message });
      }
      return res.status(200).json({ code: 0, message: 'Categoría eliminada con éxito.' });
    } catch (err) {
      console.error('[categoryController.deleteCategory] Error:', err);
      return res.status(500).json({ code: 1, error: 'Error interno al eliminar la categoría.' });
    }
  }
};
