import { adminController } from '@/controllers/adminController';
import { withAuth } from '@/lib/withAuth';
import { withRole } from '@/lib/withRole';

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Estadísticas resumidas de usuarios (solo Administrador)
 *     tags:
 *       - Admin
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas de usuarios
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Rol insuficiente
 */
async function handler(req, res) {
  return await adminController.getStats(req, res);
}

export default withAuth(withRole(['Administrador'], handler));
