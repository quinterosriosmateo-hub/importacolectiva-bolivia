import React from 'react';
import { Grid, Box, Typography, useTheme } from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { PrimaryButton, SecondaryButton, PremiumCard, SectionTitle } from '@/components/ui';
import { useRouter } from 'next/router';

export default function EducationResources() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <Box sx={{ my: 8 }}>
      <SectionTitle>Educación e Importación</SectionTitle>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <PremiumCard sx={{ p: 1 }}>
            <Box sx={{ display: 'flex', gap: 3, p: 3, alignItems: 'center' }}>
              <Box sx={{ bgcolor: theme.palette.primary.main, p: 3, borderRadius: 4, color: 'white', display: 'flex' }}>
                <CalculateIcon sx={{ fontSize: 40 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Simulador de Costos</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Calcula aranceles, fletes y comisiones antes de comprar. ¡Evita sorpresas!
                </Typography>
                <PrimaryButton size="small">Comenzar Simulación</PrimaryButton>
              </Box>
            </Box>
          </PremiumCard>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <PremiumCard sx={{ p: 1 }}>
            <Box sx={{ display: 'flex', gap: 3, p: 3, alignItems: 'center' }}>
              <Box sx={{ bgcolor: theme.palette.secondary.main, p: 3, borderRadius: 4, color: 'white', display: 'flex' }}>
                <RocketLaunchIcon sx={{ fontSize: 40 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Academia ImportaColectiva</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Aprende desde cero con nuestros cursos animados y recursos descargables.
                </Typography>
                <SecondaryButton size="small" onClick={() => router.push('/courses')}>
                  Ir a la Academia
                </SecondaryButton>
              </Box>
            </Box>
          </PremiumCard>
        </Grid>
      </Grid>
    </Box>
  );
}
