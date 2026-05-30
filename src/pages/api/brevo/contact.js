// src/pages/api/brevo/contact.js
import brevoController from '../../../controllers/brevoController';

/**
 * @swagger
 * /api/brevo/contact:
 *   post:
 *     summary: Sincroniza un contacto con Brevo
 *     tags:
 *       - Brevo
 *     description: Crea o actualiza un contacto en Brevo para marketing automation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               nombre:
 *                 type: string
 *               telefono:
 *                 type: string
 *               empresa:
 *                 type: string
 *               userId:
 *                 type: string
 *               rol:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contacto sincronizado exitosamente
 */
export default async function handler(req, res) {
  if (req.method === 'POST') {
    return brevoController.syncContact(req, res);
  }
  
  res.status(405).json({ success: false, message: 'Method not allowed' });
}