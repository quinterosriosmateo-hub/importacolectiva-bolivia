import { supabase } from '@/lib/supabaseClient';

const mockProducts = [
  { id: 1, name: 'Lote de Electrónicos', price: 1200, category: 'Tecnología', stock: 50, image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=400' },
  { id: 2, name: 'Maquinaria Industrial', price: 5000, category: 'Industria', stock: 10, image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=400' },
  { id: 3, name: 'Ropa al por Mayor', price: 800, category: 'Moda', stock: 100, image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=400' },
];

export const productRepository = {
  /**
   * Obtiene todos los productos activos de la base de datos de Supabase.
   * Si falla, recurre a datos simulados para resiliencia en desarrollo.
   */
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

      // Mapear campos de base de datos a formato esperado por el frontend
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

  /**
   * Obtiene un producto por ID.
   */
  async getById(id) {
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
  }
};
