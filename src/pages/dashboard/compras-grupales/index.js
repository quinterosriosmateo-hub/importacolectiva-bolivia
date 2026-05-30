import React, { useEffect, useState } from 'react';
import { useApiService } from '@/hooks/useApiService';
import { 
  Box, Typography, Grid, Card, CardContent, CardMedia, 
  LinearProgress, Tooltip, Chip, Button, CircularProgress
} from '@mui/material';
import { useRouter } from 'next/router';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import GroupIcon from '@mui/icons-material/Group';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export default function ComprasGrupalesUserIndex() {
  const { getApiService, loading } = useApiService();
  const [compras, setCompras] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchCompras();
  }, []);

  const fetchCompras = async () => {
    const data = await getApiService('/api/compras-grupales');
    if (data) setCompras(data);
  };

  const calculateProgress = (count, min) => {
    if (!min || min === 0) return 0;
    const progress = (count / min) * 100;
    return progress > 100 ? 100 : progress;
  };

  return (
    <>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Typography variant="h3" fontWeight="900" gutterBottom>
            Compras Grupales 🔥
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Únete con otros importadores para traer productos a precio de fábrica. ¡El contenedor no espera!
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <CircularProgress size={60} />
          </Box>
        ) : compras.length === 0 ? (
          <Box sx={{ textAlign: 'center', mt: 5 }}>
            <Typography variant="h6" color="text.secondary">No hay compras grupales disponibles en este momento.</Typography>
          </Box>
        ) : (
          <Grid container spacing={4}>
            {compras.map((compra) => {
              const progress = calculateProgress(compra.participantes_count, compra.meta_minima);
              const remaining = compra.meta_minima - compra.participantes_count;
              const isFull = compra.participantes_count >= compra.cupo_maximo;
              
              return (
                <Grid item xs={12} sm={6} md={4} key={compra.id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.3s',
                      borderRadius: 4,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                      '&:hover': { transform: 'translateY(-8px)' }
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={compra.imagen_url || 'https://via.placeholder.com/400x200?text=ImportaColectiva'}
                        alt={compra.titulo}
                      />
                      <Chip 
                        label={compra.estado} 
                        color={compra.estado === 'Abierta' ? 'success' : 'default'}
                        sx={{ position: 'absolute', top: 12, right: 12, fontWeight: 'bold' }}
                      />
                    </Box>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
                        {compra.titulo}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: 'text.secondary' }}>
                        <AccessTimeIcon fontSize="small" />
                        <Typography variant="body2">Cierra: {compra.fecha_cierre || 'TBD'}</Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3, color: 'text.secondary' }}>
                        <GroupIcon fontSize="small" />
                        <Typography variant="body2">{compra.participantes_count} / {compra.cupo_maximo} cupos llenos</Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" fontWeight="bold">Progreso de la meta</Typography>
                          <Typography variant="body2" fontWeight="bold" color="primary">{progress.toFixed(0)}%</Typography>
                        </Box>
                        <Tooltip 
                          title={remaining > 0 ? `Faltan ${remaining} participantes para zarpar` : '¡Meta alcanzada! El contenedor está listo'} 
                          placement="top"
                          arrow
                        >
                          <LinearProgress 
                            variant="determinate" 
                            value={progress} 
                            sx={{ height: 10, borderRadius: 5 }}
                            color={progress >= 100 ? "success" : "primary"}
                          />
                        </Tooltip>
                      </Box>

                      <Button 
                        variant={compra.estado === 'Abierta' && !isFull ? "contained" : "outlined"} 
                        fullWidth 
                        size="large"
                        sx={{ mt: 'auto', borderRadius: 2, textTransform: 'none', fontWeight: 'bold' }}
                        startIcon={<LocalShippingIcon />}
                        onClick={() => router.push(`/dashboard/compras-grupales/${compra.id}`)}
                      >
                        {compra.estado === 'Abierta' && !isFull ? 'Ver y Unirse' : 'Ver Detalles'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    </>
  );
}
