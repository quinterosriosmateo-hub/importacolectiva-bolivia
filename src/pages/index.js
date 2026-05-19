import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Stack,
  alpha,
  useTheme,
  Button
} from '@mui/material';
import Link from 'next/link';
import {
  PrimaryButton,
  SecondaryButton,
  PremiumCard,
  SectionTitle
} from '@/components/ui';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

export default function Home() {
  const theme = useTheme();

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          pt: 12,
          pb: 10,
          background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, transparent 100%)`,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
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
            <Box component="span" sx={{ color: 'secondary.main' }}>Importaciones Grupales</Box>
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

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
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

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <SectionTitle>¿Por qué Importacolectiva?</SectionTitle>
        <Grid container spacing={4}>
          {[
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
          ].map((feature, idx) => (
            <Grid xs={12} md={4} key={idx}>
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

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 12, mt: 6 }}>
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
    </Box>
  );
}
