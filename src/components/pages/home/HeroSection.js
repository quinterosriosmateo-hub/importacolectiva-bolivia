import React from 'react';
import { Box, Container, Typography, Stack, alpha, useTheme } from '@mui/material';
import Link from 'next/link';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { PrimaryButton, SecondaryButton } from '@/components/ui';

export default function HeroSection() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        pt: 12,
        pb: 10,
        background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, transparent 100%)`,
        textAlign: 'center'
      }}
    >
      <Container maxWidth="md">
        <Box 
          sx={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: 1, 
            bgcolor: alpha(theme.palette.secondary.main, 0.15), 
            px: 2, 
            py: 0.8, 
            borderRadius: 20, 
            mb: 3 
          }}
        >
          <SportsEsportsIcon sx={{ color: 'secondary.main', fontSize: 18 }} />
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: 800, 
              color: 'secondary.main', 
              letterSpacing: '0.5px', 
              textTransform: 'uppercase' 
            }}
          >
            Descubre tu Nivel y Gana XP de Importación
          </Typography>
        </Box>

        <Typography
          variant="h1"
          sx={{
            fontWeight: 900,
            color: 'primary.main',
            fontSize: { xs: '2.5rem', md: '4.5rem' },
            mb: 3,
            letterSpacing: '-0.03em',
            lineHeight: 1.1
          }}
        >
          La Revolución de las <br />
          <Box component="span" sx={{ color: 'secondary.main' }}>
            Importaciones Grupales
          </Box>
        </Typography>

        <Typography
          variant="h5"
          sx={{
            color: 'text.secondary',
            mb: 6,
            maxWidth: '700px',
            mx: 'auto',
            fontWeight: 400,
            lineHeight: 1.6
          }}
        >
          Únete a la comunidad de importadores más grande de Bolivia.
          Ahorra en costos logísticos y arancelarios importando en grupo.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ justifyContent: 'center' }}>
          <PrimaryButton
            component={Link}
            href="/login"
            size="large"
            sx={{ px: 6, height: 56 }}
          >
            Comenzar Ahora
          </PrimaryButton>
          <SecondaryButton
            component={Link}
            href="/dashboard"
            size="large"
            sx={{ px: 6, height: 56 }}
          >
            Explorar Ofertas
          </SecondaryButton>
        </Stack>
      </Container>
    </Box>
  );
}
