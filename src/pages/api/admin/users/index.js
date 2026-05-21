import { adminController } from '@/controllers/adminController';
import { withAuth } from '@/lib/withAuth';
import { withRole } from '@/lib/withRole';

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Lista paginada de usuarios (solo Administrador)
 *     tags:
 *       - Admin
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Búsqueda parcial por nombre o email
 *       - in: query
 *         name: rol
 *         schema:
 *           type: string
 *           enum: [Cliente, Premium, Asesor, Proveedor/Agente, Administrador]
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [activo, suspendido, baneado]
 *     responses:
 *       200:
 *         description: Lista de usuarios con paginación
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Rol insuficiente
 */
async function handler(req, res) {
  return await adminController.listUsers(req, res);
}

export default withAuth(withRole(['Administrador'], handler));
