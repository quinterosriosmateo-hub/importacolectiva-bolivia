import React, { useEffect, useState, useCallback } from 'react';
import { 
  Typography, Box, CircularProgress, Grid, Paper, 
  Avatar, Chip, LinearProgress, Button, Stack, CardMedia,
  Divider, IconButton, Tooltip 
} from '@mui/material';
import { useRouter } from 'next/router';
import { useApiService } from '@/hooks/useApiService';
import { useAuth } from '@/contexts/AuthContext';
import { Constantes } from '@/utils/constants';
import Link from 'next/link';

// Subcomponents
import PromotionalCarousel from '@/pages/dashboard/PromotionalCarousel';
import ImporterStats from '@/pages/dashboard/ImporterStats';
import EducationResources from '@/pages/dashboard/EducationResources';

// Iconos
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined';
import CalculateIcon from '@mui/icons-material/Calculate';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

export default function Dashboard() {
  const [recommendedPurchases, setRecommendedPurchases] = useState([]);
  const [myPurchases, setMyPurchases] = useState([]);
  const router = useRouter();
  const { getApiService, loading: apiLoading } = useApiService();
  const { user, loading: authLoading } = useAuth();
  const [dataLoading, setDataLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (authLoading || !user) return;
    
    setDataLoading(true);
    const [allGroups, purchases] = await Promise.all([
      getApiService('/api/compras-grupales', { requireAuth: false }),
      getApiService('/api/compras-grupales/mis-compras', { requireAuth: true })
    ]);

    if (purchases && Array.isArray(purchases)) setMyPurchases(purchases);
    if (allGroups && Array.isArray(allGroups)) {
      const myIds = new Set(purchases?.map(p => p.compra_grupal_id) || []);
      // Filtramos oportunidades reales: Abiertas y donde el usuario no esté
      setRecommendedPurchases(allGroups.filter(g => g.estado === 'Abierta' && !myIds.has(g.id)).slice(0, 4));
    }
    setDataLoading(false);
  }, [authLoading, user, getApiService]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtramos compras activas (en curso)
  const activePurchases = myPurchases.filter(p => 
    ['Abierta', 'En proceso', 'Pagada', 'En tránsito', 'En aduana'].includes(p.compra_grupal?.estado)
  ).slice(0, 3);

  if (authLoading || (dataLoading && recommendedPurchases.length === 0 && myPurchases.length === 0)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress thickness={5} size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: '-0.04em', mb: 0.5 }}>
            Panel Principal
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Gestión de importaciones y oportunidades de inversión para <strong>{user?.displayName}</strong>
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
          <Chip 
            icon={<VerifiedUserIcon style={{ fontSize: 16 }} />} 
            label={`Socio ${user?.role}`} 
            variant="outlined" 
            color="success" 
            sx={{ fontWeight: 700, borderRadius: 2 }} 
          />
        </Stack>
      </Box>

      {/* Hero - Impacto Visual */}
      <PromotionalCarousel />

      {/* Resumen Métrico */}
      <ImporterStats user={user} />

      <Grid container spacing={4}>
        {/* Columna Principal (Izquierda): Operaciones y Ofertas */}
        <Grid item xs={12} lg={8}>
          
          {/* Sección: Mis Importaciones Activas */}
          <Box sx={{ mb: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <LocalShippingIcon color="primary" /> Seguimiento Logístico
              </Typography>
              <Button component={Link} href="/mis-compras" size="small" endIcon={<ArrowForwardIcon />} sx={{ fontWeight: 700 }}>
                Ver historial
              </Button>
            </Box>

            {activePurchases.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 4, borderStyle: 'dashed' }}>
                <ShoppingBagIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  No tienes importaciones activas en este momento.
                </Typography>
                <Button component={Link} href="/compras-grupales" variant="text" sx={{ mt: 1, fontWeight: 700 }}>
                  Explorar oportunidades
                </Button>
              </Paper>
            ) : (
              <Stack spacing={2}>
                {activePurchases.map((purchase) => {
                  const compra = purchase.compra_grupal || {};
                  return (
                    <Paper 
                      key={purchase.id} 
                      variant="outlined" 
                      sx={{ 
                        p: 2, borderRadius: 4, transition: 'all 0.2s',
                        '&:hover': { borderColor: 'primary.main', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }
                      }}
                    >
                      <Grid container alignItems="center" spacing={2}>
                        <Grid item xs={12} sm={2}>
                          <Avatar src={compra.imagen_url} variant="rounded" sx={{ width: 60, height: 60, borderRadius: 2 }} />
                        </Grid>
                        <Grid item xs={12} sm={5}>
                          <Typography variant="subtitle2" fontWeight={800} noWrap>{compra.titulo}</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Chip label={compra.estado} size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }} />
                            <Typography variant="caption" color="text.secondary">USD ${Number(purchase.monto).toLocaleString()}</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Box sx={{ width: '100%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" fontWeight={700}>Progreso</Typography>
                              <Typography variant="caption" color="primary.main" fontWeight={800}>45%</Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={45} sx={{ height: 6, borderRadius: 3 }} />
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={1} sx={{ textAlign: 'right' }}>
                          <IconButton component={Link} href={`/compras-grupales/${purchase.compra_grupal_id}`} size="small">
                            <ArrowForwardIcon fontSize="small" />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Box>

          {/* Sección: Oportunidades de Inversión Reales */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <TrendingUpIcon color="primary" /> Oportunidades de Inversión
              </Typography>
              <Button component={Link} href="/compras-grupales" size="small" endIcon={<ArrowForwardIcon />} sx={{ fontWeight: 700 }}>
                Explorar todas
              </Button>
            </Box>

            <Grid container spacing={3}>
              {recommendedPurchases.length === 0 ? (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">No hay nuevas oportunidades en este momento.</Typography>
                </Grid>
              ) : (
                recommendedPurchases.map((compra) => {
                  const progreso = (compra.participantes_count / (compra.cupo_maximo || 1)) * 100;
                  const inversionIndividual = (compra.costo_total / (compra.cupo_maximo || 1)).toLocaleString();
                  
                  return (
                    <Grid item xs={12} sm={6} key={compra.id}>
                      <Paper variant="outlined" sx={{ 
                        p: 0, borderRadius: 4, overflow: 'hidden', transition: 'all 0.2s',
                        '&:hover': { borderColor: 'primary.main', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }
                      }}>
                        <Box sx={{ position: 'relative', height: 140 }}>
                          <CardMedia
                            component="img"
                            image={compra.imagen_url || 'https://via.placeholder.com/400x200'} 
                            alt={compra.titulo}
                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <Chip 
                            label="ABIERTA" 
                            size="small" 
                            color="success" 
                            sx={{ position: 'absolute', top: 12, right: 12, fontWeight: 800, fontSize: '0.6rem' }} 
                          />
                        </Box>
                        <Box sx={{ p: 2 }}>
                          <Typography variant="subtitle2" fontWeight={800} noWrap sx={{ mb: 1 }}>{compra.titulo}</Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>Llenado</Typography>
                            <Typography variant="caption" color="primary.main" fontWeight={800}>{Math.round(progreso)}%</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={Math.min(progreso, 100)} sx={{ height: 4, borderRadius: 2, mb: 2 }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="caption" color="text.disabled" sx={{ display: 'block', fontWeight: 700 }}>PRECIO POR CUPO</Typography>
                              <Typography variant="subtitle1" fontWeight={900} color="success.main">
                                ${inversionIndividual} USD
                              </Typography>
                            </Box>
                            <Button 
                              component={Link} 
                              href={`/compras-grupales/${compra.id}`} 
                              variant="contained" 
                              size="small" 
                              sx={{ borderRadius: 2, fontWeight: 700 }}
                            >
                              Participar
                            </Button>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })
              )}
            </Grid>
          </Box>
        </Grid>

        {/* Columna Lateral (Derecha): Herramientas y Educación */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={4}>
            {/* Herramientas Rápidas */}
            <Paper sx={{ p: 3, borderRadius: 4, bgcolor: 'background.alt', border: '1px solid rgba(0,0,0,0.05)' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalculateIcon color="primary" fontSize="small" /> Servicios Pro
              </Typography>
              <Grid container spacing={2}>
                {[
                  { label: 'Calculadora', icon: <CalculateIcon />, path: '/calculadora', color: '#3b82f6' },
                  { label: 'Casillero', icon: <ShoppingBagIcon />, path: '/casillero', color: '#8b5cf6' },
                  { label: 'Reventa', icon: <TrendingUpIcon />, path: '/reventa', color: '#10b981' },
                  { label: 'Soporte', icon: <HelpOutlineIcon />, path: '/soporte', color: '#f59e0b' },
                ].map((item) => (
                  <Grid item xs={6} key={item.label}>
                    <Button
                      fullWidth
                      component={Link}
                      href={item.path}
                      variant="outlined"
                      sx={{ 
                        flexDirection: 'column', py: 2, borderRadius: 3, gap: 1, 
                        borderColor: 'divider', color: 'text.primary',
                        '&:hover': { bgcolor: 'white', borderColor: item.color }
                      }}
                    >
                      <Box sx={{ color: item.color }}>{item.icon}</Box>
                      <Typography variant="caption" fontWeight={700}>{item.label}</Typography>
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* Educación y Recursos */}
            <EducationResources />
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
