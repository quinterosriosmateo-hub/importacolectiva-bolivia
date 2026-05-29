import { supabase } from '@/lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';

const getAuthenticatedClient = (token) => {
  if (!token) return supabase;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        },
        fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' })
      }
    }
  );
};

export const coursesRepository = {
  /**
   * Obtiene la lista de todos los cursos
   */
  async getCourses(token = null) {
    const client = getAuthenticatedClient(token);
    const { data, error } = await client
      .from('curso')
      .select('*')
      .order('orden', { ascending: true });

    if (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
    return data;
  },

  /**
   * Obtiene el detalle de un curso junto con sus lecciones
   */
  async getCourseById(id, token = null) {
    const client = getAuthenticatedClient(token);
    
    // Obtener curso
    const { data: curso, error: cursoError } = await client
      .from('curso')
      .select('*')
      .eq('id', id)
      .single();

    if (cursoError) throw cursoError;
    if (!curso) return null;

    // Obtener lecciones
    const { data: lecciones, error: leccionesError } = await client
      .from('leccion')
      .select('*')
      .eq('curso_id', id)
      .order('orden', { ascending: true });

    if (leccionesError) throw leccionesError;

    return {
      ...curso,
      lecciones: lecciones || []
    };
  },

  /**
   * Obtiene el progreso de un usuario en un curso específico
   */
  async getProgress(userId, courseId, token) {
    const client = getAuthenticatedClient(token);
    const { data, error } = await client
      .from('progreso_curso')
      .select('*')
      .eq('usuario_id', userId)
      .eq('curso_id', courseId);

    if (error) {
      console.error('Error fetching course progress:', error);
      return [];
    }
    return data || [];
  },

  /**
   * Marca una lección como completada y otorga XP
   */
  async markLessonComplete(userId, courseId, lessonId, xpToAward, token) {
    const client = getAuthenticatedClient(token);
    
    // Intentar upsert (insertar o actualizar)
    const { data, error } = await client
      .from('progreso_curso')
      .upsert({
        usuario_id: userId,
        curso_id: courseId,
        leccion_id: lessonId,
        completada: true,
        fecha_completada: new Date().toISOString(),
        xp_ganado: xpToAward
      }, { onConflict: 'usuario_id,leccion_id' })
      .select()
      .single();

    if (error) {
      console.error('Error marking lesson complete:', error);
      throw error;
    }
    return data;
  },

  /**
   * Obtiene los cursos favoritos de un usuario
   */
  async getFavorites(userId, token) {
    const client = getAuthenticatedClient(token);
    const { data, error } = await client
      .from('favorito_curso')
      .select('curso_id')
      .eq('usuario_id', userId);

    if (error) {
      console.error('Error fetching favorites:', error);
      return [];
    }
    return data.map(f => f.curso_id);
  },

  /**
   * Agrega o elimina un curso de favoritos
   */
  async toggleFavorite(userId, courseId, token) {
    const client = getAuthenticatedClient(token);
    
    // Check if it exists
    const { data: existing, error: checkError } = await client
      .from('favorito_curso')
      .select('*')
      .eq('usuario_id', userId)
      .eq('curso_id', courseId)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existing) {
      // Remove favorite
      const { error } = await client
        .from('favorito_curso')
        .delete()
        .eq('id', existing.id);
      
      if (error) throw error;
      return { isFavorite: false };
    } else {
      // Add favorite
      const { error } = await client
        .from('favorito_curso')
        .insert({
          usuario_id: userId,
          curso_id: courseId
        });
        
      if (error) throw error;
      return { isFavorite: true };
    }
  },

  /**
   * Obtiene los comentarios de una lección
   */
  async getComments(lessonId, token = null) {
    const client = getAuthenticatedClient(token);
    const { data, error } = await client
      .from('comentario_curso')
      .select('*')
      .eq('leccion_id', lessonId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Agrega un comentario a una lección
   */
  async addComment(userId, lessonId, content, token) {
    const client = getAuthenticatedClient(token);
    const { data, error } = await client
      .from('comentario_curso')
      .insert({
        usuario_id: userId,
        leccion_id: lessonId,
        contenido: content
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Obtiene todas las lecciones completadas por el usuario en todos los cursos
   * (Usado para calcular XP total, nivel y racha)
   */
  async getAllUserProgress(userId, token) {
    const client = getAuthenticatedClient(token);
    const { data, error } = await client
      .from('progreso_curso')
      .select('*')
      .eq('usuario_id', userId)
      .eq('completada', true)
      .order('fecha_completada', { ascending: false });

    if (error) {
      console.error('Error fetching all user progress:', error);
      return [];
    }
    return data || [];
  }
};
