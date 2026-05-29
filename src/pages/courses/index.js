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
  useTheme,
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

export default function CoursesCatalog() {
  const router = useRouter();
  const theme = useTheme();
  const { getApiService, postApiService } = useApiService();
  const { user } = useAuth();
  
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch courses and stats
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
    
    // Optimistic update
    setCourses(prev => prev.map(c => 
      c.id === courseId ? { ...c, isFavorite: !isFavorite } : c
    ));

    const res = await postApiService(Constantes.apiCoursesFavorites, { courseId }, { requireAuth: true });
    
    if (!res || res.code !== 0) {
      // Revert if failed
      setCourses(prev => prev.map(c => 
        c.id === courseId ? { ...c, isFavorite: isFavorite } : c
      ));
    }
  };

  const openCourse = (courseId, esPremium) => {
    if (esPremium && !user) {
      router.push('/login');
      return;
    }
    router.push(`/courses/${courseId}`);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', mb: 0.5 }}>
          Academia ImportaColectiva
        </Typography>
        <Typography variant="body1" color="text.secondary" fontWeight={500}>
          Aprende a importar desde cero con nuestros cursos interactivos.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Main Content - Course Grid */}
        <Grid item xs={12} md={user ? 8 : 12}>
          <Grid container spacing={3}>
            {loading ? (
              // Skeleton loaders
              [1, 2, 3, 4].map((i) => (
                <Grid item xs={12} sm={6} key={i}>
                  <Card sx={{ borderRadius: 4, height: 320 }}>
                    <Skeleton variant="rectangular" height={160} />
                    <CardContent>
                      <Skeleton variant="text" height={40} />
                      <Skeleton variant="text" height={20} />
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              courses.map((course) => (
                <Grid item xs={12} sm={6} key={course.id}>
                  <Card 
                    sx={{ 
                      borderRadius: 4, 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      position: 'relative',
                      border: `1px solid ${theme.palette.divider}`,
                      boxShadow: 'none',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.1)}`,
                        borderColor: alpha(theme.palette.primary.main, 0.3)
                      }
                    }}
                    onClick={() => openCourse(course.id, course.es_premium)}
                  >
                    {/* Favorite Button */}
                    <IconButton 
                      onClick={(e) => handleToggleFavorite(e, course.id, course.isFavorite)}
                      sx={{ 
                        position: 'absolute', 
                        top: 10, 
                        right: 10, 
                        bgcolor: 'rgba(255,255,255,0.8)',
                        '&:hover': { bgcolor: 'white' },
                        zIndex: 2
                      }}
                      size="small"
                    >
                      {course.isFavorite ? 
                        <FavoriteIcon color="error" /> : 
                        <FavoriteBorderIcon color="action" />
                      }
                    </IconButton>

                    {/* Premium Badge */}
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

                {course.imagen_url ? (
                  <CardMedia
                    component="img"
                    height="160"
                    image={course.imagen_url}
                    alt={course.titulo}
                    sx={{ 
                      bgcolor: theme.palette.grey[200],
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <Box sx={{ position: 'relative', height: 160, bgcolor: theme.palette.grey[200], overflow: 'hidden' }}>
                    {/* Generative placeholder if no image */}
                    <Box sx={{ 
                      width: '100%', 
                      height: '100%', 
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      opacity: 0.8
                    }}>
                      <PlayCircleOutlinedIcon sx={{ fontSize: 60, opacity: 0.5 }} />
                    </Box>
                  </Box>
                )}

                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5 }}>
                        <Chip label={course.categoria} size="small" variant="outlined" color="primary" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }} />
                        <Chip label={course.nivel} size="small" variant="outlined" color="secondary" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }} />
                      </Box>
                      
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1, lineHeight: 1.2 }}>
                        {course.titulo}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {course.descripcion}
                      </Typography>

                      {/* Progress Bar (if logged in) */}
                      {user && course.progresoPorcentaje !== undefined && (
                        <Box sx={{ mt: 'auto' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>Progreso</Typography>
                            <Typography variant="caption" color="primary.main" fontWeight={700}>{course.progresoPorcentaje || 0}%</Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={course.progresoPorcentaje || 0} 
                            sx={{ height: 6, borderRadius: 3 }}
                          />
                        </Box>
                      )}
                      
                      {!user && course.es_premium && (
                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                          <LockIcon fontSize="small" />
                          <Typography variant="caption" fontWeight={600}>Inicia sesión para acceder</Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Grid>

        {/* Gamification Sidebar (Only if logged in) */}
        {user && (
          <Grid item xs={12} md={4}>
            <Box sx={{ position: 'sticky', top: 90 }}>
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
                      {/* Nivel y XP */}
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
                          <LinearProgress 
                            variant="determinate" 
                            value={(stats.currentLevelXp / stats.nextLevelXp) * 100} 
                            color="secondary"
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                      </Box>

                      {/* Racha */}
                      <Box sx={{ 
                        p: 2, borderRadius: 3, 
                        bgcolor: alpha(theme.palette.secondary.main, 0.1),
                        display: 'flex', alignItems: 'center', gap: 2, mb: 3
                      }}>
                        <LocalFireDepartmentIcon sx={{ fontSize: 40, color: theme.palette.secondary.main }} />
                        <Box>
                          <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1 }}>
                            {stats.streak} {stats.streak === 1 ? 'Día' : 'Días'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            Racha de estudio
                          </Typography>
                        </Box>
                      </Box>

                      {/* Logros */}
                      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, textTransform: 'uppercase', color: 'text.secondary' }}>
                        Logros Obtenidos
                      </Typography>
                      {stats.badges?.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {stats.badges.map(badge => (
                            <Chip 
                              key={badge.id}
                              icon={<span style={{ fontSize: '1.2rem', marginLeft: 4 }}>{badge.icon}</span>}
                              label={badge.name}
                              variant="outlined"
                              sx={{ fontWeight: 600, borderColor: theme.palette.divider }}
                            />
                          ))}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" fontStyle="italic">
                          Aún no tienes logros. ¡Completa lecciones para ganar insignias!
                        </Typography>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
              
              {!user.isPremium && (
                <Card sx={{ 
                  borderRadius: 4, 
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                  color: 'white',
                  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`
                }}>
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <WorkspacePremiumIcon sx={{ fontSize: 48, color: theme.palette.warning.main, mb: 1 }} />
                    <Typography variant="h6" fontWeight={800} mb={1}>Desbloquea Todo</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                      Actualiza a Premium para acceder a tácticas avanzadas y negociaciones maestras.
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="warning" 
                      fullWidth 
                      sx={{ fontWeight: 700, color: 'primary.dark' }}
                      onClick={() => router.push('/subscription')}
                    >
                      Ver Planes
                    </Button>
                  </CardContent>
                </Card>
              )}
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
