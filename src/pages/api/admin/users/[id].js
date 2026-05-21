import { adminController } from '@/controllers/adminController';
import { withAuth } from '@/lib/withAuth';
import { withRole } from '@/lib/withRole';

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Detalle de un usuario (solo Administrador)
 *     tags:
 *       - Admin
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Datos del usuario
 *       404:
 *         description: Usuario no encontrado
 *   patch:
 *     summary: Actualiza rol y/o estado de un usuario (solo Administrador)
 *     tags:
 *       - Admin
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rol:
 *                 type: string
 *                 enum: [Cliente, Premium, Asesor, Proveedor/Agente, Administrador]
 *               estado:
 *                 type: string
 *                 enum: [activo, suspendido, baneado]
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       400:
 *         description: Error de validación
 *       403:
 *         description: Rol insuficiente o automodificación prohibida
 */
async function handler(req, res) {
  if (req.method === 'GET') {
    return await adminController.getUserById(req, res);
  }
  if (req.method === 'PATCH') {
    return await adminController.updateUser(req, res);
  }

  res.setHeader('Allow', ['GET', 'PATCH']);
  return res.status(405).json({ code: 1, error: `Method ${req.method} Not Allowed` });
}

export default withAuth(withRole(['Administrador'], handler));
