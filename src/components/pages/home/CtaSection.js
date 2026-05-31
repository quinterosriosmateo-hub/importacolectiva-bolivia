import React, { useState } from 'react';
import { 
  Box, Container, Typography, Button, TextField, 
  CircularProgress, Alert, IconButton, Paper 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function CtaSection() {
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    firstname: '',
    lastname: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // mostrar el formulario
  const handleButtonClick = () => {
    setShowForm(true);
    setNotification({ open: false, message: '', severity: 'success' });
  };

  // cerrar el formulario
  const handleCloseForm = () => {
    setShowForm(false);
    setFormData({ email: '', firstname: '', lastname: '' });
    setNotification({ open: false, message: '', severity: 'success' });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email) {
      setNotification({
        open: true,
        message: 'El correo electrónico es obligatorio para recibir el descuento',
        severity: 'error'
      });
      return;
    }

    setIsLoading(true);
    setNotification({ open: false, message: '', severity: 'success' });

    const urlParams = new URLSearchParams(window.location.search);
    const utm_source = urlParams.get('utm_source');
    const utm_medium = urlParams.get('utm_medium');
    const utm_campaign = urlParams.get('utm_campaign');

    try {
      const response = await fetch('/api/hubspot/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          firstname: formData.firstname || '',
          lastname: formData.lastname || '',
          source: 'homepage_cta_descuento',
          utm_source,
          utm_medium,
          utm_campaign,
          message: 'Interesado en descuento por registro en CRM',
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setNotification({
          open: true,
          message: '¡Descuento aplicado! Revisa tu correo en las próximas horas. Gracias por registrarte.',
          severity: 'success'
        });
        setFormData({ email: '', firstname: '', lastname: '' });
        setTimeout(() => {
          setShowForm(false);
          setNotification({ open: false, message: '', severity: 'success' });
        }, 4000);
      } else {
        setNotification({
          open: true,
          message: result.message || 'Error al enviar. Intenta nuevamente.',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setNotification({
        open: true,
        message: 'Error de conexión. Intenta nuevamente.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 12 }}>
      <Container maxWidth="md" sx={{ textAlign: 'center' }}>
        
        {/* Versión cuando el formulario NO está visible */}
        {!showForm ? (
          <>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 3 }}>
              ¿Listo para tu primera importación?
            </Typography>
            <Typography variant="h6" sx={{ mb: 2, opacity: 0.9, fontWeight: 500 }}>
              Oferta especial por tiempo limitado
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, opacity: 0.8, maxWidth: 600, mx: 'auto' }}>
              Regístrate ahora y recibe <strong>15% DE DESCUENTO</strong> en tu primera asesoría + 
              guía gratuita de importación paso a paso.
            </Typography>
            
            <Button
              onClick={handleButtonClick}
              variant="contained"
              sx={{
                bgcolor: '#ff9800',
                color: 'white',
                px: 6,
                py: 2.5,
                borderRadius: 2,
                fontSize: '1.2rem',
                fontWeight: 700,
                '&:hover': { bgcolor: '#f57c00' },
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.05)' },
                  '100%': { transform: 'scale(1)' },
                },
              }}
            >
              Obtener mi descuento del 15%
            </Button>
            
            <Typography variant="caption" sx={{ display: 'block', mt: 2, opacity: 0.6 }}>
              *Sin compromiso | Cupos limitados
            </Typography>
          </>
        ) : (
          /* Versión cuando el formulario SÍ está visible */
          <Box sx={{ position: 'relative' }}>
            <Paper elevation={3} sx={{ 
              maxWidth: 500, 
              mx: 'auto', 
              p: 4, 
              borderRadius: 3,
              position: 'relative'
            }}>
              {/* Botón de cerrar (X) */}
              <IconButton
                onClick={handleCloseForm}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  color: 'grey.500',
                  '&:hover': { color: 'grey.700' }
                }}
              >
                <CloseIcon />
              </IconButton>

              <Typography variant="h5" sx={{ mb: 1, textAlign: 'center', color: 'primary.main', fontWeight: 700 }}>
                ¡Aprovecha tu descuento!
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
                Completa tus datos y recibe el código de descuento por email
              </Typography>
              
              {notification.open && (
                <Alert 
                  severity={notification.severity} 
                  sx={{ mb: 2 }} 
                  onClose={() => setNotification({ ...notification, open: false })}
                >
                  {notification.message}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  required
                  label="Correo electrónico *"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  margin="normal"
                  size="small"
                  helperText="Te enviaremos el código de descuento aquí"
                />

                <TextField
                  fullWidth
                  label="Nombre (opcional)"
                  name="firstname"
                  placeholder="¿Cómo te llamas?"
                  value={formData.firstname}
                  onChange={handleChange}
                  margin="normal"
                  size="small"
                />

                <TextField
                  fullWidth
                  label="Apellido (opcional)"
                  name="lastname"
                  placeholder="Tu apellido"
                  value={formData.lastname}
                  onChange={handleChange}
                  margin="normal"
                  size="small"
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  sx={{ 
                    mt: 3, 
                    py: 1.5, 
                    bgcolor: '#ff9800',
                    '&:hover': { bgcolor: '#f57c00' },
                    fontWeight: 700
                  }}
                >
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Enviar y obtener mi descuento'}
                </Button>

                <Typography variant="caption" sx={{ display: 'block', mt: 2, textAlign: 'center', color: 'text.secondary' }}>
                  No enviamos spam. Puedes darte de baja cuando quieras.
                </Typography>
              </form>
            </Paper>
          </Box>
        )}
      </Container>
    </Box>
  );
}