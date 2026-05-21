import { adminService } from '@/services/adminService';

/**
 * adminController — Controlador HTTP para el panel administrador.
 */
export const adminController = {
  /**
   * GET /api/admin/users
   * Lista usuarios con paginación, búsqueda y filtros.
   * Query params: page, search, rol, estado
   */
  async listUsers(req, res) {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ code: 1, error: `Method ${req.method} Not Allowed` });
    }

    const page = parseInt(req.query.page) || 1;
    const search = req.query.search || '';
    const rol = req.query.rol || '';
    const estado = req.query.estado || '';

    if (page < 1) {
      return res.status(400).json({ code: 1, error: 'El número de página debe ser mayor a 0.' });
    }

    try {
      const { users, count, error } = await adminService.listUsers({ page, search, rol, estado }, req.token);

      if (error) {
        return res.status(400).json({ code: 1, error: error.message });
      }

      return res.status(200).json({
        code: 0,
        message: 'Operación exitosa',
        users,
        count,
        page,
        pageSize: 25,
        totalPages: Math.ceil(count / 25),
      });
    } catch (err) {
      return res.status(500).json({ code: 1, error: 'Error interno al listar usuarios.' });
    }
  },

  /**
   * GET /api/admin/users/stats
   * Devuelve estadísticas resumidas de usuarios.
   */
  async getStats(req, res) {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ code: 1, error: `Method ${req.method} Not Allowed` });
    }

    try {
      const { stats, error } = await adminService.getStats(req.token);

      if (error) {
        return res.status(400).json({ code: 1, error: error.message });
      }

      return res.status(200).json({ code: 0, message: 'Operación exitosa', stats });
    } catch (err) {
      return res.status(500).json({ code: 1, error: 'Error interno al obtener estadísticas.' });
    }
  },

  /**
   * GET /api/admin/users/[id]
   * Retorna el detalle de un usuario.
   */
  async getUserById(req, res) {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ code: 1, error: `Method ${req.method} Not Allowed` });
    }

    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ code: 1, error: 'El ID de usuario es requerido.' });
    }

    try {
      const { user, error } = await adminService.getUserById(id, req.token);

      if (error) {
        return res.status(404).json({ code: 1, error: error.message });
      }

      return res.status(200).json({ code: 0, message: 'Operación exitosa', user });
    } catch (err) {
      return res.status(500).json({ code: 1, error: 'Error interno al obtener el usuario.' });
    }
  },

  /**
   * PATCH /api/admin/users/[id]
   * Actualiza rol y/o estado de un usuario.
   * Body: { rol?, estado? }
   */
  async updateUser(req, res) {
    if (req.method !== 'PATCH') {
      res.setHeader('Allow', ['PATCH']);
      return res.status(405).json({ code: 1, error: `Method ${req.method} Not Allowed` });
    }

    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ code: 1, error: 'El ID de usuario es requerido.' });
    }

    const { rol, estado } = req.body || {};

    if (!rol && !estado) {
      return res.status(400).json({ code: 1, error: 'Debes proporcionar al menos un campo: rol o estado.' });
    }

    const updates = {};
    if (rol !== undefined) updates.rol = rol;
    if (estado !== undefined) updates.estado = estado;

    try {
      const { user, error } = await adminService.updateUser(req.user.id, id, updates, req.token);

      if (error) {
        return res.status(400).json({ code: 1, error: error.message });
      }

      return res.status(200).json({ code: 0, message: 'Usuario actualizado con éxito.', user });
    } catch (err) {
      return res.status(500).json({ code: 1, error: 'Error interno al actualizar el usuario.' });
    }
  },
};
