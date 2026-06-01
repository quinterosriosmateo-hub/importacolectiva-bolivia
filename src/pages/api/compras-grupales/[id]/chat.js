import { compraGrupalController } from '@/controllers/compraGrupalController';
import { authMiddleware } from '@/middleware/authMiddleware';

// GET  /api/compras-grupales/[id]/chat → obtener mensajes (participantes)
// POST /api/compras-grupales/[id]/chat → enviar mensaje (participantes)
export default async function handler(req, res) {
  if (req.method === 'GET') {
    return authMiddleware()(compraGrupalController.getChatMessages)(req, res);
  } else if (req.method === 'POST') {
    return authMiddleware()(compraGrupalController.sendChatMessage)(req, res);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
