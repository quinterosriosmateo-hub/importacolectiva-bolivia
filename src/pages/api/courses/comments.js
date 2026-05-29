import { coursesController } from '@/controllers/coursesController';
import { withAuth } from '@/lib/withAuth';
import { supabase } from '@/lib/supabaseClient';

async function handler(req, res) {
  if (req.method === 'GET') {
    // Para GET (leer comentarios) no exigimos estar logueado estrictamente, pero sí intentamos cargar el token
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
    return await coursesController.handleComments(req, res);
  }

  // Para POST (escribir comentario) delegamos al controlador que validará si req.user existe, 
  // pero usaremos withAuth para forzar el login si se llama directo
  return await coursesController.handleComments(req, res);
}

// Custom export para manejar el mix de rutas autenticadas y públicas
export default async function mixedHandler(req, res) {
  if (req.method === 'GET') {
    return handler(req, res);
  } else {
    // Usa withAuth para POST
    return withAuth(handler)(req, res);
  }
}
