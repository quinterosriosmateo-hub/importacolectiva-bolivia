import { categoryController } from '@/controllers/categoryController';
import { withAuth } from '@/lib/withAuth';
import { withRole } from '@/lib/withRole';

/**
 * @swagger
 * /api/admin/categories:
 *   get:
 *     summary: Lista todas las categorías y sus estadísticas
 *     tags:
 *       - Admin Categories
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista devuelta exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Prohibido
 *   post:
 *     summary: Crea una nueva categoría de producto
 *     tags:
 *       - Admin Categories
 *     security:
 *       - BearerAuth: []
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
 *                 example: "Ferretería y Construcción"
 *     responses:
 *       201:
 *         description: Categoría creada
 *       400:
 *         description: Input inválido
 *       401:
 *         description: No autorizado
 */
async function handler(req, res) {
  if (req.method === 'GET') {
    return await categoryController.getCategories(req, res);
  } else if (req.method === 'POST') {
    return await categoryController.createCategory(req, res);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ code: 1, error: `Method ${req.method} Not Allowed` });
  }
}

export default withAuth(withRole(['Administrador'], handler));
