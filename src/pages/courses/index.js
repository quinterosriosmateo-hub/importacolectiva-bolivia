import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia, 
  Chip, 
  LinearProgress,
  IconButton,
  Button,
  Stack,
  useTheme,
  Paper,
  alpha,
  Skeleton
} from '@mui/material';
import { useRouter } from 'next/router';
import { useApiService } from '@/hooks/useApiService';
import { useAuth } from '@/contexts/AuthContext';
import { Constantes } from '@/utils/constants';

// Icons
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LockIcon from '@mui/icons-material/Lock';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import FilterListIcon from '@mui/icons-material/FilterList';

export default function CoursesCatalog() {
  const router = useRouter();
  const theme = useTheme();
  const { getApiService, postApiService } = useApiService();
  const { user } = useAuth();
  
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      const res = await getApiService(Constantes.apiCourses, { requireAuth: false });
      if (res && res.courses) {
        setCourses(res.courses);
      }
      
      if (user) {
        const statsRes = await getApiService(Constantes.apiCoursesStats, { requireAuth: true });
        if (statsRes && statsRes.stats) {
          setStats(statsRes.stats);
        }
      }
      setLoading(false);
    };
    
    fetchCatalog();
  }, [user, getApiService]);

  const handleToggleFavorite = async (e, courseId, isFavorite) => {
    e.stopPropagation();
    if (!user) {
      router.push('/login');
      return;
    }
    
    setCourses(prev => prev.map(c => 
      c.id === courseId ? { ...c, isFavorite: !isFavorite } : c
    ));

    const res = await postApiService(Constantes.apiCoursesFavorites, { courseId }, { requireAuth: true });
    
    if (!res || res.code !== 0) {
      setCourses(prev => prev.map(c => 
        c.id === courseId ? { ...c, isFavorite: isFavorite } : c
      ));
    }
  };

  const openCourse = (courseId, esPremium) => {
    if (esPremium) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (user.role !== 'Premium') {
        router.push('/subscription');
        return;
      }
    }
    router.push(`/courses/${courseId}`);
  };


  return (
 
<Box sx={{ 
  display: 'flex', 
  flexDirection: { xs: 'column', md: 'row' }, 
  gap: 6, 
  alignItems: 'flex-start',
  padding: { xs: 12, md: 4 },
}}>
  
  {/* COLUMNA IZQUIERDA: Lista de Cursos (Se estira todo lo necesario) */}
  <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 66.66%' }, width: '100%' }}>
    <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
      <PlayCircleOutlinedIcon color="primary" /> Catálogo de Cursos
    </Typography>
    
    <Stack spacing={3}>
      {loading ? (
        [1, 2, 3].map((i) => (
          <Card key={i} sx={{ borderRadius: 4, height: 240, display: 'flex' }}>
            <Skeleton variant="rectangular" width={350} height="100%" />
            <CardContent sx={{ flex: 1 }}>
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" height={30} />
              <Skeleton variant="text" height={50} />
            </CardContent>
          </Card>
        ))
      ) : (
        courses.map((course) => (
          <Card 
            key={course.id}
            sx={{ 
              borderRadius: 4, 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              position: 'relative',
              border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              overflow: 'hidden',
              height: { sm: 240 }, 
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.1)}`,
              }
            }}
            onClick={() => openCourse(course.id, course.es_premium)}
          >
            {course.es_premium && (
              <Chip 
                icon={<WorkspacePremiumIcon sx={{ color: '#fff !important' }}/>} 
                label="Premium" 
                size="small"
                sx={{ 
                  position: 'absolute', 
                  top: 10, 
                  left: 10, 
                  bgcolor: theme.palette.warning.main,
                  color: '#fff',
                  fontWeight: 800,
                  zIndex: 2
                }} 
              />
            )}
            <CardMedia
              component="img"
              image={course.imagen_url && course.imagen_url.trim() !== "" ? course.imagen_url : "/images/no-image.png"}
              alt={course.titulo || "Imagen del curso"}
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = "/images/no-image.png";
              }}
              sx={{ 
                width: { xs: '100%', sm: 350 },
                height: { xs: 180, sm: '100%' },
                bgcolor: theme.palette.grey[200],
                objectFit: 'cover'
              }}
            />

            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2.5, overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                <Chip label={course.categoria} size="small" variant="outlined" color="primary" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }} />
                <Chip label={course.nivel} size="small" variant="outlined" color="secondary" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }} />
              </Box>
              
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5, lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {course.titulo}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {course.descripcion}
              </Typography>

              {user && course.progresoPorcentaje !== undefined && (
                <Box sx={{ mt: 'auto' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>Progreso</Typography>
                    <Typography variant="caption" color="primary.main" fontWeight={700}>{course.progresoPorcentaje || 0}%</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={course.progresoPorcentaje || 0} sx={{ height: 6, borderRadius: 3 }} />
                </Box>
              )}
              
              {!user && course.es_premium && (
                <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                  <LockIcon fontSize="small" />
                  <Typography variant="caption" fontWeight={600}>Inicia sesión para acceder</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </Stack>
  </Box>

  {/* COLUMNA DERECHA CONSTANTE: Progreso y Planes (Se queda fija al hacer scroll) */}
  {user && (
    <Box sx={{ 
      flex: { xs: '1 1 100%', md: '0 0 33.33%' }, 
      width: '100%',
      position: { md: 'sticky' }, 
      top: 100, 
      zIndex: 10 
    }}>
      {/* Tarjeta de Progreso */}
      <Card sx={{ borderRadius: 4, mb: 3, border: `1px solid ${theme.palette.divider}`, boxShadow: 'none' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmojiEventsIcon color="primary" /> Tu Progreso
          </Typography>

          {loading || !stats ? (
            <Box>
              <Skeleton height={60} sx={{ mb: 2 }} />
              <Skeleton height={60} sx={{ mb: 2 }} />
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Box sx={{ 
                  width: 80, height: 80, borderRadius: '50%', 
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto', mb: 1, border: `4px solid ${theme.palette.primary.main}`
                }}>
                  <Typography variant="h4" fontWeight={800} color="primary.main">{stats.level}</Typography>
                </Box>
                <Typography variant="subtitle1" fontWeight={700}>Nivel {stats.level}</Typography>
                <Typography variant="body2" color="text.secondary">{stats.totalXp} XP Totales</Typography>
                
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">XP Nivel actual</Typography>
                    <Typography variant="caption" fontWeight={700}>{stats.currentLevelXp} / {stats.nextLevelXp}</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={(stats.currentLevelXp / stats.nextLevelXp) * 100} color="secondary" sx={{ height: 8, borderRadius: 4 }} />
                </Box>
              </Box>

              <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.secondary.main, 0.1), display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <LocalFireDepartmentIcon sx={{ fontSize: 40, color: theme.palette.secondary.main }} />
                <Box>
                  <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1 }}>
                    {stats.streak} {stats.streak === 1 ? 'Día' : 'Días'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Racha de estudio</Typography>
                </Box>
              </Box>

              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, textTransform: 'uppercase', color: 'text.secondary' }}>Logros Obtenidos</Typography>
              {stats.badges?.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {stats.badges.map(badge => (
                    <Chip key={badge.id} icon={<span style={{ fontSize: '1.2rem', marginLeft: 4 }}>{badge.icon}</span>} label={badge.name} variant="outlined" sx={{ fontWeight: 600, borderColor: theme.palette.divider }} />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" fontStyle="italic">Aún no tienes logros. ¡Completa lecciones para ganar insignias!</Typography>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Tarjeta de Planes/Premium */}
      {user.role !== 'Premium' && (
        <Card sx={{ borderRadius: 4, background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`, color: 'white', boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}` }}>
          <CardContent sx={{ p: 3, textAlign: 'center' }}>
            <WorkspacePremiumIcon sx={{ fontSize: 48, color: theme.palette.warning.main, mb: 1 }} />
            <Typography variant="h6" fontWeight={800} mb={1}>Desbloquea Todo</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>Actualiza a Premium para acceder a tácticas avanzadas y negociaciones maestras.</Typography>
            <Button variant="contained" color="warning" fullWidth sx={{ fontWeight: 700, color: 'primary.dark' }} onClick={() => router.push('/subscription')}>Ver Planes</Button>
          </CardContent>
        </Card>
      )}
    </Box>
  )}

</Box>
  );
}