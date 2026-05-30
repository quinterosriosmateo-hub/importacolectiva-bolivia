import { proveedorController } from '@/controllers/proveedorController';
import { authMiddleware } from '@/middleware/authMiddleware';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return authMiddleware(['Admin', 'Administrador'])(proveedorController.getAll)(req, res);
  } else if (req.method === 'POST') {
    return authMiddleware(['Admin', 'Administrador'])(proveedorController.create)(req, res);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
