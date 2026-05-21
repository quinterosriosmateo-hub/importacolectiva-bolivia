import { adminRepository } from '@/repositories/adminRepository';

/**
 * adminService — Lógica de negocio para el panel administrador.
 */
export const adminService = {
  /**
   * Lista usuarios paginados con filtros.
   */
  async listUsers(opts, token) {
    const { data, count, error } = await adminRepository.listUsers(opts, token);
    if (error) return { users: null, count: 0, error };
    return { users: data, count, error: null };
  },

  /**
   * Obtiene el detalle de un usuario.
   */
  async getUserById(userId, token) {
    const { data, error } = await adminRepository.getUserById(userId, token);
    if (error) return { user: null, error };
    if (!data) return { user: null, error: new Error('Usuario no encontrado.') };
    return { user: data, error: null };
  },

  /**
   * Actualiza el rol y/o estado de un usuario.
   * Impide que un administrador se modifique a sí mismo el rol.
   *
   * @param {string} adminId  - ID del admin que ejecuta la acción
   * @param {string} userId   - ID del usuario a modificar
   * @param {object} updates  - { rol?, estado? }
   * @param {string} token    - Token JWT de Supabase
   */
  async updateUser(adminId, userId, updates, token) {
    // Regla de negocio: un admin no puede cambiar su propio rol
    if (adminId === userId && updates.rol !== undefined) {
      return {
        user: null,
        error: new Error('No puedes modificar tu propio rol desde el panel.'),
      };
    }

    const { data, error } = await adminRepository.updateUser(userId, updates, token);
    if (error) return { user: null, error };
    if (!data) return { user: null, error: new Error('No se pudo actualizar el usuario.') };
    return { user: data, error: null };
  },

  /**
   * Devuelve estadísticas del sistema de usuarios.
   */
  async getStats(token) {
    const { stats, error } = await adminRepository.getStats(token);
    if (error) return { stats: null, error };
    return { stats, error: null };
  },
};
