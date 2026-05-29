import { withAdminAuth } from '@/middleware/adminMiddleware';
import { adminCoursesController } from '@/controllers/adminCoursesController';

async function handler(req, res) {
  if (req.method === 'PUT') {
    return adminCoursesController.updateCourse(req, res);
  } else if (req.method === 'DELETE') {
    return adminCoursesController.deleteCourse(req, res);
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAdminAuth(handler);
