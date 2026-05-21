/**
 * Constantes globales de la aplicación
 */
export const Constantes = {
  // URLs de la API
  apiGetProducts: '/api/products',
  apiAuthLogin: '/api/auth/login',
  apiAuthSession: '/api/auth/session',
  apiAuthRegister: '/api/auth/register',
  apiAuthProfile: '/api/auth/profile',
  apiAuthResetPassword: '/api/auth/reset-password',
  apiAdminUsers: '/api/admin/users',
  apiAdminStats: '/api/admin/stats',
  apiAdminCategories: '/api/admin/categories',
  apiAdminProducts: '/api/admin/products'
};

export const ROLES = ['Cliente', 'Premium', 'Asesor', 'Proveedor/Agente', 'Administrador'];
export const ESTADOS = ['activo', 'suspendido', 'baneado'];
export const ESTADOS_PRODUCTO = ['Activo', 'Inactivo', 'Agotado', 'Destacado'];

