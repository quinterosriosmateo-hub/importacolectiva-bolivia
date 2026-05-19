import { authController } from '@/controllers/authController';
import { withAuth } from '@/lib/withAuth';

async function handler(req, res) {
  return await authController.getSession(req, res);
}

export default withAuth(handler);
