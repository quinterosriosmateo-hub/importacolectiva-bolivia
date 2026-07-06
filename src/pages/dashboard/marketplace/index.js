import React, { useEffect, useState } from 'react';
import { useApiService } from '@/hooks/useApiService';
import { 
  Box, Typography, Grid, Card, CardContent, CardMedia, 
  Chip, Button, CircularProgress, Tooltip
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export default function MarketplaceReventa() {
  const { getApiService, loading } = useApiService();
  const [oportunidades, setOportunidades] = useState([]);

  const fetchOportunidades = async () => {
    const data = await getApiService('/api/reventa');
    if (data) setOportunidades(data);
  };

  useEffect(() => {
    fetchOportunidades();
  }, []);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 5, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight="900" gutterBottom>
          Marketplace de Oportunidades
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Adquiere inventario abandonado en Aduana a precios de liquidación inmediata.
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress size={60} />
        </Box>
      ) : oportunidades.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <Typography variant="h6" color="text.secondary">
            No hay mercancía en remate en este momento. ¡El contenedor está limpio!
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {oportunidades.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.3s',
                  borderRadius: 4,
                  border: '2px solid #ff9800', // Naranja para resaltar "oportunidad"
                  boxShadow: '0 8px 24px rgba(255,152,0,0.15)',
                  '&:hover': { transform: 'translateY(-8px)' }
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={item.producto?.image || 'https://via.placeholder.com/400x200?text=Liquidacion'}
                    alt={item.producto?.nombre}
                  />
                  <Chip 
                    label="LIQUIDACIÓN" 
                    color="warning"
                    icon={<WarningAmberIcon />}
                    sx={{ position: 'absolute', top: 12, right: 12, fontWeight: 'bold' }}
                  />
                </Box>
                
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
                    {item.producto?.nombre}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {item.motivo}
                  </Typography>
                  
                  <Box sx={{ mt: 'auto', mb: 3 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Inversión a recuperar
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      ${item.precio}
                    </Typography>
                  </Box>

                  <Tooltip title="Comprar este lote inmediatamente y asumir la propiedad de la carga">
                    <Button 
                      variant="contained" 
                      color="warning" 
                      fullWidth 
                      size="large"
                      startIcon={<ShoppingCartIcon />}
                      sx={{ borderRadius: 2, fontWeight: 'bold', color: 'white' }}
                      onClick={() => alert(`Adquirir lote por $${item.precio}`)}
                    >
                      Adquirir Lote Ahora
                    </Button>
                  </Tooltip>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
