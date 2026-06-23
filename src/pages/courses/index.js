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
  InputBase,
  Avatar,
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
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

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
      {/* Hero Section / Banner */}
      <Paper 
        elevation={0}
        sx={{ 
          p: { xs: 4, md: 6 }, 
          mb: 6, 
          borderRadius: 6, 
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(24, 119, 242, 0.2)'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.03em' }}>
            Domina las Importaciones
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, fontWeight: 400, maxWidth: 600 }}>
            Cursos prácticos diseñados por expertos para que aprendas a importar desde China y el mundo de forma segura.
          </Typography>
          
          {/* Search Bar */}
          <Paper
            sx={{ 
              p: '4px 12px', 
              display: 'flex', 
              alignItems: 'center', 
              width: { xs: '100%', sm: 400 }, 
              borderRadius: 3,
              boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
            }}
          >
            <SearchIcon sx={{ color: 'text.disabled', mr: 1 }} />
            <InputBase
              sx={{ ml: 1, flex: 1, fontWeight: 500 }}
              placeholder="¿Qué quieres aprender hoy?"
            />
          </Paper>
        </Box>
        {/* Background shapes */}
        <Box sx={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <Box sx={{ position: 'absolute', bottom: -50, right: 100, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
      </Paper>

      {/* Filter Chips / Categories */}
      <Stack direction="row" spacing={2} sx={{ mb: 4, overflowX: 'auto', pb: 1 }} className="no-scrollbar">
        <Chip icon={<FilterListIcon />} label="Todos" onClick={() => {}} sx={{ fontWeight: 700, px: 1 }} color="primary" />
        <Chip label="China" onClick={() => {}} sx={{ fontWeight: 700, px: 1 }} variant="outlined" />
        <Chip label="Logística" onClick={() => {}} sx={{ fontWeight: 700, px: 1 }} variant="outlined" />
        <Chip label="Aduanas" onClick={() => {}} sx={{ fontWeight: 700, px: 1 }} variant="outlined" />
        <Chip label="Negociación" onClick={() => {}} sx={{ fontWeight: 700, px: 1 }} variant="outlined" />
        <Chip label="E-commerce" onClick={() => {}} sx={{ fontWeight: 700, px: 1 }} variant="outlined" />
      </Stack>

      <Grid container spacing={4}>
        {/* Main Content - Course Grid */}
        <Grid size={{ xs: 12, md: user ? 8 : 12 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <PlayCircleOutlinedIcon color="primary" /> Catálogo de Cursos
          </Typography>
          <Grid container spacing={3}>
            {loading ? (
              // Skeleton loaders
              [1, 2, 3, 4].map((i) => (
                <Grid item xs={12} sm={6} key={i}>
                  <Card sx={{ borderRadius: 4, height: 320 }}>
                    <Skeleton variant="rectangular" height={160} />
                    <CardContent>
                      <Skeleton variant="text" width="60%" />
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
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
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
                        bgcolor: 'rgba(255,255,255,0.9)',
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

                    <CardMedia
                      component="img"
                      height="160"
                      // Caso 1: Validación inicial si la variable viene vacía o nula
                      image={course.imagen_url && course.imagen_url.trim() !== "" ? course.imagen_url : "/images/no-image.png"}
                      alt={course.titulo || "Imagen del curso"}
                      
                      // Caso 2: Si la URL no estaba vacía pero la imagen está rota/dañada en el servidor (Error 404)
                      onError={(e) => {
                        e.target.onerror = null; // Evita bucles infinitos si la de fallback tampoco existe
                        e.target.src = "/images/no-image.png";
                      }}
                      
                      sx={{ 
                        bgcolor: theme.palette.grey[200],
                        objectFit: 'cover'
                      }}
                    />

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
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ position: { md: 'sticky' }, top: 100, zIndex: 10 }}>
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
