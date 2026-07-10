import React from 'react';
import { Box, Typography, Container, Grid, Divider, Link as MuiLink, IconButton, Button } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import MusicNoteIcon from '@mui/icons-material/MusicNote'; // TikTok icon representative

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: '#fff',
        borderTop: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 0 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box component="img" src="/logo-black.svg" alt="Logo" sx={{ mr: 1, height: 32, width: 32 }} />
              <Typography variant="h6" fontWeight="800">
                Importacolectiva
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Facilitando tus importaciones desde cualquier parte del mundo. Calidad, seguridad y confianza en cada envío.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-start' }}>
              <Button 
                startIcon={<FacebookIcon />} 
                href="https://www.facebook.com/profile.php?id=61589871410159" 
                target="_blank" 
                sx={{ color: '#1877F2', fontWeight: 700, textTransform: 'none' }}
              >
                Facebook
              </Button>
              <Button 
                startIcon={<InstagramIcon />} 
                href="https://www.instagram.com/importacolectiva_bolivia/" 
                target="_blank" 
                sx={{ color: '#E1306C', fontWeight: 700, textTransform: 'none' }}
              >
                Instagram
              </Button>
              <Button 
                startIcon={<MusicNoteIcon />} 
                href="https://www.tiktok.com/@importacolectiva_bolivia" 
                target="_blank" 
                sx={{ color: '#000000', fontWeight: 700, textTransform: 'none' }}
              >
                TikTok
              </Button>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold">Enlaces Rápidos</Typography>
            <MuiLink href="/" underline="none" color="text.secondary" variant="body2">Inicio</MuiLink>
            <MuiLink href="/about" underline="none" color="text.secondary" variant="body2">Nosotros</MuiLink>
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold">Soporte</Typography>
            <MuiLink href="/contact" underline="none" color="text.secondary" variant="body2">Contacto</MuiLink>
            <MuiLink href="/faq" underline="none" color="text.secondary" variant="body2">Preguntas Frecuentes</MuiLink>
            <MuiLink href="/terms" underline="none" color="text.secondary" variant="body2">Términos y Condiciones</MuiLink>
          </Grid>
        </Grid>
        
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} Importacolectiva Bolivia. Todos los derechos reservados.
        </Typography>
      </Container>
    </Box>
  );
}
