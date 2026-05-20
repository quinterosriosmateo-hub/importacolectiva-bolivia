import React from 'react';
import { Box, Typography, Avatar, Divider, Stack, Chip, LinearProgress } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import { PremiumCard, PrimaryButton } from '@/components/ui';

const ROLE_CONFIGS = {
  'Cliente': { color: 'default', label: 'Cliente Estándar' },
  'Premium': { color: 'warning', label: 'Miembro Premium' },
  'Administrador': { color: 'error', label: 'Administrador' },
  'Asesor': { color: 'secondary', label: 'Asesor Técnico' },
  'Proveedor/Agente': { color: 'success', label: 'Proveedor / Agente' }
};

export default function ProfileCard({ authUser, onEditClick }) {
  if (!authUser) return null;

  const roleConfig = ROLE_CONFIGS[authUser.role] || { color: 'default', label: authUser.role };

  return (
    <PremiumCard sx={{ p: 4, textAlign: 'center', position: 'relative' }}>
      <Avatar 
        src={authUser.avatarUrl}
        sx={{ 
          width: 120, 
          height: 120, 
          mx: 'auto', 
          mb: 2, 
          bgcolor: 'primary.main',
          fontSize: '3rem',
          fontWeight: 700
        }}
      >
        {authUser.displayName ? authUser.displayName.charAt(0).toUpperCase() : 'U'}
      </Avatar>
      
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
        {authUser.displayName}
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Chip 
          label={roleConfig.label} 
          color={roleConfig.color}
          variant="filled"
          size="small"
          sx={{ fontWeight: 700, borderRadius: '6px' }}
        />
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {authUser.email}
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Reputación / Confianza */}
      <Box sx={{ textAlign: 'left', mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <StarIcon color="warning" fontSize="small" /> Sistema de Reputación
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary">Nivel de Confianza:</Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
            {authUser.reputacion}%
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={authUser.reputacion} 
          color="success"
          sx={{ height: 8, borderRadius: 4 }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          {authUser.reputacion >= 90 ? '✓ Cuenta altamente confiable' : 'Puntuación estándar'}
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />
      
      <Stack spacing={2} sx={{ textAlign: 'left' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PhoneIcon color="action" fontSize="small" />
          <Typography variant="body2">{authUser.phone || 'Teléfono no registrado'}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <LocationOnIcon color="action" fontSize="small" />
          <Typography variant="body2">{authUser.ubicacion || 'Bolivia'}</Typography>
        </Box>
      </Stack>

      <PrimaryButton 
        fullWidth 
        sx={{ mt: 4 }} 
        startIcon={<EditIcon />}
        onClick={onEditClick}
      >
        Editar Perfil
      </PrimaryButton>
    </PremiumCard>
  );
}
