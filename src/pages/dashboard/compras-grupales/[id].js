import React, { useEffect, useState } from 'react';
import { useApiService } from '@/hooks/useApiService';
import { 
  Box, Typography, Grid, Paper, Button, LinearProgress, 
  Divider, List, ListItem, ListItemAvatar, Avatar, ListItemText, CircularProgress,
  Chip, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField
} from '@mui/material';
import { useRouter } from 'next/router';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

export default function CompraGrupalDetalle() {
  const { getApiService, postApiService, loading } = useApiService();
  const router = useRouter();
  const { id } = router.query;
  
  const [compra, setCompra] = useState(null);
  const [openJoinModal, setOpenJoinModal] = useState(false);
  const [monto, setMonto] = useState('');
  
  // Asumimos un costo sugerido basado en costo total / cupo máximo si la API no lo provee.
  const costoSugerido = compra ? (compra.costo_total / compra.cupo_maximo).toFixed(2) : 0;

  useEffect(() => {
    if (id) fetchCompra();
  }, [id]);

  const fetchCompra = async () => {
    const data = await getApiService(`/api/compras-grupales/${id}`);
    if (data) {
      setCompra(data);
      setMonto((data.costo_total / data.cupo_maximo).toFixed(2));
    }
  };

  const handleJoin = async () => {
    const data = await postApiService(`/api/compras-grupales/${id}/join`, { monto }, {
      successMessage: '¡Felicidades! Te has unido a la compra grupal.'
    });
    if (data) {
      setOpenJoinModal(false);
      fetchCompra(); // Refrescar datos
    }
  };

  const calculateProgress = (count, min) => {
    if (!min || min === 0) return 0;
    const progress = (count / min) * 100;
    return progress > 100 ? 100 : progress;
  };

  if (!compra && loading) return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>;
  if (!compra) return <Box sx={{ p: 5, textAlign: 'center' }}><Typography>No se encontró la compra.</Typography></Box>;

  const progress = calculateProgress(compra.participantes_count, compra.meta_minima);
  const isFull = compra.participantes_count >= compra.cupo_maximo;
  const canJoin = compra.estado === 'Abierta' && !isFull;

  return (
    <>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
        <Button onClick={() => router.push('/dashboard/compras-grupales')} sx={{ mb: 3 }}>
          &larr; Volver a compras grupales
        </Button>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 0, overflow: 'hidden', borderRadius: 4, mb: 4 }}>
              <Box 
                sx={{ 
                  height: 300, 
                  backgroundImage: `url(${compra.imagen_url || 'https://via.placeholder.com/800x400?text=ImportaColectiva'})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative'
                }}
              >
                <Box sx={{ 
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
                }} />
                <Box sx={{ position: 'absolute', bottom: 20, left: 20, right: 20, color: '#fff' }}>
                  <Chip label={compra.estado} color={compra.estado === 'Abierta' ? 'success' : 'default'} sx={{ mb: 1, fontWeight: 'bold' }} />
                  <Typography variant="h3" fontWeight="900">{compra.titulo}</Typography>
                </Box>
              </Box>
              
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>Acerca de esta compra</Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Producto: <strong>{compra.producto?.nombre || 'Producto no especificado'}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Al unirte a esta compra grupal, compartes el costo del flete y los trámites de importación con otras {compra.meta_minima} personas. 
                  Esto reduce el costo logístico hasta en un 60% comparado con importar individualmente.
                </Typography>
                
                <Grid container spacing={2} sx={{ mt: 3, mb: 3 }}>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                      <MonetizationOnIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="caption" display="block" color="text.secondary">Inversión Estimada</Typography>
                      <Typography variant="h6" fontWeight="bold">${costoSugerido}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                      <CalendarTodayIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="caption" display="block" color="text.secondary">Cierre</Typography>
                      <Typography variant="h6" fontWeight="bold">{compra.fecha_cierre || 'TBD'}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                      <SecurityIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="caption" display="block" color="text.secondary">Garantía</Typography>
                      <Typography variant="h6" fontWeight="bold">100%</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                      <LocalShippingIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="caption" display="block" color="text.secondary">Estado</Typography>
                      <Typography variant="h6" fontWeight="bold">{compra.estado}</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: 4 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Cronograma de Importación</Typography>
              <Box sx={{ ml: 2, borderLeft: '2px solid #eee', pl: 3, py: 1, position: 'relative' }}>
                <Box sx={{ position: 'absolute', left: -7, top: 20, width: 12, height: 12, borderRadius: '50%', bgcolor: compra.estado === 'Abierta' ? 'primary.main' : 'success.main' }} />
                <Typography fontWeight="bold">1. Recaudación (Abierta)</Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>Se agrupa a los interesados hasta cumplir la meta.</Typography>

                <Box sx={{ position: 'absolute', left: -7, top: 90, width: 12, height: 12, borderRadius: '50%', bgcolor: compra.estado === 'En proceso' ? 'primary.main' : (compra.estado === 'Pagada' || compra.estado === 'Importando' || compra.estado === 'En aduana' || compra.estado === 'Entregada' ? 'success.main' : '#ccc') }} />
                <Typography fontWeight="bold">2. Pago al Proveedor</Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>Se cierra el grupo y se paga al fabricante en China.</Typography>

                <Box sx={{ position: 'absolute', left: -7, top: 160, width: 12, height: 12, borderRadius: '50%', bgcolor: compra.estado === 'Importando' ? 'primary.main' : (compra.estado === 'En aduana' || compra.estado === 'Entregada' ? 'success.main' : '#ccc') }} />
                <Typography fontWeight="bold">3. Tránsito Internacional</Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>El contenedor viaja hacia Bolivia. (30-45 días)</Typography>

                <Box sx={{ position: 'absolute', left: -7, top: 230, width: 12, height: 12, borderRadius: '50%', bgcolor: compra.estado === 'Entregada' ? 'success.main' : '#ccc' }} />
                <Typography fontWeight="bold">4. Entrega Local</Typography>
                <Typography variant="body2" color="text.secondary">Liquidación de aduanas y entrega en tu ciudad.</Typography>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 4, mb: 4, position: 'sticky', top: 20 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Progreso del Grupo</Typography>
              
              <Box sx={{ my: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Meta Mínima: <strong>{compra.meta_minima}</strong></Typography>
                  <Typography variant="body1" color="primary" fontWeight="bold">{progress.toFixed(0)}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={progress} 
                  sx={{ height: 12, borderRadius: 6 }}
                  color={progress >= 100 ? "success" : "primary"}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                  {compra.participantes_count} inscritos de {compra.cupo_maximo} cupos máximos
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Button 
                variant="contained" 
                color="primary" 
                size="large" 
                fullWidth 
                disabled={!canJoin || loading}
                onClick={() => setOpenJoinModal(true)}
                sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 'bold', borderRadius: 2 }}
              >
                {isFull ? 'Cupos Llenos' : compra.estado !== 'Abierta' ? 'Compra Cerrada' : 'Unirme a la Compra'}
              </Button>
              
              <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={2}>
                Al unirte, reservas tu lugar. El pago se solicita cuando la compra pasa a "En proceso".
              </Typography>

              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Participantes Recientes</Typography>
                {compra.participante_compra?.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">Sé el primero en unirte.</Typography>
                ) : (
                  <List dense>
                    {compra.participante_compra?.slice(0, 5).map((p, i) => (
                      <ListItem key={i} disablePadding sx={{ mb: 1 }}>
                        <ListItemAvatar sx={{ minWidth: 40 }}>
                          <Avatar sx={{ width: 30, height: 30, bgcolor: 'primary.light' }}>
                            <PersonIcon fontSize="small" />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText 
                          primary={`Importador Anónimo #${String(p.usuario_id || '').substring(0, 4) || i}`} 
                          secondary="Reservado" 
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Modal para unirse */}
      <Dialog open={openJoinModal} onClose={() => setOpenJoinModal(false)}>
        <DialogTitle fontWeight="bold">Confirmar Participación</DialogTitle>
        <DialogContent>
          <DialogContentText mb={2}>
            Estás a punto de reservar tu lugar en la compra <strong>{compra.titulo}</strong>. 
            El costo estimado inicial por cupo es de <strong>${costoSugerido}</strong>.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Monto de Inversión (Opcional - si deseas más de 1 cupo)"
            type="number"
            fullWidth
            variant="outlined"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setOpenJoinModal(false)} color="inherit">Cancelar</Button>
          <Button onClick={handleJoin} variant="contained" disabled={loading}>Confirmar Reserva</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
