import React from 'react';
import { Box, Typography, Container, Grid, Divider, Link as MuiLink } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: 'auto',
        backgroundColor: '#fff',
        borderTop: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocalShippingIcon sx={{ mr: 1, color: 'secondary.main' }} />
              <Typography variant="h6" fontWeight="800">
                Importacolectiva
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Facilitando tus importaciones desde cualquier parte del mundo. Calidad, seguridad y confianza en cada envío.
            </Typography>
          </Grid>
          <Grid item xs={6} sm={4} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold">Enlaces Rápidos</Typography>
            <MuiLink href="/" underline="none" color="text.secondary" variant="body2">Inicio</MuiLink>
            <MuiLink href="/shop" underline="none" color="text.secondary" variant="body2">Tienda</MuiLink>
            <MuiLink href="/about" underline="none" color="text.secondary" variant="body2">Nosotros</MuiLink>
          </Grid>
          <Grid item xs={6} sm={4} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold">Soporte</Typography>
            <MuiLink href="/contact" underline="none" color="text.secondary" variant="body2">Contacto</MuiLink>
            <MuiLink href="/faq" underline="none" color="text.secondary" variant="body2">Preguntas Frecuentes</MuiLink>
            <MuiLink href="/terms" underline="none" color="text.secondary" variant="body2">Términos y Condiciones</MuiLink>
          </Grid>
        </Grid>
        <Divider sx={{ mb: 4, opacity: 0.5 }} />
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} Importacolectiva Bolivia. Todos los derechos reservados.
        </Typography>
      </Container>
    </Box>
  );
}
