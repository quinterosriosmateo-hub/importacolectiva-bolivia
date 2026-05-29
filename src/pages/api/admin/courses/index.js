import { withAdminAuth } from '@/middleware/adminMiddleware';
import { adminCoursesController } from '@/controllers/adminCoursesController';

async function handler(req, res) {
  if (req.method === 'GET') {
    return adminCoursesController.getCourses(req, res);
  } else if (req.method === 'POST') {
    return adminCoursesController.createCourse(req, res);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAdminAuth(handler);
