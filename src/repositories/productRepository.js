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

const mockProducts = [
  { id: 1, name: 'Lote de Electrónicos', price: 1200, category: 'Tecnología', stock: 50, image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=400' },
  { id: 2, name: 'Maquinaria Industrial', price: 5000, category: 'Industria', stock: 10, image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=400' },
  { id: 3, name: 'Ropa al por Mayor', price: 800, category: 'Moda', stock: 100, image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=400' },
];

const mapProduct = (item) => ({
  id: item.id,
  nombre: item.nombre,
  descripcion: item.descripcion,
  precio: parseFloat(item.precio),
  stock: item.stock,
  estado: item.estado,
  image: item.image || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=400',
  categorias: item.producto_categoria?.map(rel => rel.categoria).filter(Boolean) || []
});

export const productRepository = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('producto')
        .select(`
          id,
          nombre,
          precio,
          stock,
          estado,
          image,
          producto_categoria (
            categoria (
              nombre
            )
          )
        `)
        .eq('estado', 'Activo');

      if (error) {
        console.warn('Error fetching products from Supabase (using mock fallback):', error);
        return mockProducts;
      }

      if (!data || data.length === 0) {
        return mockProducts;
      }

      return data.map(item => ({
        id: item.id,
        name: item.nombre,
        price: parseFloat(item.precio),
        stock: item.stock,
        image: item.image || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=400',
        category: item.producto_categoria?.[0]?.categoria?.nombre || 'General'
      }));
    } catch (err) {
      console.warn('Network or client error in productRepository.getAll (using mock fallback):', err);
      return mockProducts;
    }
  },

  async getById(id) {
    try {
      const { data, error } = await supabase
        .from('producto')
        .select(`
          id,
          nombre,
          descripcion,
          precio,
          stock,
          estado,
          image,
          producto_categoria (
            categoria (
              id,
              nombre
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.warn(`Error fetching product ${id} from Supabase (using mock fallback):`, error);
        return mockProducts.find(p => p.id === parseInt(id));
      }

      if (!data) {
        return mockProducts.find(p => p.id === parseInt(id));
      }

      return {
        id: data.id,
        name: data.nombre,
        price: parseFloat(data.precio),
        stock: data.stock,
        image: data.image || 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=400',
        category: data.producto_categoria?.[0]?.categoria?.nombre || 'General'
      };
    } catch (err) {
      console.warn(`Network or client error in productRepository.getById for ${id} (using mock fallback):`, err);
      return mockProducts.find(p => p.id === parseInt(id));
    }
  },

  async getAllAdmin(filters = {}, token) {
    const client = getAuthenticatedClient(token);
    const query = client
      .from('producto')
      .select(`
        id,
        nombre,
        descripcion,
        precio,
        stock,
        estado,
        image,
        producto_categoria (
          categoria (id, nombre)
        )
      `)
      .order('id', { ascending: false });

    if (filters.search) {
      const searchText = `%${filters.search}%`;
      query.or(`nombre.ilike.${searchText},descripcion.ilike.${searchText}`);
    }

    if (filters.estado) {
      query.eq('estado', filters.estado);
    }

    if (filters.categoria) {
      query.eq('producto_categoria.categoria_id', filters.categoria);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Error fetching admin products:', error);
      return [];
    }

    return data.map(mapProduct);
  },

  async create(data, token) {
    const client = getAuthenticatedClient(token);
    const { nombre, descripcion, precio, stock, estado, image } = data;

    const { data: product, error } = await client
      .from('producto')
      .insert({ nombre, descripcion, precio, stock, estado, image })
      .select()
      .single();

    return { product, error };
  },

  async update(id, data, token) {
    const client = getAuthenticatedClient(token);
    const { nombre, descripcion, precio, stock, estado, image } = data;

    const { data: product, error } = await client
      .from('producto')
      .update({ nombre, descripcion, precio, stock, estado, image })
      .eq('id', id)
      .select()
      .single();

    return { product, error };
  },

  async remove(id, token) {
    const client = getAuthenticatedClient(token);

    const { error: relError } = await client
      .from('producto_categoria')
      .delete()
      .eq('producto_id', id);

    if (relError) {
      return { error: relError };
    }

    const { data, error } = await client
      .from('producto')
      .delete()
      .eq('id', id)
      .select()
      .single();

    return { data, error };
  },

  async setCategorias(productoId, categoriaIds, token) {
    const client = getAuthenticatedClient(token);

    const { error: deleteError } = await client
      .from('producto_categoria')
      .delete()
      .eq('producto_id', productoId);

    if (deleteError) {
      return { error: deleteError };
    }

    if (!Array.isArray(categoriaIds) || categoriaIds.length === 0) {
      return { error: null };
    }

    const relations = categoriaIds.map((categoria_id) => ({ producto_id: productoId, categoria_id }));
    const { data, error } = await client
      .from('producto_categoria')
      .insert(relations);

    return { data, error };
  }
};
