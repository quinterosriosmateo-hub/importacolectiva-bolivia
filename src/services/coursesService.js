import { coursesRepository } from '@/repositories/coursesRepository';
import { subscriptionService } from '@/services/subscriptionService';

export const coursesService = {
  /**
   * Obtiene todos los cursos con información de progreso si el usuario está autenticado
   */
  async listCourses(userId, token) {
    const courses = await coursesRepository.getCourses(token);
    
    if (!userId) {
      return courses.map(c => ({ ...c, progresoPorcentaje: 0 }));
    }

    // Si hay usuario, calculamos su progreso para cada curso
    try {
      const allProgress = await coursesRepository.getAllUserProgress(userId, token);
      const favorites = await coursesRepository.getFavorites(userId, token);
      
      return courses.map(course => {
        // Encontrar progreso de este curso
        const courseProgress = allProgress.filter(p => p.curso_id === course.id);
        
        // Calcular porcentaje (requeriríamos saber total de lecciones, por ahora aproximamos o contamos)
        // En una app real haríamos un JOIN count, aquí estimaremos si el frontend lo necesita,
        // o pasamos la cuenta de lecciones completadas.
        
        return {
          ...course,
          leccionesCompletadas: courseProgress.length,
          isFavorite: favorites.includes(course.id)
        };
      });
    } catch (err) {
      console.error('Error in coursesService.listCourses:', err);
      return courses;
    }
  },

  /**
   * Obtiene el detalle de un curso, verificando si el usuario tiene acceso
   */
  async getCourseDetails(courseId, userId, token) {
    const course = await coursesRepository.getCourseById(courseId, token);
    if (!course) {
      return { error: new Error('Curso no encontrado'), status: 404 };
    }

    // Verificar permisos para cursos premium
    if (course.es_premium) {
      if (!userId) {
        return { error: new Error('Debes iniciar sesión para ver este curso premium.'), status: 401 };
      }
      
      const sub = await subscriptionService.getSubscription(userId, token);
      const hasAccess = sub && sub.plan === 'Premium' && ['Activa', 'Cancelada'].includes(sub.estado);
      
      if (!hasAccess) {
        return { 
          error: new Error('Este curso requiere una suscripción Premium activa.'), 
          status: 403,
          requiresPremium: true
        };
      }
    }

    // Si está autenticado, cargar progreso y favoritos
    if (userId) {
      const progress = await coursesRepository.getProgress(userId, courseId, token);
      const favorites = await coursesRepository.getFavorites(userId, token);
      
      course.isFavorite = favorites.includes(course.id);
      
      // Mapear lecciones completadas
      const completedLessonIds = progress.map(p => p.leccion_id);
      course.lecciones = course.lecciones.map(lesson => ({
        ...lesson,
        completada: completedLessonIds.includes(lesson.id)
      }));
      
      course.progresoPorcentaje = course.lecciones.length > 0 
        ? Math.round((progress.length / course.lecciones.length) * 100) 
        : 0;
    } else {
      course.isFavorite = false;
      course.progresoPorcentaje = 0;
      course.lecciones = course.lecciones.map(l => ({ ...l, completada: false }));
    }

    return { course };
  },

  /**
   * Marca una lección como completada
   */
  async completeLesson(userId, courseId, lessonId, token) {
    const XP_PER_LESSON = 25; // XP otorgado por completar una lección
    
    // Verificar si ya estaba completada para no dar XP doble
    const currentProgress = await coursesRepository.getProgress(userId, courseId, token);
    const alreadyCompleted = currentProgress.some(p => p.leccion_id === lessonId);
    
    if (alreadyCompleted) {
      return { message: 'Lección ya estaba completada', xpAwarded: 0 };
    }

    await coursesRepository.markLessonComplete(userId, courseId, lessonId, XP_PER_LESSON, token);
    
    // Revisar si con esta lección completó el curso al 100%
    const course = await coursesRepository.getCourseById(courseId, token);
    const newProgress = await coursesRepository.getProgress(userId, courseId, token);
    
    const isCourseCompleted = newProgress.length >= course.lecciones.length;
    
    return { 
      message: 'Lección completada con éxito', 
      xpAwarded: XP_PER_LESSON,
      courseCompleted: isCourseCompleted
    };
  },

  /**
   * Toggle favorito
   */
  async toggleFavorite(userId, courseId, token) {
    return await coursesRepository.toggleFavorite(userId, courseId, token);
  },

  /**
   * Obtiene comentarios y añade información del usuario mock (para frontend demo)
   */
  async getLessonComments(lessonId, token) {
    // En una app real haríamos un JOIN con auth.users para traer nombre y foto
    // Como estamos en un contexto donde no siempre tenemos esa tabla accesible fácilmente 
    // desde el public schema sin configuraciones extra, lo simularemos/retornaremos directo.
    const comments = await coursesRepository.getComments(lessonId, token);
    return comments;
  },

  async addComment(userId, lessonId, content, token) {
    return await coursesRepository.addComment(userId, lessonId, content, token);
  },

  /**
   * Calcula estadísticas de gamificación basadas en el historial del usuario
   */
  async getUserStats(userId, token) {
    const progress = await coursesRepository.getAllUserProgress(userId, token);
    
    // Calcular XP total
    const totalXp = progress.reduce((sum, item) => sum + (item.xp_ganado || 0), 0);
    
    // Calcular nivel (ejemplo: 100 XP por nivel)
    const level = Math.floor(totalXp / 100) + 1;
    const currentLevelXp = totalXp % 100;
    const nextLevelXp = 100;
    
    // Calcular racha (días consecutivos)
    let currentStreak = 0;
    if (progress.length > 0) {
      // Agrupar por fecha
      const dates = progress
        .map(p => new Date(p.fecha_completada).toDateString())
        .filter((value, index, self) => self.indexOf(value) === index); // unique dates
      
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      
      // Lógica muy básica de racha
      if (dates.includes(today) || dates.includes(yesterday)) {
        currentStreak = 1;
        // Se podría iterar hacia atrás para encontrar la racha real
      }
    }

    // Calcular logros básicos
    const badges = [];
    if (progress.length >= 1) badges.push({ id: 'first_lesson', name: 'Primer Paso', icon: '🎯' });
    if (progress.length >= 5) badges.push({ id: 'five_lessons', name: 'Estudiante Aplicado', icon: '📚' });
    if (totalXp >= 500) badges.push({ id: 'level_5', name: 'Nivel 5', icon: '⭐' });

    return {
      totalXp,
      level,
      currentLevelXp,
      nextLevelXp,
      streak: currentStreak,
      completedLessonsCount: progress.length,
      badges
    };
  }
};
