import { authService } from '@/services/authService';

export const authController = {
  /**
   * Maneja el login de usuario.
   */
  async login(req, res) {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'El correo y la contraseña son requeridos.' });
    }

    try {
      const { profile, session, error } = await authService.login(email, password);

      if (error) {
        return res.status(401).json({ error: error.message });
      }

      return res.status(200).json({ profile, session });
    } catch (err) {
      return res.status(500).json({ error: 'Error interno en el servidor durante la autenticación.' });
    }
  },

  /**
   * Retorna los detalles de la sesión del usuario actual (extraídos a través del middleware withAuth).
   */
  async getSession(req, res) {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    try {
      // req.user viene inyectado por withAuth
      if (!req.user) {
        return res.status(401).json({ error: 'No autorizado: no hay sesión activa.' });
      }

      // Normalizamos el usuario obtenido del middleware
      const meta = req.user.user_metadata ?? {};
      const profile = {
        id: req.user.id,
        email: req.user.email,
        displayName: meta.full_name ?? meta.name ?? req.user.email?.split('@')[0] ?? 'Usuario',
        avatarUrl: meta.avatar_url ?? null,
        phone: req.user.phone ?? null,
        role: req.user.role ?? 'authenticated',
        createdAt: req.user.created_at,
        metadata: meta,
      };

      return res.status(200).json({ profile });
    } catch (err) {
      return res.status(500).json({ error: 'Error al obtener la sesión.' });
    }
  }
};
