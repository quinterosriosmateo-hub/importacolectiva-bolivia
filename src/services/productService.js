import { productRepository } from '@/repositories/productRepository';
import { ESTADOS_PRODUCTO } from '@/utils/constants';

export const productService = {
  async getFeaturedProducts() {
    const products = await productRepository.getAll();
    return products.slice(0, 3);
  },

  async getProductDetails(id) {
    return await productRepository.getById(id);
  },

  async getAdminProducts(filters, token) {
    return await productRepository.getAllAdmin(filters, token);
  },

  async createProduct(data, token) {
    const { nombre, descripcion, precio, stock, estado, image, categorias } = data;

    if (!nombre || nombre.trim() === '') {
      return { error: new Error('El nombre del producto es obligatorio.') };
    }
    if (precio == null || isNaN(precio) || Number(precio) < 0) {
      return { error: new Error('El precio debe ser un número mayor o igual a 0.') };
    }
    if (stock == null || isNaN(stock) || Number(stock) < 0) {
      return { error: new Error('El stock debe ser un número entero mayor o igual a 0.') };
    }
    if (estado && !ESTADOS_PRODUCTO.includes(estado)) {
      return { error: new Error('Estado de producto inválido.') };
    }

    const normalizedData = {
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || '',
      precio: Number(precio),
      stock: Number(stock),
      estado: estado || 'Activo',
      ...(typeof image === 'string' && image.trim() ? { image: image.trim() } : {}),
    };

    const { product, error } = await productRepository.create(normalizedData, token);
    if (error) {
      return { error };
    }

    if (Array.isArray(categorias) && categorias.length > 0) {
      const { error: relError } = await productRepository.setCategorias(product.id, categorias, token);
      if (relError) {
        return { error: relError };
      }
    }

    return { product };
  },

  async updateProduct(id, data, token) {
    if (!id) {
      return { error: new Error('El ID del producto es requerido.') };
    }

    const { nombre, descripcion, precio, stock, estado, image, categorias } = data;

    if (!nombre || nombre.trim() === '') {
      return { error: new Error('El nombre del producto es obligatorio.') };
    }
    if (precio == null || isNaN(precio) || Number(precio) < 0) {
      return { error: new Error('El precio debe ser un número mayor o igual a 0.') };
    }
    if (stock == null || isNaN(stock) || Number(stock) < 0) {
      return { error: new Error('El stock debe ser un número entero mayor o igual a 0.') };
    }
    if (estado && !ESTADOS_PRODUCTO.includes(estado)) {
      return { error: new Error('Estado de producto inválido.') };
    }

    const normalizedData = {
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || '',
      precio: Number(precio),
      stock: Number(stock),
      estado: estado || 'Activo',
      ...(typeof image === 'string' && image.trim() ? { image: image.trim() } : {}),
    };

    const { product, error } = await productRepository.update(id, normalizedData, token);
    if (error) {
      return { error };
    }

    const { error: relError } = await productRepository.setCategorias(id, Array.isArray(categorias) ? categorias : [], token);
    if (relError) {
      return { error: relError };
    }

    return { product };
  },

  async deleteProduct(id, token) {
    if (!id) {
      return { error: new Error('El ID del producto es requerido.') };
    }
    return await productRepository.remove(id, token);
  }
};
