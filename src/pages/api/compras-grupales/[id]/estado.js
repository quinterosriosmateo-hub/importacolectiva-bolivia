import { compraGrupalController } from '@/controllers/compraGrupalController';
import { authMiddleware } from '@/middleware/authMiddleware';

// PUT /api/compras-grupales/[id]/estado → transición de estado (admin)
export default async function handler(req, res) {
  if (req.method === 'PUT') {
    return authMiddleware(['Admin', 'Administrador'])(compraGrupalController.transitionState)(req, res);
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
