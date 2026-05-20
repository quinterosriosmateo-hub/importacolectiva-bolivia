import { authController } from '@/controllers/authController';

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags:
 *       - Auth
 *     description: Crea un nuevo usuario en Supabase Auth y sincroniza su perfil en la base de datos. Permite asignar roles en fase de desarrollo.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - nombre
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "nuevo@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "secreto123"
 *               nombre:
 *                 type: string
 *                 example: "Juan Pérez"
 *               telefono:
 *                 type: string
 *                 example: "+591 70000000"
 *               rol:
 *                 type: string
 *                 enum: [Cliente, Premium, Administrador, Asesor, Proveedor/Agente]
 *                 example: "Cliente"
 *               biografia:
 *                 type: string
 *                 example: "Nuevo importador de tecnología."
 *               ubicacion:
 *                 type: string
 *                 example: "Santa Cruz, Bolivia"
 *     responses:
 *       201:
 *         description: Registro exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   type: object
 *                 session:
 *                   type: object
 *       400:
 *         description: Faltan campos requeridos o error al registrar
 */
export default async function handler(req, res) {
  return await authController.register(req, res);
}
