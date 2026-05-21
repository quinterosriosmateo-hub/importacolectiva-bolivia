import { productService } from '@/services/productService';

export const productController = {
  async getProducts(req, res) {
    try {
      const products = await productService.getFeaturedProducts();
      res.status(200).json(products);
    } catch (error) {
      console.error('[productController.getProducts] Error:', error);
      res.status(500).json({ error: 'Error fetching products' });
    }
  },

  async getAdminProducts(req, res) {
    try {
      const { search, estado, categoria } = req.query;
      const filters = {
        search: search || '',
        estado: estado || '',
        categoria: categoria ? Number(categoria) : undefined
      };
      const products = await productService.getAdminProducts(filters, req.token);
      return res.status(200).json({ code: 0, products });
    } catch (error) {
      console.error('[productController.getAdminProducts] Error:', error);
      return res.status(500).json({ code: 1, error: 'Error al obtener productos para administración.' });
    }
  },

  async createProduct(req, res) {
    try {
      const { nombre, descripcion, precio, stock, estado, image, categorias } = req.body;
      const { product, error } = await productService.createProduct({ nombre, descripcion, precio, stock, estado, image, categorias }, req.token);
      if (error) {
        console.error('[productController.createProduct] Validation or repository error:', error);
        const errorMessage = error.message || error.details || 'Error al crear el producto.';
        return res.status(400).json({ code: 1, error: errorMessage });
      }
      return res.status(201).json({ code: 0, message: 'Producto creado con éxito.', product });
    } catch (err) {
      console.error('[productController.createProduct] Error:', err);
      return res.status(500).json({ code: 1, error: 'Error interno al crear el producto.' });
    }
  },

  async updateProduct(req, res) {
    try {
      const { id } = req.query;
      const { nombre, descripcion, precio, stock, estado, image, categorias } = req.body;
      const { product, error } = await productService.updateProduct(id, { nombre, descripcion, precio, stock, estado, image, categorias }, req.token);
      if (error) {
        console.error('[productController.updateProduct] Validation or repository error:', error);
        const errorMessage = error.message || error.details || 'Error al actualizar el producto.';
        return res.status(400).json({ code: 1, error: errorMessage });
      }
      return res.status(200).json({ code: 0, message: 'Producto actualizado con éxito.', product });
    } catch (err) {
      console.error('[productController.updateProduct] Error:', err);
      return res.status(500).json({ code: 1, error: 'Error interno al actualizar el producto.' });
    }
  },

  async deleteProduct(req, res) {
    try {
      const { id } = req.query;
      const { error } = await productService.deleteProduct(id, req.token);
      if (error) {
        return res.status(400).json({ code: 1, error: error.message });
      }
      return res.status(200).json({ code: 0, message: 'Producto eliminado con éxito.' });
    } catch (err) {
      console.error('[productController.deleteProduct] Error:', err);
      return res.status(500).json({ code: 1, error: 'Error interno al eliminar el producto.' });
    }
  }
};
