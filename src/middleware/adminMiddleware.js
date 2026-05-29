import { withAuth } from '@/lib/withAuth';
import { withRole } from '@/lib/withRole';

/**
 * withAdminAuth - Middleware compuesto que garantiza que el usuario esté
 * autenticado y además posea el rol de 'Administrador'.
 */
export const withAdminAuth = (handler) => withAuth(withRole(['Administrador'], handler));