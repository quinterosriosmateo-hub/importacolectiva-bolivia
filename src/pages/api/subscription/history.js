import { subscriptionController } from '@/controllers/subscriptionController';
import { withAuth } from '@/lib/withAuth';

/**
 * @swagger
 * /api/subscription/history:
 *   get:
 *     summary: Obtiene el historial de pagos de suscripción del usuario
 *     description: Retorna la lista de todas las transacciones de pago realizadas por el usuario para su suscripción. Requiere token JWT.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Historial obtenido con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 history:
 *                   type: array
 *                   items:
 *                     type: object
 *       401:
 *         description: No autorizado
 */
async function handler(req, res) {
  if (req.method === 'GET') {
    return await subscriptionController.getPaymentHistory(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);
