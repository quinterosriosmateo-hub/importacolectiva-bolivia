// src/pages/api/brevo/welcome-email.js
import brevoController from '../../../controllers/brevoController';

/**
 * @swagger
 * /api/brevo/welcome-email:
 *   post:
 *     summary: Envía email de bienvenida educativo
 *     tags:
 *       - Brevo
 *     description: Envía un email de bienvenida educativo a un nuevo usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - nombre
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               nombre:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email de bienvenida enviado exitosamente
 */
export default async function handler(req, res) {
  if (req.method === 'POST') {
    return brevoController.sendWelcomeEmail(req, res);
  }
  
  res.status(405).json({ success: false, message: 'Method not allowed' });
}