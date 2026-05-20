import React from 'react';
import { Box, Grid, Typography, Stack, Chip, Alert } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SecurityIcon from '@mui/icons-material/Security';
import { PremiumCard, SecondaryButton } from '@/components/ui';

export default function ProfileDetails({ authUser }) {
  if (!authUser) return null;

  return (
    <Stack spacing={4}>
      {/* Detalles del Perfil */}
      <PremiumCard sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonIcon color="primary" /> Información General
        </Typography>
        
        <Stack spacing={3}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
              Biografía
            </Typography>
            <Typography variant="body1" sx={{ mt: 0.5, fontStyle: authUser.biografia ? 'normal' : 'italic' }}>
              {authUser.biografia || 'Sin biografía registrada.'}
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                Miembro Desde
              </Typography>
              <Typography variant="body1" sx={{ mt: 0.5 }}>
                {new Date(authUser.createdAt).toLocaleDateString('es-BO', { year: 'numeric', month: 'long' })}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                Estado de Cuenta
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <Chip 
                  label={authUser.estado || 'Activo'} 
                  color={authUser.estado === 'Activo' ? 'success' : 'default'} 
                  size="small" 
                  sx={{ fontWeight: 700 }}
                />
              </Box>
            </Grid>
          </Grid>
        </Stack>
      </PremiumCard>

      {/* Seguridad */}
      <PremiumCard sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityIcon color="primary" /> Seguridad y Configuración
        </Typography>
        <Alert severity="info" sx={{ mb: 3, borderRadius: '8px' }}>
          Tu cuenta está activa y sincronizada con el servicio de autenticación de Supabase.
        </Alert>
        <Stack direction="row" spacing={2}>
          <SecondaryButton disabled>Cambiar Contraseña</SecondaryButton>
          <SecondaryButton color="error" disabled>Desactivar Cuenta</SecondaryButton>
        </Stack>
      </PremiumCard>
    </Stack>
  );
}
