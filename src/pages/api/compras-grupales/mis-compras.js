import { compraGrupalController } from '@/controllers/compraGrupalController';
import { authMiddleware } from '@/middleware/authMiddleware';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return authMiddleware()(compraGrupalController.getMyPurchases)(req, res);
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
