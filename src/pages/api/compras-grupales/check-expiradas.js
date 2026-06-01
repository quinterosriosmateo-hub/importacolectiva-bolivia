import { compraGrupalController } from '@/controllers/compraGrupalController';
import { authMiddleware } from '@/middleware/authMiddleware';

// POST /api/compras-grupales/check-expiradas → cerrar grupos que pasaron su fecha límite (cron/admin)
export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Verificar CRON_SECRET o rol admin
    const cronSecret = req.headers['x-cron-secret'];
    if (cronSecret && cronSecret === process.env.CRON_SECRET) {
      return await compraGrupalController.checkExpiradas(req, res);
    }
    return authMiddleware(['Admin', 'Administrador'])(compraGrupalController.checkExpiradas)(req, res);
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
