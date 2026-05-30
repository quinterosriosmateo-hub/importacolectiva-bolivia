import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useApiService } from '@/hooks/useApiService';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Box, Typography, Grid, Paper, Button, Chip, 
  LinearProgress, Divider, Avatar, CircularProgress, 
  List, ListItem, ListItemIcon, ListItemText, Alert
} from '@mui/material';
import Head from 'next/head';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CategoryIcon from '@mui/icons-material/Category';

export default function CompraGrupalDetalle() {
  const router = useRouter();
  const { id } = router.query;
  const { getApiService, postApiService, loading: apiLoading } = useApiService();
  const { user } = useAuth();
  
  const [compra, setCompra] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCompra();
    }
  }, [id]);

  const fetchCompra = async () => {
    setLoading(true);
    const data = await getApiService(`/api/compras-grupales/${id}`, { requireAuth: false });
    if (data) setCompra(data);
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    const res = await postApiService(`/api/compras-grupales/${id}/join`, { monto: compra.costo_total / compra.cupo_maximo }, {
      successMessage: '¡Te has unido exitosamente a la compra grupal!',
    });
    if (res) {
      fetchCompra(); // Refresh data
    }
  };

  if (loading || apiLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><CircularProgress size={60} thickness={5} /></Box>;
  }

  if (!compra) {
    return (
      <Box sx={{ p: 10, textAlign: 'center' }}>
        <Typography variant="h4" color="text.secondary" fontWeight={800} mb={2}>Oportunidad no encontrada</Typography>
        <Typography variant="body1" color="text.disabled" mb={4}>Esta compra grupal no existe o ya no está disponible.</Typography>
        <Button variant="contained" onClick={() => router.push('/compras-grupales')} sx={{ borderRadius: 3, px: 4, py: 1.5, fontWeight: 700 }}>
          Volver a Compras Grupales
        </Button>
      </Box>
    );
  }

  const progreso = compra.cupo_maximo > 0 ? (compra.participantes_count / compra.cupo_maximo) * 100 : 0;
  const llena = compra.participantes_count >= compra.cupo_maximo;
  const precioUnitario = compra.costo_total / compra.cupo_maximo;

  return (
    <>
      <Head>
        <title>{compra.titulo} - Importacolectiva</title>
      </Head>

      {/* Hero Header Minimalista pero Premium */}
      <Box sx={{ 
        bgcolor: '#f8fafc', borderBottom: '1px solid', borderColor: 'divider', 
        pt: { xs: 4, md: 8 }, pb: { xs: 6, md: 10 }, mb: -6, position: 'relative', zIndex: 0
      }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3 }}>
          <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
            <Chip label={compra.estado.toUpperCase()} color={compra.estado === 'Abierta' ? 'success' : 'default'} sx={{ fontWeight: 800, fontSize: '0.75rem', borderRadius: 2 }} />
            {compra.producto && <Chip icon={<CategoryIcon />} label={compra.producto.nombre} variant="outlined" sx={{ fontWeight: 700, borderRadius: 2, bgcolor: 'white' }} />}
          </Box>
          <Typography variant="h2" fontWeight={900} sx={{ letterSpacing: '-0.03em', color: '#0f172a', mb: 2, maxWidth: 800 }}>
            {compra.titulo}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, fontWeight: 400, lineHeight: 1.6 }}>
            {compra.producto?.descripcion || 'Comparte el costo de un contenedor y compra a precios directos de fábrica en China. Nosotros nos encargamos de todo el proceso logístico y aduanero.'}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 3 }, position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4}>
          {/* Columna Izquierda - Contenido principal */}
          <Grid xs={12} md={7} lg={8}>
            <Paper elevation={0} sx={{ 
              borderRadius: 4, overflow: 'hidden', mb: 4, border: '1px solid', borderColor: 'divider',
              boxShadow: '0 12px 40px rgba(0,0,0,0.06)'
            }}>
              <img 
                src={compra.imagen_url || `https://source.unsplash.com/800x500/?product,wholesale,${compra.id}`} 
                alt={compra.titulo} 
                style={{ width: '100%', height: 'auto', maxHeight: 500, objectFit: 'cover', display: 'block' }}
              />
            </Paper>
            
            <Typography variant="h5" fontWeight={800} mb={3} color="#0f172a">Por qué participar en esta importación</Typography>
            <Grid container spacing={3} mb={5}>
              <Grid xs={12} sm={6}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'rgba(69,189,98,0.1)', color: '#45BD62', width: 48, height: 48 }}>
                    <CheckCircleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={800}>Precios de Fábrica</Typography>
                    <Typography variant="body2" color="text.secondary">Al importar por volumen logramos precios hasta un 60% más bajos que el mercado local.</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid xs={12} sm={6}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'rgba(24,119,242,0.1)', color: '#1877F2', width: 48, height: 48 }}>
                    <LocalShippingIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={800}>Logística Resuelta</Typography>
                    <Typography variant="body2" color="text.secondary">Nos encargamos del flete, agenciamiento y desaduanización. Solo recoges tu mercancía.</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />
            
            <Typography variant="h5" fontWeight={800} mb={3} color="#0f172a">Garantía Importacolectiva</Typography>
            <Paper elevation={0} sx={{ bgcolor: 'rgba(247, 185, 40, 0.05)', border: '1px solid rgba(247, 185, 40, 0.2)', p: 4, borderRadius: 4 }}>
              <Typography variant="body1" paragraph>
                Todos los proveedores en nuestras compras grupales son <strong>verificados in situ</strong> en China. 
                Si la meta mínima de la compra grupal ({compra.meta_minima} cupos) no se cumple para la fecha de cierre, <strong>te devolvemos el 100% de tu dinero sin preguntas</strong>.
              </Typography>
            </Paper>
          </Grid>

          {/* Columna Derecha - Panel de Inversión Premium */}
          <Grid xs={12} md={5} lg={4}>
            <Paper elevation={0} sx={{ 
              p: { xs: 3, sm: 4 }, borderRadius: 4, position: 'sticky', top: 100, 
              border: '1px solid', borderColor: 'divider', 
              boxShadow: '0 20px 50px rgba(0,0,0,0.08)' 
            }}>
              <Typography variant="overline" color="text.secondary" fontWeight={800} letterSpacing={1}>
                Inversión por Cupo
              </Typography>
              <Typography variant="h3" fontWeight={900} color="primary.main" mb={0.5} sx={{ letterSpacing: '-0.02em' }}>
                ${precioUnitario.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={4}>
                Incluye costo de producto y estimado logístico.
              </Typography>
              
              <Box sx={{ mb: 4, bgcolor: '#f8fafc', p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'center' }}>
                  <Typography variant="subtitle2" fontWeight={800} color="#0f172a">
                    Progreso del Contenedor
                  </Typography>
                  <Typography variant="subtitle2" color="primary.main" fontWeight={900}>
                    {Math.round(progreso)}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={progreso} 
                  sx={{ 
                    height: 12, borderRadius: 6, bgcolor: 'rgba(0,0,0,0.05)',
                    '& .MuiLinearProgress-bar': { borderRadius: 6, background: 'linear-gradient(90deg, #45BD62, #00b0ff)' }
                  }} 
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {compra.participantes_count} inscritos
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Meta: {compra.meta_minima} cupos
                  </Typography>
                </Box>
              </Box>

              <List disablePadding sx={{ mb: 4 }}>
                <ListItem disablePadding sx={{ py: 1.5, borderBottom: '1px dashed', borderColor: 'divider' }}>
                  <ListItemText primary={<Typography variant="body2" color="text.secondary">Fecha de Cierre</Typography>} />
                  <Typography variant="subtitle2" fontWeight={800}>{compra.fecha_cierre ? new Date(compra.fecha_cierre).toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Por definir'}</Typography>
                </ListItem>
                <ListItem disablePadding sx={{ py: 1.5, borderBottom: '1px dashed', borderColor: 'divider' }}>
                  <ListItemText primary={<Typography variant="body2" color="text.secondary">Cupos Disponibles</Typography>} />
                  <Typography variant="subtitle2" fontWeight={800}>{compra.cupo_maximo - compra.participantes_count}</Typography>
                </ListItem>
              </List>

              {llena ? (
                <Alert severity="warning" sx={{ mb: 2, borderRadius: 3, '& .MuiAlert-message': { fontWeight: 600 } }}>Esta importación ha alcanzado su cupo máximo.</Alert>
              ) : compra.estado !== 'Abierta' ? (
                <Alert severity="info" sx={{ mb: 2, borderRadius: 3, '& .MuiAlert-message': { fontWeight: 600 } }}>Esta importación ya no acepta participantes.</Alert>
              ) : (
                <Button 
                  fullWidth 
                  variant="contained" 
                  color="success" 
                  size="large" 
                  onClick={handleJoin}
                  sx={{ 
                    py: 2, fontWeight: 800, fontSize: '1.1rem', borderRadius: 3,
                    boxShadow: '0 8px 24px rgba(69, 189, 98, 0.3)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 12px 32px rgba(69, 189, 98, 0.4)' }
                  }}
                >
                  Reservar mi Cupo
                </Button>
              )}
              
              <Box sx={{ mt: 3, display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                <InfoIcon sx={{ fontSize: 20, color: 'text.secondary', mt: 0.2 }} />
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4, display: 'block' }}>
                  Al reservar, estarás asegurando tu participación. Tu inversión está protegida por nuestra <strong>Garantía de Meta Cumplida</strong>.
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </>
  );
}
