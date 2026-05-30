import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApiService } from '@/hooks/useApiService';
import { Box, Typography, TextField, Button, Paper, Grid, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { useRouter } from 'next/router';

export default function CrearProveedor() {
  const { postApiService, loading } = useApiService();
  const router = useRouter();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    nombre: '',
    pais: '',
    estado_verificacion: 'Pendiente'
  });

  useEffect(() => {
    if (user && user.role !== 'Administrador') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await postApiService('/api/proveedores', formData, {
      successMessage: 'Proveedor registrado exitosamente'
    });
    if (data) {
      router.push('/admin/proveedores');
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>Registrar Proveedor</Typography>
      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth required
                label="Nombre de la Empresa o Fábrica"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="País de Origen"
                name="pais"
                value={formData.pais}
                onChange={handleChange}
                placeholder="Ej. China, USA"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Estado de Verificación</InputLabel>
                <Select
                  name="estado_verificacion"
                  value={formData.estado_verificacion}
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
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button variant="outlined" onClick={() => router.push('/admin/proveedores')}>Cancelar</Button>
                <Button type="submit" variant="contained" color="primary" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar Proveedor'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}
