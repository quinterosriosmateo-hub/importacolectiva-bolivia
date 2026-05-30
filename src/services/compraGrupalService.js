import { compraGrupalRepository } from '@/repositories/compraGrupalRepository';

export const compraGrupalService = {
  async getAll() {
    return await compraGrupalRepository.getAll();
  },

  async getById(id) {
    return await compraGrupalRepository.getById(id);
  },

  async getMyPurchases(token) {
    if (!token) return { error: new Error('Token requerido') };
    return await compraGrupalRepository.getMyPurchases(token);
  },

  async create(data, token) {
    if (!data.titulo || !data.producto_id || !data.cupo_maximo) {
      return { error: new Error('Faltan datos obligatorios para crear la compra grupal') };
    }
    return await compraGrupalRepository.create(data, token);
  },

  async update(id, data, token) {
    return await compraGrupalRepository.update(id, data, token);
  },

  async join(id, monto, token) {
    if (!token) return { error: new Error('Token requerido') };
    return await compraGrupalRepository.join(id, monto, token);
  },

  async leave(id, token) {
    if (!token) return { error: new Error('Token requerido') };
    return await compraGrupalRepository.leave(id, token);
  }
};
