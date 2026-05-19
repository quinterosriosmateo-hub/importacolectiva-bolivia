import { productRepository } from '../repositories/productRepository';

export const productService = {
  async getFeaturedProducts() {
    // Lógica de negocio (ej: filtrar por productos en oferta o destacados)
    const products = await productRepository.getAll();
    return products.slice(0, 3);
  },
  
  async getProductDetails(id) {
    return await productRepository.getById(id);
  }
};
