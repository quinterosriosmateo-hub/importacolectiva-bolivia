import { proveedorRepository } from '@/repositories/proveedorRepository';

export const proveedorService = {
  async getAll() {
    return await proveedorRepository.getAll();
  },

  async getById(id) {
    return await proveedorRepository.getById(id);
  },

  async create(data, token) {
    if (!data.nombre) {
      return { error: new Error('El nombre del proveedor es requerido') };
    }
    return await proveedorRepository.create(data, token);
  },

  async update(id, data, token) {
    if (!id) return { error: new Error('ID requerido') };
    return await proveedorRepository.update(id, data, token);
  },

  async delete(id, token) {
    if (!id) return { error: new Error('ID requerido') };
    return await proveedorRepository.delete(id, token);
  }
};
