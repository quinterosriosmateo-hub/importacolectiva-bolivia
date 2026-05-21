import { categoryController } from '@/controllers/categoryController';
import { withAuth } from '@/lib/withAuth';
import { withRole } from '@/lib/withRole';

/**
 * @swagger
 * /api/admin/categories/{id}:
 *   put:
 *     summary: Actualiza el nombre de una categoría existente
 *     tags:
 *       - Admin Categories
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Moda y Accesorios"
 *     responses:
 *       200:
 *         description: Categoría actualizada
 *       400:
 *         description: Error en input o base de datos
 *       401:
 *         description: No autorizado
 *   delete:
 *     summary: Elimina una categoría del sistema
 *     tags:
 *       - Admin Categories
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Categoría eliminada
 *       400:
 *         description: Error de integridad o base de datos
 *       401:
 *         description: No autorizado
 */
async function handler(req, res) {
  if (req.method === 'PUT') {
    return await categoryController.updateCategory(req, res);
  } else if (req.method === 'DELETE') {
    return await categoryController.deleteCategory(req, res);
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).json({ code: 1, error: `Method ${req.method} Not Allowed` });
  }
}

export default withAuth(withRole(['Administrador'], handler));
