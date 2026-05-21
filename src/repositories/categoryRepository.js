import { supabase } from '@/lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';

const getAuthenticatedClient = (token) => {
  if (!token) return supabase;
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

const mockCategories = [
  { id: 1, nombre: 'Tecnología', productCount: 1 },
  { id: 2, nombre: 'Industria', productCount: 1 },
  { id: 3, nombre: 'Moda', productCount: 1 }
];

export const categoryRepository = {
  /**
   * Obtiene todas las categorías y cuenta los productos asociados.
   */
  async getAll(token) {
    try {
      const client = getAuthenticatedClient(token);
      const { data, error } = await client
        .from('categoria')
        .select('*, producto_categoria(count)');

      if (error) {
        console.warn('Error al obtener categorías (usando datos simulados):', error);
        return mockCategories;
      }

      return data.map(item => ({
        id: item.id,
        nombre: item.nombre,
        productCount: item.producto_categoria?.[0]?.count || 0
      }));
    } catch (err) {
      console.warn('Error de red al obtener categorías:', err);
      return mockCategories;
    }
  },

  /**
   * Crea una nueva categoría.
   */
  async create(nombre, token) {
    const client = getAuthenticatedClient(token);
    const { data, error } = await client
      .from('categoria')
      .insert({ nombre })
      .select()
      .single();

    return { data, error };
  },

  /**
   * Actualiza el nombre de una categoría existente.
   */
  async update(id, nombre, token) {
    const client = getAuthenticatedClient(token);
    const { data, error } = await client
      .from('categoria')
      .update({ nombre })
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  /**
   * Elimina una categoría y sus relaciones de productos asociadas de forma segura.
   */
  async delete(id, token) {
    const client = getAuthenticatedClient(token);
    
    // 1. Eliminar relaciones en producto_categoria primero
    const { error: relError } = await client
      .from('producto_categoria')
      .delete()
      .eq('categoria_id', id);

    if (relError) {
      return { error: relError };
    }

    // 2. Eliminar la categoría propiamente
    const { data, error } = await client
      .from('categoria')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();

    return { data, error };
  }
};
