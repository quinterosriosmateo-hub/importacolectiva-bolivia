import { productController } from '@/controllers/productController';
import { withAuth } from '@/lib/withAuth';
import { withRole } from '@/lib/withRole';

/**
 * @swagger
 * /api/admin/products:
 *   get:
 *     summary: Lista todos los productos para administración
 *     tags:
 *       - Admin Products
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre o descripción
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *         description: Filtrar por estado de producto
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: integer
 *         description: Filtrar por categoría
 *     responses:
 *       200:
 *         description: Lista de productos devuelta
 *   post:
 *     summary: Crea un producto nuevo
 *     tags:
 *       - Admin Products
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               precio:
 *                 type: number
 *               stock:
 *                 type: integer
 *               estado:
 *                 type: string
 *               image:
 *                 type: string
 *               categorias:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: Producto creado
 */

async function handler(req, res) {
  if (req.method === 'GET') {
    return await productController.getAdminProducts(req, res);
  } else if (req.method === 'POST') {
    return await productController.createProduct(req, res);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ code: 1, error: `Method ${req.method} Not Allowed` });
  }
}

export default withAuth(withRole(['Administrador'], handler));
