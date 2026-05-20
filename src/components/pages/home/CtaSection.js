import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import Link from 'next/link';

export default function CtaSection() {
  return (
    <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 12 }}>
      <Container maxWidth="md" sx={{ textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 3 }}>
          ¿Listo para tu primera importación?
        </Typography>
        <Typography variant="h6" sx={{ mb: 5, opacity: 0.8, fontWeight: 400 }}>
          Regístrate hoy y obtén acceso exclusivo a nuestras guías y calculadoras de costos gratuitas.
        </Typography>
        <Button
          component={Link}
          href="/login"
          variant="contained"
          sx={{
            bgcolor: 'secondary.main',
            color: 'white',
            px: 6,
            py: 2,
            borderRadius: 2,
            fontSize: '1.1rem',
            fontWeight: 700,
            '&:hover': { bgcolor: 'secondary.dark' }
          }}
        >
          Crear Cuenta Gratis
        </Button>
      </Container>
    </Box>
  );
}
