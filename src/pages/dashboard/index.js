import React, { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress } from '@mui/material';
import { useRouter } from 'next/router';
import { useApiService } from '@/hooks/useApiService';
import { useAuth } from '@/contexts/AuthContext';
import { Constantes } from '@/utils/constants';

// Subcomponents
import PromotionalCarousel from '@/pages/dashboard/PromotionalCarousel';
import ImporterStats from '@/pages/dashboard/ImporterStats';
import EducationResources from '@/pages/dashboard/EducationResources';
import ProductOffers from '@/pages/dashboard/ProductOffers';

export default function Dashboard() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const router = useRouter();
  const { getApiService, loading: apiLoading } = useApiService();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // Solo cargamos si no hay una carga de auth en curso Y si aún no tenemos productos
    if (authLoading || featuredProducts.length > 0) return;

    const fetchData = async () => {
      const data = await getApiService(Constantes.apiGetProducts, {
        requireAuth: false,
        errorMessage: 'No se pudieron cargar los productos. Intenta de nuevo.',
      });

      if (data) setFeaturedProducts(data);
    };

    fetchData();
  }, [authLoading, getApiService, featuredProducts.length]);

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
      <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 1, letterSpacing: '-0.02em' }}>
            ¡Bienvenido, {user ? user.displayName : 'Invitado'}!
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Aprende, importa y ahorra con Importacolectiva.
          </Typography>
        </Box>
      </Box>

      {/* Hero Carousel */}
      <PromotionalCarousel />

      {/* Importer Stats Panel */}
      <ImporterStats user={user} />

      {/* Featured Products / Offers */}
      <ProductOffers featuredProducts={featuredProducts} />

      {/* Simulador de Importación Section */}
      <EducationResources />
    </Box>
  );
}
