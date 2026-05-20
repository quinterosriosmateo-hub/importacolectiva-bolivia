import { authRepository } from '@/repositories/authRepository';

/**
 * Combina la información de Supabase Auth con los datos reales en public.usuario.
 *
 * @param {object} user - Objeto de usuario de Supabase Auth
 * @param {object|null} dbUser - Objeto obtenido de la tabla public.usuario
 * @returns {object} Perfil normalizado
 */
function normalizeProfile(user, dbUser) {
  if (!user) return null;

  const meta = user.user_metadata ?? {};

  return {
    id:          user.id,
    email:       user.email,
    displayName: dbUser?.nombre ?? meta.nombre ?? meta.full_name ?? meta.name ?? user.email?.split('@')[0] ?? 'Usuario Nuevo',
    phone:       dbUser?.telefono ?? user.phone ?? meta.telefono ?? null,
    role:        dbUser?.rol ?? meta.rol ?? 'Cliente',
    avatarUrl:   dbUser?.avatar_url ?? meta.avatar_url ?? null,
    reputacion:  dbUser?.reputacion ?? 100,
    biografia:   dbUser?.biografia ?? meta.biografia ?? 'Miembro de Importacolectiva.',
    ubicacion:   dbUser?.ubicacion ?? meta.ubicacion ?? 'Bolivia',
    estado:      dbUser?.estado ?? 'Activo',
    createdAt:   dbUser?.created_at ?? user.created_at
  };
}

/**
 * authService — Lógica de negocio de autenticación.
 * Orquesta el repositorio y expone datos normalizados.
 */
export const authService = {
  /**
   * Intenta iniciar sesión y devuelve el perfil normalizado.
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    const { session, user, error } = await authRepository.signIn(email, password);
    if (error) return { profile: null, session: null, error };
    const profile = await this.getProfile(user.id, user);
    return { profile, session, error: null };
  },

  /**
   * Registra un nuevo usuario y devuelve el perfil.
   * @param {string} email
   * @param {string} password
   * @param {object} metadata
   */
  async register(email, password, metadata) {
    const { session, user, error } = await authRepository.signUp(email, password, metadata);
    if (error) return { profile: null, session: null, error };
    // Esperamos a que el trigger de Supabase inserte el perfil
    const profile = await this.getProfile(user.id, user);
    return { profile, session, error: null };
  },

  /**
   * Obtiene la sesión activa y el perfil normalizado.
   */
  async getActiveSession() {
    const { session, user } = await authRepository.getSession();
    if (!user) return { profile: null, session: null };
    const profile = await this.getProfile(user.id, user);
    return { profile, session };
  },

  /**
   * Obtiene el perfil del usuario de la DB y de Auth.
   * @param {string} userId
   * @param {object} userAuthObject
   */
  async getProfile(userId, userAuthObject) {
    // Si estamos en modo de bypass de desarrollo y es el ID mock, devolvemos el mock de admin
    if (userId === '00000000-0000-0000-0000-000000000000') {
      return {
        id: userId,
        email: 'admin@importacolectiva.com',
        displayName: 'Desarrollador de Pruebas',
        phone: '+591 70000000',
        role: 'Administrador',
        avatarUrl: null,
        reputacion: 100,
        biografia: 'Perfil de administrador simulado para pruebas locales.',
        ubicacion: 'Bolivia',
        estado: 'Activo',
        createdAt: new Date().toISOString()
      };
    }

    const { data: dbUser, error } = await authRepository.getProfile(userId);
    if (error) {
      console.warn('Error al obtener perfil de base de datos (usando metadatos de Auth):', error.message);
    }
    return normalizeProfile(userAuthObject, dbUser);
  },

  async updateProfile(userId, profileData, token) {
    if (userId === '00000000-0000-0000-0000-000000000000') {
      return { profile: { ...profileData, id: userId }, error: null };
    }
    const { data, error } = await authRepository.updateProfile(userId, profileData, token);
    if (error) return { profile: null, error };
    return { profile: data, error: null };
  },

  /**
   * Solicita el restablecimiento de contraseña.
   * @param {string} email
   */
  async resetPassword(email) {
    return await authRepository.resetPassword(email);
  },

  /**
   * Cierra la sesión.
   * @returns {{ error: object|null }}
   */
  async logout() {
    return await authRepository.signOut();
  },

  /**
   * Suscribe un listener a los cambios de estado de auth.
   * @param {(event: string, profile: object|null, session: object|null) => void} callback
   * @returns {() => void} unsubscribe
   */
  onAuthStateChange(callback) {
    return authRepository.onAuthStateChange(async (event, session) => {
      const user = session?.user ?? null;
      const profile = user ? await this.getProfile(user.id, user) : null;
      callback(event, profile, session);
    });
  },
};
