import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApiService } from '@/hooks/useApiService';
import { 
  Box, Typography, TextField, Button, Paper, 
  Grid, MenuItem, Select, InputLabel, FormControl,
  Stepper, Step, StepLabel, Stack, Divider, Tooltip, InputAdornment,
} from '@mui/material';
import { useRouter } from 'next/router';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined';
import { PremiumCard, PrimaryButton } from '@/components/ui';

const steps = ['Seleccionar Producto', 'Definir Metas y Costos', 'Confirmación'];

export default function CrearCompraGrupal() {
  const { postApiService, getApiService, loading } = useApiService();
  const router = useRouter();
  const { user } = useAuth();
  
  const [activeStep, setActiveStep] = useState(0);
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [formData, setFormData] = useState({
    titulo: '',
    estado: 'Abierta',
    cupo_maximo: '',
    costo_total: '',
    producto_id: '',
    proveedor_id: '',
    meta_minima: '',
    fecha_cierre: '',
    imagen_url: '',
    tipo_capacidad: 'CBM'
  });

  useEffect(() => {
    if (user && user.role !== 'Administrador') {
      router.push('/dashboard');
      return;
    }
    const loadData = async () => {
      const prodData = await getApiService('/api/products');
      if (prodData && prodData.products) setProductos(prodData.products);
      else if (Array.isArray(prodData)) setProductos(prodData);
      
      const provData = await getApiService('/api/proveedores');
      if (provData) setProveedores(provData);
    };
    loadData();
  }, [user, getApiService, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeStep !== steps.length - 1) {
      handleNext();
      return;
    }

    const data = await postApiService('/api/compras-grupales', formData, {
      successMessage: 'Compra grupal creada exitosamente'
    });
    if (data) {
      router.push('/admin/compras-grupales');
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth required
              label="Título de la Compra Grupal"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
            />
            <FormControl fullWidth required>
              <InputLabel>Producto Base</InputLabel>
              <Select
                name="producto_id"
                value={formData.producto_id}
                label="Producto Base"
                onChange={(e) => {
                  handleChange(e);
                  const prod = productos.find(p => p.id === e.target.value);
                  if (prod && prod.image) {
                    setFormData(prev => ({ ...prev, imagen_url: prod.image }));
                  }
                }}
              >
                {productos.map(p => (
                  <MenuItem key={p.id} value={p.id}>{p.nombre || p.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Proveedor del Lote</InputLabel>
              <Select
                name="proveedor_id"
                value={formData.proveedor_id}
                label="Proveedor del Lote"
                onChange={handleChange}
              >
                {proveedores.map(p => (
                  <MenuItem key={p.id} value={p.id}>{p.nombre} ({p.pais})</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="URL Imagen (Opcional - Auto si el producto tiene)"
              name="imagen_url"
              value={formData.imagen_url}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Se recomienda usar una imagen de alta calidad del producto o del contenedor.">
                      <HelpOutlineIcon fontSize="small" color="action" />
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
            <FormControl fullWidth required>
              <InputLabel>Estado Inicial</InputLabel>
              <Select
                name="estado"
                value={formData.estado}
                label="Estado Inicial"
                onChange={handleChange}
              >
                <MenuItem value="Abierta">Abierta</MenuItem>
                <MenuItem value="En proceso">En proceso</MenuItem>
              </Select>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', px: 1 }}>
                <strong>Abierta:</strong> Los usuarios pueden unirse. 
                <strong> En proceso:</strong> Registro cerrado, inicia recaudación.
              </Typography>
            </FormControl>
          </Stack>
        );
      case 1:
        return (
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth required>
                  <InputLabel sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Métrica de Capacidad
                  </InputLabel>
                  <Select
                    name="tipo_capacidad"
                    value={formData.tipo_capacidad}
                    label="Métrica de Capacidad"
                    onChange={handleChange}
                  >
                    <MenuItem value="CBM">Volumen (CBM)</MenuItem>
                    <MenuItem value="Kg">Peso (Kg)</MenuItem>
                    <MenuItem value="Unidades">Unidades</MenuItem>
                  </Select>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    Métrica para calcular el llenado del contenedor.
                  </Typography>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth required type="number"
                  label="Capacidad Máxima"
                  name="cupo_maximo"
                  value={formData.cupo_maximo}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title={`Cantidad total de ${formData.tipo_capacidad} disponibles en el contenedor.`}>
                          <HelpOutlineIcon fontSize="small" color="action" />
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth required type="number"
                  label="Meta Mínima"
                  name="meta_minima"
                  value={formData.meta_minima}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Mínimo de participantes necesarios para que la importación sea rentable y se proceda con el pedido.">
                          <HelpOutlineIcon fontSize="small" color="action" />
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth required type="number"
                  label="Costo Total Estimado ($)"
                  name="costo_total"
                  value={formData.costo_total}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="Suma total del costo de fábrica + fletes + seguros + aduanas proyectados.">
                          <HelpOutlineIcon fontSize="small" color="action" />
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth type="date"
                  label="Fecha de Cierre"
                  name="fecha_cierre"
                  slotProps={{ inputLabel: { shrink: true } }}
                  value={formData.fecha_cierre}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </Stack>
        );
      case 2:
        return (
          <Stack spacing={2} sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="h6">Resumen de la Compra Grupal</Typography>
            <Divider />
            <Typography variant="body1"><strong>Título:</strong> {formData.titulo}</Typography>
            <Typography variant="body1"><strong>Estado:</strong> {formData.estado}</Typography>
            <Typography variant="body1"><strong>Cupos:</strong> Mínimo {formData.meta_minima} - Máximo {formData.cupo_maximo}</Typography>
            <Typography variant="body1"><strong>Costo Total Estimado:</strong> ${formData.costo_total}</Typography>
            <Typography variant="body1"><strong>Cierre:</strong> {formData.fecha_cierre || 'Sin fecha'}</Typography>
          </Stack>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" fontWeight="900" mb={4} color="primary.main">
        Nueva Importación Grupal
      </Typography>
      
      <PremiumCard sx={{ p: { xs: 3, md: 5 } }}>
        <Stepper activeStep={activeStep} sx={{ mb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={handleSubmit}>
          {renderStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Atrás
            </Button>
            <PrimaryButton
              type="submit"
              disabled={loading}
              sx={{ minWidth: 150 }}
            >
              {activeStep === steps.length - 1 ? (loading ? 'Creando...' : 'Crear Compra Grupal') : 'Siguiente'}
            </PrimaryButton>
          </Box>
        </form>
      </PremiumCard>
    </Box>
  );
}
