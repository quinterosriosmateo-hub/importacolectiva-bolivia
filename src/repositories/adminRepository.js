import { createClient } from '@supabase/supabase-js';
import { ROLES as ROLES_VALIDOS, ESTADOS as ESTADOS_VALIDOS } from '@/utils/constants';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const getAuthenticatedClient = (token) => {
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  );
};

const PAGE_SIZE = 25;

/**
 * adminRepository — Capa de acceso a datos para el panel administrador.
 * Todas las consultas operan sobre la tabla public.usuario.
 */
export const adminRepository = {
  /**
   * Lista usuarios con paginación, búsqueda y filtros opcionales.
   */
  async listUsers({ page = 1, search = '', rol = '', estado = '' } = {}, token) {
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const client = getAuthenticatedClient(token);

    let query = client
      .from('usuario')
      .select('id, nombre, email, telefono, rol, estado, avatar_url, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (search.trim()) {
      // Búsqueda parcial en nombre o email (ilike = case-insensitive)
      query = query.or(`nombre.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%`);
    }

    if (rol && ROLES_VALIDOS.includes(rol)) {
      query = query.eq('rol', rol);
    }

    if (estado && ESTADOS_VALIDOS.includes(estado)) {
      query = query.eq('estado', estado);
    }

    const { data, count, error } = await query;
    return { data: data ?? [], count: count ?? 0, error };
  },

  /**
   * Obtiene un usuario por ID.
   */
  async getUserById(userId, token) {
    const client = getAuthenticatedClient(token);
    const { data, error } = await client
      .from('usuario')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    return { data, error };
  },

  /**
   * Actualiza rol y/o estado de un usuario.
   */
  async updateUser(userId, updates, token) {
    const allowed = {};
    if (updates.rol !== undefined && ROLES_VALIDOS.includes(updates.rol)) {
      allowed.rol = updates.rol;
    }
    if (updates.estado !== undefined && ESTADOS_VALIDOS.includes(updates.estado)) {
      allowed.estado = updates.estado;
    }

    if (Object.keys(allowed).length === 0) {
      return { data: null, error: new Error('No hay campos válidos para actualizar.') };
    }

    const client = getAuthenticatedClient(token);
    const { data, error } = await client
      .from('usuario')
      .update(allowed)
      .eq('id', userId)
      .select()
      .maybeSingle();

    return { data, error };
  },

  /**
   * Devuelve estadísticas resumidas de usuarios.
   */
  async getStats(token) {
    const client = getAuthenticatedClient(token);
    const { data, error } = await client
      .from('usuario')
      .select('rol, estado');

    if (error) return { stats: null, error };

    const stats = {
      total: data.length,
      porRol: {},
      activos: 0,
      suspendidos: 0,
      baneados: 0,
    };

    for (const u of data) {
      // Por rol
      stats.porRol[u.rol] = (stats.porRol[u.rol] || 0) + 1;
      // Por estado
      const userState = (u.estado || 'activo').toLowerCase();
      if (userState === 'activo') stats.activos++;
      else if (userState === 'suspendido') stats.suspendidos++;
      else if (userState === 'baneado') stats.baneados++;
    }

    return { stats, error: null };
  },
};
