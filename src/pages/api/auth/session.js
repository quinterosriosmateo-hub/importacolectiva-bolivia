import { authController } from '@/controllers/authController';
import { withAuth } from '@/lib/withAuth';

/**
 * @swagger
 * /api/auth/session:
 *   get:
 *     summary: Obtiene el perfil de sesión del usuario
 *     description: Retorna la información de perfil normalizada del usuario autenticado actual. Requiere autenticación JWT.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión recuperada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     displayName:
 *                       type: string
 *                     avatarUrl:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     role:
 *                       type: string
 *       401:
 *         description: No autorizado (token JWT faltante o inválido)
 */
async function handler(req, res) {
  return await authController.getSession(req, res);
}

export default withAuth(handler);
