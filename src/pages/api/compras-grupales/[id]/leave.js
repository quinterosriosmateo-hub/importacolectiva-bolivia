import { compraGrupalController } from '@/controllers/compraGrupalController';
import { authMiddleware } from '@/middleware/authMiddleware';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    return authMiddleware()(compraGrupalController.leave)(req, res);
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
