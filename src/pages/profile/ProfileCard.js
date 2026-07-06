import React, { useRef, useState } from 'react';
import { Box, Typography, Avatar, Divider, Stack, Chip, LinearProgress, IconButton, CircularProgress } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import VerifiedIcon from '@mui/icons-material/Verified';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { PremiumCard, PrimaryButton } from '@/components/ui';
import { supabase } from '@/lib/supabaseClient';
import { useApiService } from '@/hooks/useApiService';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { optimizeAndCropAvatar } from '@/utils/imageOptimizer';
import { Constantes } from '@/utils/constants';
import Link from 'next/link';

const ROLE_CONFIGS = {
  'Cliente': { color: 'default', label: 'Cliente Estándar' },
  'Premium': { color: 'warning', label: 'Miembro Premium' },
  'Administrador': { color: 'error', label: 'Administrador' },
  'Asesor': { color: 'secondary', label: 'Asesor Técnico' },
  'Proveedor/Agente': { color: 'success', label: 'Proveedor / Agente' }
};

export default function ProfileCard({ authUser, onEditClick }) {
  const { refreshSession } = useAuth();
  const { putApiService } = useApiService();
  const { notify } = useNotification();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  if (!authUser) return null;

  const roleConfig = ROLE_CONFIGS[authUser.role] || { color: 'default', label: authUser.role };

  const handleAvatarClick = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Optimizar, recortar al centro y comprimir la imagen en el cliente
      const optimizedBlob = await optimizeAndCropAvatar(file, 300, 0.85);

      // 2. Subir a Supabase Storage
      const fileExt = 'jpg';
      const fileName = `${authUser.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, optimizedBlob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // 3. Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // 4. Actualizar base de datos de usuario con el nuevo avatarUrl
      const res = await putApiService(Constantes.apiAuthProfile, {
        avatar_url: publicUrl
      }, {
        successMessage: '¡Imagen de perfil actualizada con éxito!',
        errorMessage: 'Error al actualizar el avatar en el perfil.'
      });

      if (res) {
        await refreshSession();
      }
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      notify(error.message || 'No se pudo cargar la imagen de perfil.', 'error');
    } finally {
      setUploading(false);
      // Limpiar el valor del input para permitir subir el mismo archivo de nuevo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <PremiumCard sx={{ p: 4, textAlign: 'center', position: 'relative' }}>
      <Box sx={{ position: 'relative', display: 'inline-block', mx: 'auto', mb: 2 }}>
        <Avatar 
          src={authUser.avatarUrl}
          onClick={handleAvatarClick}
          sx={{ 
            width: 120, 
            height: 120, 
            cursor: uploading ? 'default' : 'pointer',
            bgcolor: 'primary.main',
            fontSize: '3rem',
            fontWeight: 700,
            transition: 'all 0.3s ease',
            position: 'relative',
            '&:hover': {
              opacity: uploading ? 1 : 0.85,
              transform: uploading ? 'none' : 'scale(1.02)',
              boxShadow: '0 6px 20px rgba(24, 119, 242, 0.25)'
            }
          }}
        >
          {authUser.displayName ? authUser.displayName.charAt(0).toUpperCase() : 'U'}
        </Avatar>
        
        {uploading ? (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 120,
              height: 120,
              borderRadius: '50%',
              bgcolor: 'rgba(0, 0, 0, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2
            }}
          >
            <CircularProgress size={36} color="primary" />
          </Box>
        ) : (
          <IconButton
            onClick={handleAvatarClick}
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              bgcolor: 'primary.main',
              color: 'white',
              border: '3px solid white',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
              '&:hover': {
                bgcolor: 'primary.dark'
              },
              width: 36,
              height: 36
            }}
            size="small"
          >
            <CameraAltIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
      
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
        {authUser.role === 'Cliente' && (
          <Box sx={{ mt: 1.5 }}>
            <Typography 
              variant="caption" 
              color="primary" 
              component={Link}
              href="/subscription"
              sx={{ fontWeight: 700, textDecoration: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, '&:hover': { textDecoration: 'underline' } }}
            >
              <WorkspacePremiumIcon sx={{ fontSize: 14 }} /> Mejorar a Premium
            </Typography>
          </Box>
        )}
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
        <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
          {authUser.reputacion >= 90 ? (<><VerifiedIcon sx={{ fontSize: 13 }} color="success" /> Cuenta altamente confiable</>) : 'Puntuación estándar'}
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
