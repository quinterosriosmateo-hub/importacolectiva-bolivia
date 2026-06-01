import { compraGrupalController } from '@/controllers/compraGrupalController';
import { authMiddleware } from '@/middleware/authMiddleware';

// POST /api/compras-grupales/check-abandonos → procesar abandonos y crear reventas (cron/admin)
export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Verificar CRON_SECRET o rol admin
    const cronSecret = req.headers['x-cron-secret'];
    if (cronSecret && cronSecret === process.env.CRON_SECRET) {
      return await compraGrupalController.checkAbandonos(req, res);
    }
    return authMiddleware(['Admin', 'Administrador'])(compraGrupalController.checkAbandonos)(req, res);
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
