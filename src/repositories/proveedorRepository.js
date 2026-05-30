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

export const proveedorRepository = {
  async getAll() {
    const { data, error } = await supabase
      .from('proveedor')
      .select('*')
      .order('id', { ascending: false });
    return { proveedores: data, error };
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('proveedor')
      .select('*')
      .eq('id', id)
      .single();
    return { proveedor: data, error };
  },

  async create(proveedorData, token) {
    const client = getAuthenticatedClient(token);
    const { data, error } = await client
      .from('proveedor')
      .insert(proveedorData)
      .select()
      .single();
    return { proveedor: data, error };
  },

  async update(id, proveedorData, token) {
    const client = getAuthenticatedClient(token);
    const { data, error } = await client
      .from('proveedor')
      .update(proveedorData)
      .eq('id', id)
      .select()
      .single();
    return { proveedor: data, error };
  },

  async delete(id, token) {
    const client = getAuthenticatedClient(token);
    const { error } = await client
      .from('proveedor')
      .delete()
      .eq('id', id);
    return { error };
  }
};
