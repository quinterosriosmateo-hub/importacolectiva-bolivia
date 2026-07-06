import React, { useState } from 'react';
import { 
  Box, Typography, Grid, Paper, TextField, MenuItem, Button, 
  Stack, Card, CardContent, Avatar, Divider, Chip
} from '@mui/material';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import { useNotification } from '@/contexts/NotificationContext';

const SPECIALISTS = [
  { name: 'Lic. Mariana Vargas', role: 'Experta en Clasificación Arancelaria y DUI', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150' },
  { name: 'Ing. Alejandro Choque', role: 'Director de Logística y Rutas de Tránsito', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150' },
  { name: 'Lic. Carlos Mendoza', role: 'Negociador de Fábricas en Asia y Control de Calidad', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150' }
];

const PACKAGES = [
  { title: 'Asesoría Inicial', price: 'Gratis', desc: '15 minutos. Ideal para evaluar la viabilidad de tu idea de negocio y elegir la mejor ruta de importación.', buttonText: 'Agendar Gratis', color: '#1877F2' },
  { title: 'Estudio de Proyecto', price: '$49 USD', desc: '60 minutos. Análisis detallado de costos aduaneros bolivianos, cotización de fletes y clasificación arancelaria.', buttonText: 'Reservar Sesión Pro', color: '#10b981' },
  { title: 'Acompañamiento Corporativo', price: 'Personalizado', desc: 'Para empresas medianas y grandes que deseen estructurar su cadena de suministro o negociar volúmenes complejos.', buttonText: 'Contactar Ventas', color: '#8b5cf6' }
];

export default function AsesoriaEspecializada() {
  const { notify } = useNotification();
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    interes: 'aduanas',
    especialista: SPECIALISTS[0].name,
    fecha: '',
    hora: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBook = (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.telefono || !formData.fecha || !formData.hora) {
      notify('Completa todos los campos obligatorios para agendar', 'error');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      notify(`¡Asesoría agendada con éxito para el ${formData.fecha} a las ${formData.hora}! Recibirás un enlace de Zoom en tu WhatsApp/Correo.`, 'success');
      setFormData({
        nombre: '',
        telefono: '',
        interes: 'aduanas',
        especialista: SPECIALISTS[0].name,
        fecha: '',
        hora: ''
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Title Header */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <SupportAgentIcon color="primary" sx={{ fontSize: 50, mb: 1.5 }} />
        <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main', mb: 1.5, letterSpacing: '-0.04em' }}>
          Asesoría 1-a-1 Personalizada 🤝
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', fontWeight: 500 }}>
          Resuelve dudas específicas y mitiga riesgos en tus compras internacionales. Reúnete con nuestro panel de asesores aduaneros y logísticos en Bolivia.
        </Typography>
      </Box>

      {/* Advisory Packages */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {PACKAGES.map((pkg, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card variant="outlined" sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              borderRadius: 4, 
              borderColor: `rgba(${index === 1 ? '16, 185, 129, 0.3' : '0, 0, 0, 0.08'})`,
              borderWidth: index === 1 ? 2 : 1,
              boxShadow: index === 1 ? '0 10px 30px rgba(16, 185, 129, 0.08)' : 'none'
            }}>
              <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight={850}>{pkg.title}</Typography>
                    {index === 1 && (
                      <Chip label="Más popular" color="success" size="small" sx={{ fontWeight: 800, fontSize: '0.65rem' }} />
                    )}
                  </Box>
                  <Typography variant="h4" fontWeight={900} color={pkg.color} sx={{ mb: 2 }}>{pkg.price}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 4 }}>{pkg.desc}</Typography>
                </Box>
                
                <Button 
                  fullWidth 
                  variant={index === 1 ? 'contained' : 'outlined'} 
                  sx={{ 
                    borderRadius: 3, 
                    fontWeight: 700, 
                    py: 1.2,
                    bgcolor: index === 1 ? 'success.main' : undefined,
                    color: index === 1 ? 'white' : undefined,
                    '&:hover': index === 1 ? { bgcolor: 'success.dark' } : undefined
                  }}
                >
                  {pkg.buttonText}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={4} sx={{ alignItems: 'stretch' }}>
        {/* Booking Form */}
        <Grid item xs={12} md={7}>
          <Paper variant="outlined" sx={{ p: 4, borderRadius: 4, height: '100%' }}>
            <Typography variant="h6" fontWeight={800} mb={3} display="flex" alignItems="center" gap={1}>
              <EventAvailableIcon color="primary" /> Agenda tu Reunión Online
            </Typography>

            <form onSubmit={handleBook}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Nombre Completo"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    fullWidth
                    required
                    slotProps={{ input: { sx: { borderRadius: 3, fontWeight: 600 } } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Teléfono / WhatsApp"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    fullWidth
                    required
                    slotProps={{ input: { sx: { borderRadius: 3, fontWeight: 600 } } }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Área de Interés"
                    name="interes"
                    value={formData.interes}
                    onChange={handleChange}
                    fullWidth
                    slotProps={{ input: { sx: { borderRadius: 3, fontWeight: 600 } } }}
                  >
                    <MenuItem value="aduanas">Aduanas y Tributación Bolivia</MenuItem>
                    <MenuItem value="proveedores">Búsqueda de Proveedores (Alibaba/Yiwu)</MenuItem>
                    <MenuItem value="logistica">Flete Aéreo y Marítimo</MenuItem>
                    <MenuItem value="legal">Homologaciones y Permisos Especiales</MenuItem>
                  </TextField>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Especialista"
                    name="especialista"
                    value={formData.especialista}
                    onChange={handleChange}
                    fullWidth
                    slotProps={{ input: { sx: { borderRadius: 3, fontWeight: 600 } } }}
                  >
                    {SPECIALISTS.map((s) => (
                      <MenuItem key={s.name} value={s.name}>{s.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Fecha de la Asesoría"
                    name="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={handleChange}
                    fullWidth
                    required
                    slotProps={{
                      inputLabel: { shrink: true },
                      input: { sx: { borderRadius: 3, fontWeight: 600 } }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Horario Disponible"
                    name="hora"
                    value={formData.hora}
                    onChange={handleChange}
                    fullWidth
                    required
                    slotProps={{ input: { sx: { borderRadius: 3, fontWeight: 600 } } }}
                  >
                    <MenuItem value="09:00">09:00 – 09:30 (Mañana)</MenuItem>
                    <MenuItem value="11:30">11:30 – 12:00 (Mañana)</MenuItem>
                    <MenuItem value="15:00">15:00 – 15:30 (Tarde)</MenuItem>
                    <MenuItem value="17:00">17:00 – 17:30 (Tarde)</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    sx={{ py: 1.5, px: 4, borderRadius: 3, fontWeight: 700 }}
                  >
                    {loading ? 'Agendando...' : 'Confirmar Reserva de Asesoría'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        {/* Specialists Team */}
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 4, borderRadius: 4, height: '100%' }}>
            <Typography variant="h6" fontWeight={800} mb={3}>
              Nuestro Equipo de Especialistas
            </Typography>
            
            <Stack spacing={3.5}>
              {SPECIALISTS.map((s, idx) => (
                <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Avatar src={s.avatar} sx={{ width: 60, height: 60 }} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={800}>{s.name}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.2 }}>
                      {s.role}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <VerifiedUserIcon sx={{ color: 'success.main', fontSize: 14 }} />
                      <Typography variant="caption" color="success.main" fontWeight={700}>Certificado</Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Stack>

            <Divider sx={{ my: 4 }} />

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <WatchLaterIcon color="disabled" />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.4 }}>
                Las sesiones virtuales tienen una tolerancia de 5 minutos. En caso de no poder asistir, puedes reprogramar hasta 2 horas antes de la asesoría sin costo alguno.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
