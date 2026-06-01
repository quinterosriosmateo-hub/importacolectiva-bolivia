import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApiService } from '@/hooks/useApiService';
import { useNotification } from '@/contexts/NotificationContext';
import { supabase } from '@/lib/supabaseClient';
import { 
  Box, Typography, Grid, MenuItem, Select, InputLabel, Chip, LinearProgress,
  FormControl, Button, CircularProgress, Divider, List, ListItem, ListItemText,
  Avatar, ListItemAvatar, Tooltip, CardMedia, TextField
} from '@mui/material';
import { useRouter } from 'next/router';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined';
import { PremiumCard, PrimaryButton } from '@/components/ui';

export default function GestionarCompraGrupal() {
  const { getApiService, putApiService, loading } = useApiService();
  const { notify } = useNotification();
  const router = useRouter();
  const { user } = useAuth();
  const { id } = router.query;
  const fileInputRef = useRef(null);
  
  const [compra, setCompra] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'Administrador') {
      router.push('/dashboard');
      return;
    }
    if (id) fetchCompra();
  }, [user, id]);

  const fetchCompra = async () => {
    const data = await getApiService(`/api/compras-grupales/${id}`);
    if (data) {
      setCompra(data);
      setNuevoEstado(data.estado);
      setImagenUrl(data.imagen_url || '');
    }
  };

  const handleUpdateEstado = async () => {
    const data = await putApiService(`/api/compras-grupales/${id}`, { estado: nuevoEstado }, {
      successMessage: 'Estado actualizado correctamente'
    });
    if (data) fetchCompra();
  };

  const handleUpdateImageUrl = async () => {
    const data = await putApiService(`/api/compras-grupales/${id}`, { imagen_url: imagenUrl }, {
      successMessage: 'URL de imagen actualizada correctamente',
      errorMessage: 'No se pudo actualizar la URL de la imagen.'
    });
    if (data) fetchCompra();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notify('Selecciona un archivo de imagen válido.', 'error');
      return;
    }

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `compras-grupales/${id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: true
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const data = await putApiService(`/api/compras-grupales/${id}`, { imagen_url: publicUrl }, {
        successMessage: 'Imagen cargada y actualizada correctamente',
        errorMessage: 'No se pudo guardar la imagen.'
      });

      if (data) fetchCompra();
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      notify(error.message || 'No se pudo cargar la imagen de la compra grupal.', 'error');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!compra) return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>;

  const progress = (compra.participantes_count / compra.cupo_maximo) * 100;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => router.push('/admin/compras-grupales')}
        sx={{ mb: 3, color: 'text.secondary' }}
      >
        Volver a la lista
      </Button>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="900" gutterBottom color="primary.main">
          {compra.titulo}
        </Typography>
        <Chip label={compra.estado} color="primary" sx={{ fontWeight: 'bold' }} />
      </Box>
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <PremiumCard sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">Configuración del Contenedor</Typography>
                <Tooltip title="Aquí puedes ver y modificar los parámetros técnicos de esta importación colectiva.">
                  <HelpOutlineIcon fontSize="small" color="action" />
                </Tooltip>
              </Box>

              {/* Previsualización de Imagen */}
              <CardMedia
                component="img"
                height="140"
                image={compra.imagen_url || 'https://via.placeholder.com/400x200?text=Sin+Imagen'}
                alt={compra.titulo}
                sx={{ borderRadius: 2, mb: 3, objectFit: 'cover', border: '1px solid rgba(0,0,0,0.05)' }}
              />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                <TextField
                  fullWidth
                  label="URL de la imagen"
                  value={imagenUrl}
                  onChange={(e) => setImagenUrl(e.target.value)}
                  size="small"
                  helperText="Puedes pegar una URL de imagen o elegir un archivo local para subirlo."
                />
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    onClick={handleUpdateImageUrl}
                    disabled={loading || uploadingImage}
                    sx={{ textTransform: 'none' }}
                  >
                    Actualizar URL
                  </Button>
                  <Button
                    variant="contained"
                    component="label"
                    disabled={loading || uploadingImage}
                    sx={{ textTransform: 'none' }}
                  >
                    {uploadingImage ? 'Subiendo...' : 'Subir imagen'}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                  </Button>
                </Box>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="body2" fontWeight="bold">Llenado de contenedores</Typography>
                    <Tooltip title="Representa qué tan cerca está el grupo de completar la capacidad máxima definida para este contenedor.">
                      <HelpOutlineIcon sx={{ fontSize: 14 }} color="action" />
                    </Tooltip>
                  </Box>
                  <Typography variant="body2" fontWeight="bold">{progress.toFixed(0)}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
              </Box>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary">PRODUCTO</Typography><Typography variant="body2" fontWeight="bold">{compra.producto?.nombre}</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary">PROVEEDOR</Typography><Typography variant="body2" fontWeight="bold">{compra.proveedor ? `${compra.proveedor.nombre} (${compra.proveedor.pais})` : 'Sin Proveedor'}</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary">COSTO ESTIMADO</Typography><Typography variant="body2" fontWeight="bold">${compra.costo_total}</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary">META MÍNIMA</Typography><Typography variant="body2" fontWeight="bold">{compra.meta_minima} unidades</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary">CIERRE</Typography><Typography variant="body2" fontWeight="bold">{compra.fecha_cierre || 'TBD'}</Typography></Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold">Cambiar fase de la importación</Typography>
                <Tooltip title="Mover la fase notificará a los usuarios. 'En Proceso' suele disparar la solicitud de pago del primer hito.">
                  <HelpOutlineIcon sx={{ fontSize: 14 }} color="action" />
                </Tooltip>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControl fullWidth>
                  <InputLabel>Estado</InputLabel>
                  <Select
                    value={nuevoEstado}
                    label="Estado"
                    onChange={(e) => setNuevoEstado(e.target.value)}
                  >
                    <MenuItem value="Abierta">Abierta</MenuItem>
                    <MenuItem value="En proceso">En proceso</MenuItem>
                    <MenuItem value="Pagada">Pagada</MenuItem>
                    <MenuItem value="Importando">Importando</MenuItem>
                    <MenuItem value="En aduana">En aduana</MenuItem>
                    <MenuItem value="Entregada">Entregada</MenuItem>
                    <MenuItem value="Cancelada">Cancelada</MenuItem>
                  </Select>
                </FormControl>
                <PrimaryButton 
                  onClick={handleUpdateEstado}
                  disabled={nuevoEstado === compra.estado || loading}
                >
                  Actualizar
                </PrimaryButton>
              </Box>
            </PremiumCard>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <PremiumCard sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                Participantes ({compra.participantes_count})
              </Typography>
              {compra.participante_compra?.length === 0 ? (
                <Typography color="text.secondary">Aún no hay participantes.</Typography>
              ) : (
                <List>
                  {compra.participante_compra?.map((p) => (
                    <ListItem key={p.id} divider>
                      <ListItemAvatar>
                        <Avatar><PersonIcon /></Avatar>
                      </ListItemAvatar>
                      <ListItemText 
                        primary={<Typography variant="subtitle2" fontWeight="bold">Usuario ID: {String(p.usuario_id || '').substring(0, 8)}...</Typography>} 
                        secondary={`Inversión: $${p.monto || 'Calculando...'}`} 
                      />
                      <Chip 
                        label={p.estado_pago} 
                        size="small" 
                        color={p.estado_pago === 'Pagado' ? 'success' : 'warning'}
                        sx={{ fontWeight: 'bold', fontSize: '0.65rem' }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </PremiumCard>
          </Grid>
        </Grid>
    </Box>
  );
}
