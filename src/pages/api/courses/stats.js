import { coursesController } from '@/controllers/coursesController';
import { withAuth } from '@/lib/withAuth';

async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  
  return await coursesController.getStats(req, res);
}

export default withAuth(handler);
