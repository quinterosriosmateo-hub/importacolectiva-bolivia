import { productService } from '../services/productService';

export const productController = {
  async getProducts(req, res) {
    try {
      const products = await productService.getFeaturedProducts();
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching products' });
    }
  }
};
