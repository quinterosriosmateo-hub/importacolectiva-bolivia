import { coursesService } from '@/services/coursesService';

export const coursesController = {
  /**
   * Obtiene la lista de cursos
   */
  async listCourses(req, res) {
    try {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      const userId = req.user ? req.user.id : null;
      const courses = await coursesService.listCourses(userId, req.token);
      return res.status(200).json({ code: 0, courses });
    } catch (err) {
      console.error('[coursesController.listCourses] Error:', err);
      return res.status(500).json({ code: 1, error: 'Error interno al obtener los cursos.' });
    }
  },

  /**
   * Obtiene el detalle de un curso específico
   */
  async getCourse(req, res) {
    try {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      const { id } = req.query;
      const userId = req.user ? req.user.id : null;
      
      const { course, error, status, requiresPremium } = await coursesService.getCourseDetails(id, userId, req.token);
      
      if (error) {
        return res.status(status || 400).json({ code: 1, error: error.message, requiresPremium });
      }
      
      return res.status(200).json({ code: 0, course });
    } catch (err) {
      console.error('[coursesController.getCourse] Error:', err);
      return res.status(500).json({ code: 1, error: 'Error interno al obtener el curso.' });
    }
  },

  /**
   * Obtiene o actualiza el progreso
   */
  async handleProgress(req, res) {
    if (req.method === 'POST') {
      if (!req.user) {
        return res.status(401).json({ code: 1, error: 'No autorizado' });
      }
      
      const { courseId, lessonId } = req.body;
      if (!courseId || !lessonId) {
        return res.status(400).json({ code: 1, error: 'Faltan parámetros requeridos' });
      }

      try {
        const result = await coursesService.completeLesson(req.user.id, courseId, lessonId, req.token);
        return res.status(200).json({ code: 0, ...result });
      } catch (err) {
        console.error('[coursesController.completeLesson] Error:', err);
        return res.status(500).json({ code: 1, error: 'Error al actualizar progreso' });
      }
    } else {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ code: 1, error: `Method ${req.method} Not Allowed` });
    }
  },

  /**
   * Favoritos toggle
   */
  async handleFavorites(req, res) {
    if (req.method === 'POST') {
      if (!req.user) {
        return res.status(401).json({ code: 1, error: 'No autorizado' });
      }
      
      const { courseId } = req.body;
      if (!courseId) {
        return res.status(400).json({ code: 1, error: 'Falta courseId' });
      }

      try {
        const result = await coursesService.toggleFavorite(req.user.id, courseId, req.token);
        return res.status(200).json({ code: 0, ...result });
      } catch (err) {
        console.error('[coursesController.toggleFavorite] Error:', err);
        return res.status(500).json({ code: 1, error: 'Error al modificar favoritos' });
      }
    } else {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ code: 1, error: `Method ${req.method} Not Allowed` });
    }
  },

  /**
   * Obtiene estadísticas de gamificación
   */
  async getStats(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ code: 1, error: 'No autorizado' });
      }
      
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      const stats = await coursesService.getUserStats(req.user.id, req.token);
      return res.status(200).json({ code: 0, stats });
    } catch (err) {
      console.error('[coursesController.getStats] Error:', err);
      return res.status(500).json({ code: 1, error: 'Error al obtener estadísticas' });
    }
  },

  /**
   * Comentarios (GET y POST)
   */
  async handleComments(req, res) {
    const { lessonId } = req.query;

    if (!lessonId && req.method === 'GET') {
      return res.status(400).json({ code: 1, error: 'Falta lessonId' });
    }

    try {
      if (req.method === 'GET') {
        const comments = await coursesService.getLessonComments(lessonId, req.token);
        return res.status(200).json({ code: 0, comments });
      } 
      else if (req.method === 'POST') {
        if (!req.user) {
          return res.status(401).json({ code: 1, error: 'No autorizado' });
        }
        
        const { lessonId: postLessonId, content } = req.body;
        if (!postLessonId || !content) {
          return res.status(400).json({ code: 1, error: 'Faltan parámetros' });
        }
        
        const comment = await coursesService.addComment(req.user.id, postLessonId, content, req.token);
        return res.status(200).json({ code: 0, comment });
      } 
      else {
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ code: 1, error: `Method ${req.method} Not Allowed` });
      }
    } catch (err) {
      console.error('[coursesController.handleComments] Error:', err);
      return res.status(500).json({ code: 1, error: 'Error con comentarios' });
    }
  }
};
