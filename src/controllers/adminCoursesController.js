import { supabase } from '@/lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';

const getAuthenticatedClient = (token) => {
  if (!token) return supabase;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: { Authorization: `Bearer ${token}` }
      }
    }
  );
};

export const adminCoursesController = {
  // ===================== CURSOS =====================

  async getCourses(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    
    try {
      const client = getAuthenticatedClient(req.token);
      const { data, error } = await client
        .from('curso')
        .select(`
          *,
          lecciones:leccion(count)
        `)
        .order('orden', { ascending: true });
        
      if (error) throw error;
      return res.status(200).json({ code: 0, courses: data });
    } catch (err) {
      return res.status(500).json({ code: 1, error: err.message });
    }
  },

  async createCourse(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    const { titulo, descripcion, imagen_url, categoria, nivel, es_premium, orden } = req.body;
    try {
      const client = getAuthenticatedClient(req.token);
      const { data, error } = await client
        .from('curso')
        .insert({ titulo, descripcion, imagen_url, categoria, nivel, es_premium, orden })
        .select()
        .single();
        
      if (error) throw error;
      return res.status(201).json({ code: 0, course: data });
    } catch (err) {
      return res.status(500).json({ code: 1, error: err.message });
    }
  },

  async updateCourse(req, res) {
    if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });
    
    const { id } = req.query;
    const { titulo, descripcion, imagen_url, categoria, nivel, es_premium, orden } = req.body;
    try {
      const client = getAuthenticatedClient(req.token);
      const { data, error } = await client
        .from('curso')
        .update({ titulo, descripcion, imagen_url, categoria, nivel, es_premium, orden })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return res.status(200).json({ code: 0, course: data });
    } catch (err) {
      return res.status(500).json({ code: 1, error: err.message });
    }
  },

  async deleteCourse(req, res) {
    if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });
    
    const { id } = req.query;
    try {
      const client = getAuthenticatedClient(req.token);
      const { error } = await client
        .from('curso')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return res.status(200).json({ code: 0, message: 'Deleted successfully' });
    } catch (err) {
      return res.status(500).json({ code: 1, error: err.message });
    }
  },

  // ===================== LECCIONES =====================

  async getLessonsByCourse(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    
    const { id: courseId } = req.query;
    try {
      const client = getAuthenticatedClient(req.token);
      const { data, error } = await client
        .from('leccion')
        .select('*')
        .eq('curso_id', courseId)
        .order('orden', { ascending: true });
        
      if (error) throw error;
      return res.status(200).json({ code: 0, lessons: data });
    } catch (err) {
      return res.status(500).json({ code: 1, error: err.message });
    }
  },

  async createLesson(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    
    const { id: courseId } = req.query; // comes from /api/admin/courses/[id]/lessons
    const { titulo, descripcion, video_url, duracion_min, orden, tipo, recurso_descargable_url } = req.body;
    
    try {
      const client = getAuthenticatedClient(req.token);
      const { data, error } = await client
        .from('leccion')
        .insert({ 
          curso_id: courseId, 
          titulo, 
          descripcion, 
          video_url, 
          duracion_min, 
          orden, 
          tipo, 
          recurso_descargable_url 
        })
        .select()
        .single();
        
      if (error) throw error;
      return res.status(201).json({ code: 0, lesson: data });
    } catch (err) {
      return res.status(500).json({ code: 1, error: err.message });
    }
  },

  async updateLesson(req, res) {
    if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' });
    
    const { id } = req.query; // this is the lesson ID
    const { titulo, descripcion, video_url, duracion_min, orden, tipo, recurso_descargable_url } = req.body;
    
    try {
      const client = getAuthenticatedClient(req.token);
      const { data, error } = await client
        .from('leccion')
        .update({ titulo, descripcion, video_url, duracion_min, orden, tipo, recurso_descargable_url })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return res.status(200).json({ code: 0, lesson: data });
    } catch (err) {
      return res.status(500).json({ code: 1, error: err.message });
    }
  },

  async deleteLesson(req, res) {
    if (req.method !== 'DELETE') return res.status(405).json({ error: 'Method not allowed' });
    
    const { id } = req.query; // this is the lesson ID
    try {
      const client = getAuthenticatedClient(req.token);
      const { error } = await client
        .from('leccion')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return res.status(200).json({ code: 0, message: 'Deleted successfully' });
    } catch (err) {
      return res.status(500).json({ code: 1, error: err.message });
    }
  }
};
