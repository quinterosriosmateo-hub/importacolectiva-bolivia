import { compraGrupalController } from '@/controllers/compraGrupalController';
import { authMiddleware } from '@/middleware/authMiddleware';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return await compraGrupalController.getById(req, res);
  } else if (req.method === 'PUT') {
    return authMiddleware(['Admin', 'Administrador'])(compraGrupalController.update)(req, res);
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
