import { coursesController } from '@/controllers/coursesController';
import { supabase } from '@/lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Soft-auth (igual que en index.js)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    req.token = token;
    
    if (token === 'mock-admin-token' && process.env.NODE_ENV === 'development') {
      req.user = { id: '00000000-0000-0000-0000-000000000000' };
    } else {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user) req.user = user;
    }
  }

  return await coursesController.getCourse(req, res);
}
