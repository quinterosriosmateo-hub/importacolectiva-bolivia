import React, { useEffect, useState, useRef } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Divider, IconButton, 
  List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Button, CircularProgress, useTheme, alpha, Chip, TextField, Avatar
} from '@mui/material';
import { useRouter } from 'next/router';
import { useApiService } from '@/hooks/useApiService';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { Constantes } from '@/utils/constants';

// Icons
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import DescriptionIcon from '@mui/icons-material/Description';
import SendIcon from '@mui/icons-material/Send';
import SchoolIcon from '@mui/icons-material/School';
import Confetti from 'react-confetti';
import YouTube from 'react-youtube';

export default function CourseDetail() {
  const router = useRouter();
  const { id } = router.query;
  const theme = useTheme();
  const { getApiService, postApiService } = useApiService();
  const { user } = useAuth();
  const { notify } = useNotification();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchCourse = async () => {
      setLoading(true);
      const res = await getApiService(`${Constantes.apiCourses}/${id}`, { 
        requireAuth: !!user,
        errorMessage: false // Manejaremos el error manualmente para redirigir si es premium
      });
      
      if (!res || res.code !== 0) {
        if (res?.requiresPremium) {
          notify('Este curso es exclusivo para usuarios Premium.', 'warning');
          router.push('/subscription');
        } else {
          notify('Error al cargar el curso', 'error');
          router.push('/courses');
        }
        return;
      }

      setCourse(res.course);
      
      // Select first lesson by default if none active
      if (res.course?.lecciones?.length > 0) {
        // Tratar de encontrar la primera no completada, o la primera si todas están completadas
        const firstIncomplete = res.course.lecciones.find(l => !l.completada);
        setActiveLesson(firstIncomplete || res.course.lecciones[0]);
      }
      
      setLoading(false);
    };

    fetchCourse();
  }, [id, user, getApiService, notify, router]);

  // Load comments when active lesson changes
  useEffect(() => {
    if (!activeLesson) return;
    
    const fetchComments = async () => {
      const res = await getApiService(`${Constantes.apiCoursesComments}?lessonId=${activeLesson.id}`, { requireAuth: false });
      if (res && res.comments) {
        setComments(res.comments);
      }
    };
    fetchComments();
  }, [activeLesson, getApiService]);

  const handleLessonSelect = (lesson) => {
    if (!user && course?.es_premium) return; // Prevent selection if somehow bypassed
    setActiveLesson(lesson);
  };

  const handleCompleteLesson = async () => {
    if (!user || !course || !activeLesson || activeLesson.completada) return;

    const res = await postApiService(Constantes.apiCoursesProgress, {
      courseId: course.id,
      lessonId: activeLesson.id
    }, { requireAuth: true });

    if (res && res.code === 0) {
      if (res.xpAwarded > 0) {
        notify(`¡Lección completada! +${res.xpAwarded} XP`, 'success');
      }
      
      // Update local state
      setCourse(prev => {
        const newLessons = prev.lecciones.map(l => 
          l.id === activeLesson.id ? { ...l, completada: true } : l
        );
        const completedCount = newLessons.filter(l => l.completada).length;
        const newProgress = Math.round((completedCount / newLessons.length) * 100);
        return { ...prev, lecciones: newLessons, progresoPorcentaje: newProgress };
      });

      setActiveLesson(prev => ({ ...prev, completada: true }));

      // Check if course was completed just now
      if (res.courseCompleted) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000); // Stop confetti after 5s
        notify('¡Felicidades! Has completado el curso al 100%.', 'success', 6000);
      } else {
        // Auto advance to next lesson
        const nextLesson = course.lecciones.find(l => l.orden === activeLesson.orden + 1);
        if (nextLesson) {
          setTimeout(() => setActiveLesson(nextLesson), 1500);
        }
      }
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || !user || !activeLesson) return;

    const res = await postApiService(Constantes.apiCoursesComments, {
      lessonId: activeLesson.id,
      content: newComment
    }, { requireAuth: true });

    if (res && res.code === 0) {
      setComments([{
        id: res.comment.id,
        contenido: res.comment.contenido,
        created_at: res.comment.created_at,
        usuario_id: user.id
      }, ...comments]);
      setNewComment('');
    }
  };

  if (loading || !course) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={500} />}
      
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => router.push('/courses')}
        sx={{ mb: 2, color: 'text.secondary', fontWeight: 600 }}
      >
        Volver a la Academia
      </Button>

      {/* Header */}
      <Card sx={{ mb: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', bgcolor: 'background.paper' }}>
        <CardContent sx={{ p: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: 'center' }}>
          <Avatar 
            src={course.imagen_url} 
            variant="rounded" 
            sx={{ width: 100, height: 100, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          >
            <SchoolIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
              <Chip label={course.categoria} color="primary" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
              <Chip label={course.nivel} variant="outlined" color="secondary" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
              {course.es_premium && (
                <Chip icon={<WorkspacePremiumIcon />} label="Premium" color="warning" size="small" sx={{ fontWeight: 800, color: '#fff', height: 20, fontSize: '0.65rem' }} />
              )}
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.01em', color: 'primary.main' }}>
              {course.titulo}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 800 }}>
              {course.descripcion}
            </Typography>
          </Box>
          
          {/* Circular Progress */}
          {user && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 120 }}>
              <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress variant="determinate" value={100} size={80} sx={{ color: theme.palette.grey[200] }} thickness={5} />
                <CircularProgress variant="determinate" value={course.progresoPorcentaje || 0} size={80} color="secondary" thickness={5} sx={{ position: 'absolute', left: 0 }} />
                <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="subtitle1" component="div" color="text.primary" fontWeight={800}>
                    {course.progresoPorcentaje || 0}%
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, fontWeight: 700, textTransform: 'uppercase' }}>
                Completado
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Grid container spacing={4}>
        {/* Left Column - Video & Content */}
        <Grid item xs={12} lg={9}>
          {activeLesson ? (
            <Box key={activeLesson.id}>
              {/* Video Player - Máximo ancho posible */}
              <Box sx={{
                width: '100%',
                aspectRatio: '16 / 9',
                minHeight: { xs: '200px', md: '400px', lg: '500px' }, // Fuerza una altura mínima
                bgcolor: '#000', 
                borderRadius: 3, 
                overflow: 'hidden',
                mb: 3,
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                position: 'relative' // Asegura que el contenido interno respete el contenedor
              }}>
                <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                {(() => {
                  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                  const match = activeLesson.video_url?.match(regExp);
                  const videoId = (match && match[2].length === 11) ? match[2] : null;

                  if (videoId) {
                    return (
                      <YouTube 
                        videoId={videoId} 
                        opts={{ width: '100%', height: '100%', playerVars: { autoplay: 0 } }}
                        style={{ width: '100%', height: '100%' }}
                        onEnd={handleCompleteLesson}
                      />
                    );
                  }
                  return (
                    <iframe
                      style={{ width: '100%', height: '100%', border: 0 }}
                      src={activeLesson.video_url}
                      title="YouTube video player"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  );
                })()}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                <Box>
                  <Typography variant="h5" fontWeight={800} mb={1}>
                    {activeLesson.orden}. {activeLesson.titulo}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activeLesson.descripcion}
                  </Typography>
                </Box>
                {user && (
                  <Button 
                    variant={activeLesson.completada ? "outlined" : "contained"} 
                    color={activeLesson.completada ? "success" : "primary"}
                    startIcon={activeLesson.completada ? <CheckCircleIcon /> : <PlayCircleFilledIcon />}
                    onClick={handleCompleteLesson}
                    disabled={activeLesson.completada}
                    sx={{ borderRadius: 8, px: 3, fontWeight: 700 }}
                  >
                    {activeLesson.completada ? 'Completada' : 'Marcar Completada'}
                  </Button>
                )}
              </Box>

              <Divider sx={{ mb: 4 }} />

              {/* Comments Section */}
              <Typography variant="h6" fontWeight={800} mb={3}>Comentarios ({comments.length})</Typography>
              
              {user ? (
                <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                  <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>{user.email?.[0].toUpperCase() || 'U'}</Avatar>
                  <TextField 
                    fullWidth
                    placeholder="Escribe un comentario o pregunta..."
                    variant="outlined"
                    size="small"
                    multiline
                    rows={2}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handlePostComment();
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <IconButton color="primary" onClick={handlePostComment} disabled={!newComment.trim()}>
                          <SendIcon />
                        </IconButton>
                      )
                    }}
                  />
                </Box>
              ) : (
                <Box sx={{ p: 2, bgcolor: theme.palette.grey[100], borderRadius: 2, mb: 4, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Inicia sesión para dejar un comentario.
                  </Typography>
                </Box>
              )}

              <List sx={{ p: 0 }}>
                {comments.map((comment) => (
                  <ListItem key={comment.id} alignItems="flex-start" sx={{ px: 0, py: 2 }}>
                    <ListItemIcon sx={{ minWidth: 56 }}>
                      <Avatar sx={{ width: 40, height: 40, bgcolor: theme.palette.grey[300] }}>
                        <PersonIcon sx={{ color: theme.palette.grey[600] }} />
                      </Avatar>
                    </ListItemIcon>
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          Usuario ImportaColectiva
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-line' }}>
                        {comment.contenido}
                      </Typography>
                    </Box>
                  </ListItem>
                ))}
                {comments.length === 0 && (
                  <Typography variant="body2" color="text.secondary" fontStyle="italic" sx={{ py: 2 }}>
                    No hay comentarios aún. ¡Sé el primero!
                  </Typography>
                )}
              </List>
            </Box>
          ) : (
            <Box sx={{ p: 6, textAlign: 'center', bgcolor: theme.palette.grey[50], borderRadius: 4 }}>
              <Typography variant="h6" color="text.secondary">Selecciona una lección para comenzar</Typography>
            </Box>
          )}
        </Grid>

        {/* Right Column - Lesson List */}
        <Grid item xs={12} lg={3}>
          <Card sx={{ borderRadius: 4, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', position: 'sticky', top: 90 }}>
            <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.grey[50] }}>
              <Typography variant="h6" fontWeight={800}>
                Contenido del Curso
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {course.lecciones?.length || 0} lecciones
              </Typography>
            </Box>
            
            <List sx={{ p: 0, maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }} className="no-scrollbar">
              {course.lecciones?.map((lesson) => {
                const isActive = activeLesson?.id === lesson.id;
                const Icon = lesson.tipo === 'documento' ? DescriptionIcon : PlayCircleFilledIcon;
                
                return (
                  <React.Fragment key={lesson.id}>
                    <ListItem disablePadding>
                      <ListItemButton 
                        selected={isActive}
                        onClick={() => handleLessonSelect(lesson)}
                        sx={{ 
                          py: 2,
                          px: 3,
                          '&.Mui-selected': {
                            bgcolor: alpha(theme.palette.primary.main, 0.08),
                            borderLeft: `4px solid ${theme.palette.primary.main}`,
                          }
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {lesson.completada ? (
                            <CheckCircleIcon color="success" />
                          ) : (
                            <Icon color={isActive ? "primary" : "action"} />
                          )}
                        </ListItemIcon>
                        <ListItemText 
                          primary={
                            <Typography variant="subtitle2" fontWeight={isActive ? 800 : 600} color={isActive ? "primary.main" : "text.primary"}>
                              {lesson.orden}. {lesson.titulo}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                              {lesson.duracion_min} min {lesson.tipo === 'documento' && '• Lectura'}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                );
              })}
            </List>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
// Stub for PersonIcon
const PersonIcon = (props) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);
