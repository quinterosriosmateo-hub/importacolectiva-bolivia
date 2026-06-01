import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApiService } from '@/hooks/useApiService';
import { Box, Typography, Paper, Grid, TextField, Button, CircularProgress, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useRouter } from 'next/router';

export default function GestionarProveedor() {
  const { getApiService, putApiService, deleteApiService, loading } = useApiService();
  const router = useRouter();
  const { user } = useAuth();
  const { id } = router.query;
  
  const [proveedor, setProveedor] = useState({
    nombre: '', pais: '', estado_verificacion: ''
  });

  useEffect(() => {
    if (user && user.role !== 'Administrador') {
      router.push('/dashboard');
      return;
    }
    if (id) fetchProveedor();
  }, [user, id]);

  const fetchProveedor = async () => {
    const data = await getApiService(`/api/proveedores/${id}`);
    if (data) setProveedor(data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProveedor(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    await putApiService(`/api/proveedores/${id}`, proveedor, {
      successMessage: 'Proveedor actualizado con éxito'
    });
  };

  const handleDelete = async () => {
    if (window.confirm('¿Estás seguro de eliminar este proveedor?')) {
      const res = await deleteApiService(`/api/proveedores/${id}`, {
        successMessage: 'Proveedor eliminado'
      });
      if (res) router.push('/admin/proveedores');
    }
  };

  if (!proveedor.nombre && loading) return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>Gestionar Proveedor</Typography>
      <Paper sx={{ p: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth label="Nombre" name="nombre"
              value={proveedor.nombre || ''} onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth label="País" name="pais"
              value={proveedor.pais || ''} onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Estado de Verificación</InputLabel>
              <Select
                name="estado_verificacion"
                value={proveedor.estado_verificacion || ''}
                label="Estado de Verificación"
                onChange={handleChange}
              >
                <MenuItem value="Pendiente">Pendiente</MenuItem>
                <MenuItem value="Verificado">Verificado</MenuItem>
                <MenuItem value="Rechazado">Rechazado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button variant="outlined" color="error" onClick={handleDelete} disabled={loading}>
                Eliminar
              </Button>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" onClick={() => router.push('/admin/proveedores')}>Volver</Button>
                <Button variant="contained" color="primary" onClick={handleUpdate} disabled={loading}>
                  Guardar Cambios
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}
