import { authController } from '@/controllers/authController';

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Solicita restablecer la contraseña
 *     tags:
 *       - Auth
 *     description: Envía un correo electrónico con un enlace para que el usuario pueda restablecer su contraseña de forma segura.
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
 *                 example: "usuario@example.com"
 *     responses:
 *       200:
 *         description: Correo de restablecimiento enviado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Error en la solicitud o correo no registrado
 */
export default async function handler(req, res) {
  return await authController.resetPassword(req, res);
}
