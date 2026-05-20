import React, { useState } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Stack, 
  Chip, 
  LinearProgress, 
  CardMedia, 
  CardContent 
} from '@mui/material';
import { SectionTitle, OfferBadge, SecondaryButton, PremiumCard } from '@/components/ui';

export default function ProductOffers({ featuredProducts = [] }) {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const categories = ['Todos', 'Tecnología', 'Industria', 'Moda'];

  const filteredProducts = selectedCategory === 'Todos'
    ? featuredProducts
    : featuredProducts.filter(p => p.category === selectedCategory);

  return (
    <Box sx={{ my: 8 }}>
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', md: 'center' }, 
          gap: 2, 
          mb: 4 
        }}
      >
        <SectionTitle sx={{ mb: 0 }}>Ofertas Grupales Activas</SectionTitle>
        
        {/* Category Filters */}
        <Stack 
          direction="row" 
          spacing={1} 
          sx={{ overflowX: 'auto', width: '100%', md: 'auto', py: 1 }} 
          className="no-scrollbar"
        >
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              clickable
              color={selectedCategory === cat ? 'primary' : 'default'}
              onClick={() => setSelectedCategory(cat)}
              sx={{
                fontWeight: 700,
                fontSize: '0.85rem',
                px: 1,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-1px)'
                }
              }}
            />
          ))}
        </Stack>
      </Box>

      <Grid container spacing={4}>
        {filteredProducts.map((product) => {
          const savingPercent = product.id === 1 ? 35 : product.id === 2 ? 25 : 40;
          const retailPrice = Math.round(product.price / (1 - (savingPercent / 100)));
          const groupProgress = product.id === 1 ? 75 : product.id === 2 ? 40 : 90;
          const groupBuyers = product.id === 1 ? 15 : product.id === 2 ? 4 : 45;
          const groupTarget = product.id === 1 ? 20 : product.id === 2 ? 10 : 50;

          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product.id}>
              <PremiumCard>
                <OfferBadge sx={{ bgcolor: 'secondary.main', color: 'primary.main', fontWeight: 800 }}>
                  AHORRAS {savingPercent}%
                </OfferBadge>
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
                  
                  {/* Local Price vs Group Price */}
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, my: 2 }}>
                    <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 900 }}>
                      ${product.price} USD
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                      ${retailPrice} USD (Bolivia)
                    </Typography>
                  </Box>

                  {/* Group Target Progress */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                        Progreso del Grupo
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                        {groupProgress}% ({groupBuyers}/{groupTarget})
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={groupProgress} color="primary" sx={{ height: 6, borderRadius: 3 }} />
                  </Box>

                  <SecondaryButton fullWidth sx={{ height: 42 }}>Unirse al Grupo</SecondaryButton>
                </CardContent>
              </PremiumCard>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
