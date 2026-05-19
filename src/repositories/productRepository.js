// Simulación de acceso a datos de productos (puedes conectar Supabase aquí luego)
const products = [
  { id: 1, name: 'Lote de Electrónicos', price: 1200, category: 'Tecnología', stock: 50, image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=400' },
  { id: 2, name: 'Maquinaria Industrial', price: 5000, category: 'Industria', stock: 10, image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=400' },
  { id: 3, name: 'Ropa al por Mayor', price: 800, category: 'Moda', stock: 100, image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=400' },
];

export const productRepository = {
  async getAll() {
    return products;
  },
  async getById(id) {
    return products.find(p => p.id === parseInt(id));
  }
};
