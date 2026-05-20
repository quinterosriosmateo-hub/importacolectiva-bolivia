import React from 'react';
import { Container, Grid, Box, Typography } from '@mui/material';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { PremiumCard, SectionTitle } from '@/components/ui';

export default function FeaturesGrid() {
  const features = [
    {
      title: 'Compras Grupales',
      desc: 'Combinamos pedidos para alcanzar precios de mayorista directo de fábrica.',
      icon: <GroupAddIcon fontSize="large" color="primary" />
    },
    {
      title: 'Costos Reducidos',
      desc: 'Divide gastos de flete y gestión aduanera entre todos los participantes.',
      icon: <TrendingDownIcon fontSize="large" color="primary" />
    },
    {
      title: 'Logística Segura',
      desc: 'Nos encargamos de todo el proceso, desde China hasta tus manos.',
      icon: <VerifiedUserIcon fontSize="large" color="primary" />
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <SectionTitle>¿Por qué Importacolectiva?</SectionTitle>
      <Grid container spacing={4}>
        {features.map((feature, idx) => (
          <Grid size={{ xs: 12, md: 4 }} key={idx}>
            <PremiumCard sx={{ p: 4, height: '100%' }}>
              <Box sx={{ mb: 2 }}>{feature.icon}</Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
                {feature.title}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {feature.desc}
              </Typography>
            </PremiumCard>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
