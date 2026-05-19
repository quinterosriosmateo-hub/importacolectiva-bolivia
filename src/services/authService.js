import { authRepository } from '@/repositories/authRepository';

/**
 * Toma el objeto `user` crudo de Supabase y devuelve un perfil de usuario
 * normalizado con los campos más útiles listos para consumir en la UI.
 *
 * @param {object|null} user — user de Supabase
 * @returns {object|null}
 */
function normalizeUser(user) {
  if (!user) return null;

  const meta = user.user_metadata ?? {};

  return {
    id:          user.id,
    email:       user.email,
    // Supabase puede guardar el nombre en user_metadata como 'full_name' o 'name'
    displayName: meta.full_name ?? meta.name ?? user.email?.split('@')[0] ?? 'Usuario',
    avatarUrl:   meta.avatar_url ?? null,
    phone:       user.phone ?? null,
    role:        user.role ?? 'authenticated',
    createdAt:   user.created_at,
    // Exponer metadatos completos por si la UI los necesita
    metadata:    meta,
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
   * @returns {{ profile: object|null, session: object|null, error: object|null }}
   */
  async login(email, password) {
    const { session, user, error } = await authRepository.signIn(email, password);
    if (error) return { profile: null, session: null, error };
    return { profile: normalizeUser(user), session, error: null };
  },

  /**
   * Cierra la sesión.
   * @returns {{ error: object|null }}
   */
  async logout() {
    return await authRepository.signOut();
  },

  /**
   * Obtiene la sesión activa y el perfil normalizado.
   * @returns {{ profile: object|null, session: object|null }}
   */
  async getActiveSession() {
    const { session, user } = await authRepository.getSession();
    return { profile: normalizeUser(user), session };
  },

  /**
   * Suscribe un listener a los cambios de estado de auth.
   * @param {(event: string, profile: object|null, session: object|null) => void} callback
   * @returns {() => void} unsubscribe
   */
  onAuthStateChange(callback) {
    return authRepository.onAuthStateChange((event, session) => {
      callback(event, normalizeUser(session?.user ?? null), session);
    });
  },
};
