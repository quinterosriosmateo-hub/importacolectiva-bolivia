import { authController } from '@/controllers/authController';
import { withAuth } from '@/lib/withAuth';

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Actualiza el perfil del usuario activo
 *     tags:
 *       - Auth
 *     description: Actualiza la información personal en la base de datos (public.usuario) para el usuario autenticado. Requiere autenticación JWT.
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
 *                 example: "Juan Pérez Modificado"
 *               telefono:
 *                 type: string
 *                 example: "+591 71111111"
 *               rol:
 *                 type: string
 *                 enum: [Cliente, Premium, Administrador, Asesor, Proveedor/Agente]
 *                 example: "Premium"
 *               biografia:
 *                 type: string
 *                 example: "Importador activo y verificado."
 *               ubicacion:
 *                 type: string
 *                 example: "La Paz, Bolivia"
 *               avatar_url:
 *                 type: string
 *                 example: "https://example.com/avatar.jpg"
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   type: object
 *       401:
 *         description: No autorizado
 *       400:
 *         description: Error en la actualización
 */
async function handler(req, res) {
  return await authController.updateProfile(req, res);
}

export default withAuth(handler);
