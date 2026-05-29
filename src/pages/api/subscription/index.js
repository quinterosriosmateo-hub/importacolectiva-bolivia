import { subscriptionController } from '@/controllers/subscriptionController';
import { withAuth } from '@/lib/withAuth';

/**
 * @swagger
 * /api/subscription:
 *   get:
 *     summary: Obtiene la suscripción del usuario autenticado
 *     description: Retorna la información de la suscripción del usuario actual (gratuita o premium). Requiere token JWT.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Información de la suscripción obtenida con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 subscription:
 *                   type: object
 *       401:
 *         description: No autorizado
 *   post:
 *     summary: Suscribe al usuario al Plan Premium
 *     description: Procesa la simulación del pago y actualiza el rol del usuario a Premium. Requiere token JWT.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - plan
 *               - metodoPago
 *               - monto
 *             properties:
 *               plan:
 *                 type: string
 *                 example: "Premium"
 *               metodoPago:
 *                 type: string
 *                 example: "Tarjeta de Crédito"
 *               monto:
 *                 type: number
 *                 example: 200
 *     responses:
 *       200:
 *         description: Suscripción creada exitosamente
 *       400:
 *         description: Datos inválidos o error en el proceso
 *       401:
 *         description: No autorizado
 */
async function handler(req, res) {
  if (req.method === 'GET') {
    return await subscriptionController.getSubscription(req, res);
  } else if (req.method === 'POST') {
    return await subscriptionController.subscribe(req, res);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);
