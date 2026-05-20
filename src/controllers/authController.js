import { authService } from '@/services/authService';

export const authController = {
  /**
   * Maneja el login de usuario.
   */
  async login(req, res) {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ code: 1, error: `Method ${req.method} Not Allowed` });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ code: 1, error: 'El correo y la contraseña son requeridos.' });
    }

    try {
      const { profile, session, error } = await authService.login(email, password);

      if (error) {
        return res.status(401).json({ code: 1, error: error.message });
      }

      return res.status(200).json({ code: 0, message: 'Operación exitosa', profile, session });
    } catch (err) {
      return res.status(500).json({ code: 1, error: 'Error interno en el servidor durante la autenticación.' });
    }
  },

  /**
   * Maneja el registro de un nuevo usuario.
   */
  async register(req, res) {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ code: 1, error: `Method ${req.method} Not Allowed` });
    }

    const { email, password, nombre, telefono, rol, biografia, ubicacion } = req.body;

    if (!email || !password || !nombre) {
      return res.status(400).json({ code: 1, error: 'El correo, contraseña y nombre son requeridos.' });
    }

    try {
      const { profile, session, error } = await authService.register(email, password, {
        nombre,
        telefono,
        rol,
        biografia,
        ubicacion
      });

      if (error) {
        return res.status(400).json({ code: 1, error: error.message });
      }

      return res.status(201).json({ code: 0, message: 'Operación exitosa', profile, session });
    } catch (err) {
      return res.status(500).json({ code: 1, error: 'Error al registrar el usuario en el servidor.' });
    }
  },

  /**
   * Maneja la actualización del perfil del usuario logueado.
   */
  async updateProfile(req, res) {
    if (req.method !== 'PUT') {
      res.setHeader('Allow', ['PUT']);
      return res.status(405).json({ code: 1, error: `Method ${req.method} Not Allowed` });
    }

    if (!req.user) {
      return res.status(401).json({ code: 1, error: 'No autorizado: no hay sesión activa.' });
    }

    const { nombre, telefono, rol, biografia, ubicacion, avatar_url } = req.body;

    try {
      // Filtrar campos para enviar sólo los definidos en la petición
      const updateData = {};
      if (nombre !== undefined) updateData.nombre = nombre;
      if (telefono !== undefined) updateData.telefono = telefono;
      if (rol !== undefined) updateData.rol = rol;
      if (biografia !== undefined) updateData.biografia = biografia;
      if (ubicacion !== undefined) updateData.ubicacion = ubicacion;
      if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

      const { profile, error } = await authService.updateProfile(req.user.id, updateData, req.token);

      if (error) {
        return res.status(400).json({ code: 1, error: error.message });
      }

      return res.status(200).json({ code: 0, message: 'Operación exitosa', profile });
    } catch (err) {
      return res.status(500).json({ code: 1, error: 'Error al actualizar la información de perfil.' });
    }
  },

  /**
   * Maneja la solicitud de restablecimiento de contraseña.
   */
  async resetPassword(req, res) {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ code: 1, error: `Method ${req.method} Not Allowed` });
    }

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ code: 1, error: 'El correo electrónico es requerido.' });
    }

    try {
      const { error } = await authService.resetPassword(email);

      if (error) {
        return res.status(400).json({ code: 1, error: error.message });
      }

      return res.status(200).json({ code: 0, message: 'Correo de recuperación enviado con éxito.' });
    } catch (err) {
      return res.status(500).json({ code: 1, error: 'Error al enviar la solicitud de recuperación.' });
    }
  },

  /**
   * Retorna los detalles de la sesión del usuario actual (extraídos a través del middleware withAuth).
   */
  async getSession(req, res) {
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      return res.status(405).json({ code: 1, error: `Method ${req.method} Not Allowed` });
    }

    try {
      // req.user viene inyectado por withAuth
      if (!req.user) {
        return res.status(401).json({ code: 1, error: 'No autorizado: no hay sesión activa.' });
      }

      // Recuperar perfil unificado (auth + base de datos)
      const profile = await authService.getProfile(req.user.id, req.user);

      return res.status(200).json({ code: 0, message: 'Operación exitosa', profile });
    } catch (err) {
      return res.status(500).json({ code: 1, error: 'Error al obtener la sesión de usuario.' });
    }
  }
};
