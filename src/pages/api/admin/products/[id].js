import { productController } from '@/controllers/productController';
import { withAuth } from '@/lib/withAuth';
import { withRole } from '@/lib/withRole';

/**
 * @swagger
 * /api/admin/products/{id}:
 *   put:
 *     summary: Actualiza un producto existente
 *     tags:
 *       - Admin Products
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
 *       200:
 *         description: Producto actualizado
 *   delete:
 *     summary: Elimina un producto
 *     tags:
 *       - Admin Products
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
 *         description: Producto eliminado
 */

async function handler(req, res) {
  if (req.method === 'PUT') {
    return await productController.updateProduct(req, res);
  } else if (req.method === 'DELETE') {
    return await productController.deleteProduct(req, res);
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).json({ code: 1, error: `Method ${req.method} Not Allowed` });
  }
}

export default withAuth(withRole(['Administrador'], handler));
