import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Grid,
  CircularProgress,
  CardMedia,
  CardContent,
  useTheme
} from '@mui/material';
import { useRouter } from 'next/router';
import PromotionalCarousel from '@/pages/dashboard/PromotionalCarousel';
import { PrimaryButton, PremiumCard, SectionTitle, OfferBadge, SecondaryButton } from '@/components/ui';
import { useApiService } from '@/hooks/useApiService';
import { useAuth } from '@/contexts/AuthContext';
import { Constantes } from '@/utils/constants';
import CalculateIcon from '@mui/icons-material/Calculate';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

export default function Dashboard() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const router = useRouter();
  const theme = useTheme();
  const { getApiService, loading: apiLoading } = useApiService();
  const { user, logout, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    const fetchData = async () => {
      const data = await getApiService(Constantes.apiGetProducts, {
        requireAuth: false,
        errorMessage: 'No se pudieron cargar los productos. Intenta de nuevo.',
      });

      if (data) setFeaturedProducts(data);
    };

    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router]);

  if (authLoading || apiLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress thickness={5} size={60} />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 6, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 3 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main', mb: 1, letterSpacing: '-0.02em' }}>
            ¡Bienvenido, {user ? user.displayName : 'Invitado'}!
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Aprende, importa y ahorra con Importacolectiva.
          </Typography>
        </Box>
      </Box>

      {/* Hero Carousel */}
      <PromotionalCarousel />

      {/* Simulador de Importación Section */}
      <Box sx={{ my: 10 }}>
        <SectionTitle>Educación e Importación</SectionTitle>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <PremiumCard sx={{ p: 1 }}>
              <Box sx={{ display: 'flex', gap: 3, p: 3, alignItems: 'center' }}>
                <Box sx={{ bgcolor: theme.palette.primary.main, p: 3, borderRadius: 4, color: 'primary.main' }}>
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
                <Box sx={{ bgcolor: theme.palette.secondary.main, p: 3, borderRadius: 4, color: 'secondary.main' }}>
                  <RocketLaunchIcon sx={{ fontSize: 40 }} />
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Guía Paso a Paso</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Aprende la documentación necesaria para Aduanas Bolivia.
                  </Typography>
                  <SecondaryButton size="small">Ver Guía de Importación</SecondaryButton>
                </Box>
              </Box>
            </PremiumCard>
          </Grid>
        </Grid>
      </Box>

      {/* Featured Products / Offers */}
      <Box sx={{ my: 10 }}>
        <SectionTitle>Ofertas Grupales</SectionTitle>
        <Grid container spacing={4}>
          {featuredProducts.map((product) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.id}>
              <PremiumCard>
                <OfferBadge>-20% OFF</OfferBadge>
                <CardMedia
                  component="img"
                  height="220"
                  image={product.image}
                  alt={product.name}
                  sx={{
                    transition: 'transform 0.5s ease',
                    '&:hover': { transform: 'scale(1.05)' }
                  }}
                />
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="overline"
                    sx={{ color: 'secondary.main', fontWeight: 800, letterSpacing: '1px' }}
                  >
                    {product.category}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, my: 1, lineHeight: 1.2 }}>
                    {product.name}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: -0.5 }}>Precio Grupal</Typography>
                      <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 900 }}>
                        ${product.price}
                      </Typography>
                    </Box>
                    <SecondaryButton size="small" sx={{ height: 36, px: 2 }}>Unirse</SecondaryButton>
                  </Box>
                </CardContent>
              </PremiumCard>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
