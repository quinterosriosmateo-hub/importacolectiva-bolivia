import React, { useState } from 'react';
import { 
  Box, Typography, Grid, Paper, TextField, Button, 
  Accordion, AccordionSummary, AccordionDetails, Stack, 
  Card, CardContent, InputAdornment
} from '@mui/material';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SendIcon from '@mui/icons-material/Send';
import { useNotification } from '@/contexts/NotificationContext';

export default function SoporteTecnico() {
  const { notify } = useNotification();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.email || !formData.mensaje) {
      notify('Por favor, completa los campos requeridos', 'error');
      return;
    }

    setLoading(true);
    // Simular envío de ticket de soporte
    setTimeout(() => {
      notify('¡Tu ticket de soporte ha sido enviado con éxito! Nos comunicaremos contigo en menos de 24 horas.', 'success');
      setFormData({
        nombre: '',
        email: '',
        asunto: '',
        mensaje: ''
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Title Header */}
      <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
        <ContactSupportIcon color="primary" sx={{ fontSize: 40 }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: '-0.03em' }}>
            Soporte Técnico y Atención
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            ¿Tienes alguna consulta o problema técnico? Nuestro equipo está listo para ayudarte con tus compras y logística.
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Contact Info and Ticket Form */}
        <Grid item xs={12} md={7}>
          <Paper variant="outlined" sx={{ p: 4, borderRadius: 4 }}>
            <Typography variant="h6" fontWeight={800} mb={3}>
              Enviar un Ticket de Soporte
            </Typography>
            
            <form onSubmit={handleSubmit}>
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
                    label="Correo Electrónico"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    required
                    slotProps={{ input: { sx: { borderRadius: 3, fontWeight: 600 } } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Asunto"
                    name="asunto"
                    value={formData.asunto}
                    onChange={handleChange}
                    fullWidth
                    slotProps={{ input: { sx: { borderRadius: 3, fontWeight: 600 } } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Describe tu problema o duda"
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    fullWidth
                    required
                    multiline
                    rows={4}
                    slotProps={{ input: { sx: { borderRadius: 3, fontWeight: 600 } } }}
                  />
                </Grid>
                <Grid item xs={12} sx={{ mt: 1 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    endIcon={<SendIcon />}
                    sx={{ py: 1.5, px: 4, borderRadius: 3, fontWeight: 700 }}
                  >
                    {loading ? 'Enviando...' : 'Enviar Mensaje'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        {/* Channels & Location */}
        <Grid item xs={12} md={5}>
          <Stack spacing={3}>
            {/* Quick Contact Card */}
            <Card variant="outlined" sx={{ borderRadius: 4 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight={800} mb={3}>
                  Canales Directos
                </Typography>
                
                <Stack spacing={2.5}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ bgcolor: '#25D366', p: 1.5, borderRadius: '50%', color: 'white', display: 'flex' }}>
                      <WhatsAppIcon />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>WhatsApp Soporte</Typography>
                      <Typography variant="body1" fontWeight={800} color="primary.main">
                        <a href="https://wa.me/59170000000" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                          +591 700 00000
                        </a>
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ bgcolor: 'primary.main', p: 1.5, borderRadius: '50%', color: 'white', display: 'flex' }}>
                      <EmailIcon />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>Correo Electrónico</Typography>
                      <Typography variant="body1" fontWeight={800} color="primary.main">
                        soporte@importacolectiva.com.bo
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box sx={{ bgcolor: 'secondary.main', p: 1.5, borderRadius: '50%', color: 'primary.main', display: 'flex' }}>
                      <LocationOnIcon />
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>Oficina Central Bolivia</Typography>
                      <Typography variant="body1" fontWeight={800}>
                        Av. Arce, Edificio Multicentro, Piso 10, La Paz
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Support Hours */}
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, bgcolor: 'action.hover' }}>
              <Typography variant="subtitle2" fontWeight={800} mb={1}>
                Horario de Atención
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                Lunes a Viernes: 08:30 – 18:30 (Hora de Bolivia) <br/>
                Sábados: 09:00 – 13:00 <br/>
                Domingos y Feriados: Cerrado
              </Typography>
            </Paper>
          </Stack>
        </Grid>

        {/* Technical FAQs */}
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Typography variant="h5" fontWeight={900} mb={3}>
            Solución de Problemas Técnicos
          </Typography>

          <Stack spacing={1.5}>
            {[
              {
                q: '¿Cómo puedo cambiar la contraseña de mi cuenta?',
                a: 'Puedes cambiar tu contraseña en la sección Configuración dentro del menú lateral derecho. Si no recuerdas tu contraseña actual, cierra sesión y haz clic en "¿Olvidaste tu contraseña?" en la página de ingreso.'
              },
              {
                q: '¿Qué formas de pago simula la plataforma?',
                a: 'Actualmente, para facilitar las pruebas en el entorno demo, puedes simular pagos exitosos mediante códigos QR bancarios integrados directamente en las pasarelas de la suscripción y el checkout de compras grupales.'
              },
              {
                q: 'La página de mi panel de control no actualiza mi reputación o rango',
                a: 'El rango de socio y la reputación se calculan de manera asíncrona conforme completas tus importaciones grupales de forma exitosa. Si has finalizado un ciclo de importación y tus estadísticas siguen igual, por favor envíanos un ticket detallando tu ID de importación.'
              }
            ].map((faq, index) => (
              <Accordion key={index} variant="outlined" sx={{ borderRadius: 3, '&::before': { display: 'none' }, mb: 0.5, overflow: 'hidden' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" fontWeight={800}>
                    {faq.q}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {faq.a}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
