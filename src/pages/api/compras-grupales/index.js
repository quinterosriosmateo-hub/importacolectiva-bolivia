import { compraGrupalController } from '@/controllers/compraGrupalController';
import { authMiddleware } from '@/middleware/authMiddleware';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return await compraGrupalController.getAll(req, res);
  } else if (req.method === 'POST') {
    // Solo admin debería poder crear. authMiddleware inyectará req.token y validará el rol idealmente
    return authMiddleware(['Admin', 'Administrador'])(compraGrupalController.create)(req, res);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
