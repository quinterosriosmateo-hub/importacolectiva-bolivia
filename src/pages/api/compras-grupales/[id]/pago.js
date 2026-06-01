import { compraGrupalController } from '@/controllers/compraGrupalController';
import { authMiddleware } from '@/middleware/authMiddleware';

// POST /api/compras-grupales/[id]/pago → registrar pago en retención (escrow)
// Solo el propio usuario o admin puede registrar un pago
export default async function handler(req, res) {
  if (req.method === 'POST') {
    return authMiddleware()(compraGrupalController.registrarPago)(req, res);
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
