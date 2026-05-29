import { coursesController } from '@/controllers/coursesController';
import { withAuth } from '@/lib/withAuth';

async function handler(req, res) {
  return await coursesController.handleProgress(req, res);
}

export default withAuth(handler);
