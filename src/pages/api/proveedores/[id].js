import { proveedorController } from '@/controllers/proveedorController';
import { authMiddleware } from '@/middleware/authMiddleware';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return authMiddleware(['Admin', 'Administrador'])(proveedorController.getById)(req, res);
  } else if (req.method === 'PUT') {
    return authMiddleware(['Admin', 'Administrador'])(proveedorController.update)(req, res);
  } else if (req.method === 'DELETE') {
    return authMiddleware(['Admin', 'Administrador'])(proveedorController.delete)(req, res);
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
