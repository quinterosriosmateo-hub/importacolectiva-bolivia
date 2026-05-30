import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';

export default function ShopRedirect() {
  return (
    <Box sx={{ p: 5, textAlign: 'center', mt: 10 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Marketplace / Tienda
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Estamos preparando el marketplace de importaciones individuales.
        Por ahora, te invitamos a explorar nuestras Compras Grupales al por mayor.
      </Typography>
      <Button 
        component={Link} 
        href="/compras-grupales" 
        variant="contained" 
        color="primary"
        size="large"
      >
        Ir a Compras Grupales
      </Button>
    </Box>
  );
}
