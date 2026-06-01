import { compraGrupalController } from '@/controllers/compraGrupalController';
import { authMiddleware } from '@/middleware/authMiddleware';

// GET  /api/compras-grupales/[id]/participantes  → lista de participantes (público)
// POST /api/compras-grupales/[id]/participantes  → confirmar pago de un participante (admin)
export default async function handler(req, res) {
  if (req.method === 'GET') {
    return await compraGrupalController.getParticipants(req, res);
  } else if (req.method === 'POST') {
    // Solo admins pueden confirmar pagos
    return authMiddleware(['Admin', 'Administrador'])(compraGrupalController.confirmarPago)(req, res);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
