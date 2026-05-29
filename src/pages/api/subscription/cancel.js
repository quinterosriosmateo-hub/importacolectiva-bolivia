import { subscriptionController } from '@/controllers/subscriptionController';
import { withAuth } from '@/lib/withAuth';

/**
 * @swagger
 * /api/subscription/cancel:
 *   post:
 *     summary: Cancela la renovación automática de la suscripción
 *     description: Desactiva la renovación automática y actualiza el estado de la suscripción, manteniendo los beneficios hasta fecha_fin. Requiere token JWT.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Renovación cancelada correctamente
 *       400:
 *         description: Error al cancelar la renovación
 *       401:
 *         description: No autorizado
 */
async function handler(req, res) {
  if (req.method === 'POST') {
    return await subscriptionController.cancelSubscription(req, res);
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);
