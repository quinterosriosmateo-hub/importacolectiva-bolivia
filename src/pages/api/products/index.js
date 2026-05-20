import { productController } from '@/controllers/productController';

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Obtiene la lista de productos destacados y ofertas grupales
 *     description: Retorna un listado de productos disponibles para importación colectiva. (Público)
 *     responses:
 *       200:
 *         description: Retorna la lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Generador Solar Portátil"
 *                   price:
 *                     type: number
 *                     example: 299
 *                   image:
 *                     type: string
 *                     example: "/images/solar-generator.jpg"
 *                   category:
 *                     type: string
 *                     example: "Tecnología"
 *       405:
 *         description: Método no permitido
 */
export default async function handler(req, res) {
  if (req.method === 'GET') {
    return await productController.getProducts(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
