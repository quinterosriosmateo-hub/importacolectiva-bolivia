import { supabase } from '@/lib/supabaseClient';

/**
 * authRepository — Capa de acceso a datos de autenticación.
 * Única capa que llama a Supabase auth directamente.
 */
export const authRepository = {
  /**
   * Inicia sesión con email y contraseña.
   * Supabase almacena automáticamente el token en localStorage.
   * @returns {{ session, user, error }}
   */
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { session: data?.session ?? null, user: data?.user ?? null, error };
  },

  /**
   * Cierra la sesión actual.
   * @returns {{ error }}
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  /**
   * Obtiene la sesión activa del almacenamiento local.
   * @returns {{ session, user }}
   */
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return { session, user: session?.user ?? null };
  },

  /**
   * Suscribe un listener a los cambios de estado de auth.
   * Retorna la función de desuscripción.
   * @param {(event: string, session: object|null) => void} callback
   * @returns {() => void} unsubscribe
   */
  onAuthStateChange(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
    return () => subscription.unsubscribe();
  },
};
