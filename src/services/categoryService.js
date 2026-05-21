import { categoryRepository } from '@/repositories/categoryRepository';

export const categoryService = {
  /**
   * Retorna todas las categorías con la cantidad de productos asociados.
   */
  async getCategories(token) {
    return await categoryRepository.getAll(token);
  },

  /**
   * Crea una nueva categoría con validación de negocio.
   */
  async createCategory(nombre, token) {
    if (!nombre || nombre.trim() === '') {
      return { data: null, error: new Error('El nombre de la categoría no puede estar vacío.') };
    }
    
    // Normalizar
    const nombreLimpio = nombre.trim();
    return await categoryRepository.create(nombreLimpio, token);
  },

  /**
   * Actualiza una categoría existente con validación.
   */
  async updateCategory(id, nombre, token) {
    if (!id) {
      return { data: null, error: new Error('El ID de la categoría es requerido.') };
    }
    if (!nombre || nombre.trim() === '') {
      return { data: null, error: new Error('El nombre de la categoría no puede estar vacío.') };
    }

    const nombreLimpio = nombre.trim();
    return await categoryRepository.update(id, nombreLimpio, token);
  },

  /**
   * Elimina una categoría.
   */
  async deleteCategory(id, token) {
    if (!id) {
      return { data: null, error: new Error('El ID de la categoría es requerido.') };
    }
    return await categoryRepository.delete(id, token);
  }
};
