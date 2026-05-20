import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Grid, 
  Typography, 
  Avatar, 
  Divider, 
  TextField,
  Stack,
  Alert,
  CircularProgress,
  Chip,
  LinearProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import { 
  PremiumCard, 
  PrimaryButton, 
  SecondaryButton, 
  SectionTitle,
  StandardModal 
} from '@/components/ui';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EditIcon from '@mui/icons-material/Edit';
import SecurityIcon from '@mui/icons-material/Security';
import StarIcon from '@mui/icons-material/Star';
import { useAuth } from '@/contexts/AuthContext';
import { useApiService } from '@/hooks/useApiService';
import { Constantes } from '@/utils/constants';
import { useRouter } from 'next/router';

// Colores e iconos de Roles para Badges
const ROLE_CONFIGS = {
  'Cliente': { color: 'default', label: 'Cliente Estándar' },
  'Premium': { color: 'warning', label: 'Miembro Premium' },
  'Administrador': { color: 'error', label: 'Administrador' },
  'Asesor': { color: 'secondary', label: 'Asesor Técnico' },
  'Proveedor/Agente': { color: 'success', label: 'Proveedor / Agente' }
};

export default function ProfilePage() {
  const { user: authUser, loading: authLoading, refreshSession } = useAuth();
  const { putApiService, loading: updateLoading } = useApiService();
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Estados locales para el formulario de edición
  const [editNombre, setEditNombre] = useState('');
  const [editTelefono, setEditTelefono] = useState('');
  const [editBiografia, setEditBiografia] = useState('');
  const [editUbicacion, setEditUbicacion] = useState('');
  const [editRol, setEditRol] = useState('');

  // Sincronizar formulario local con el usuario cargado
  useEffect(() => {
    if (authUser) {
      setEditNombre(authUser.displayName || '');
      setEditTelefono(authUser.phone || '');
      setEditBiografia(authUser.biografia || 'Miembro de Importacolectiva.');
      setEditUbicacion(authUser.ubicacion || 'Bolivia');
      setEditRol(authUser.role || 'Cliente');
    }
  }, [authUser, isEditModalOpen]);

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) {
      router.push('/login');
    }
  }, [authUser, authLoading, router]);

  if (authLoading || !authUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress thickness={5} size={60} />
      </Box>
    );
  }

  const roleConfig = ROLE_CONFIGS[authUser.role] || { color: 'default', label: authUser.role };

  const handleEditSave = async () => {
    const payload = {
      nombre: editNombre,
      telefono: editTelefono,
      biografia: editBiografia,
      ubicacion: editUbicacion,
      rol: editRol
    };

    // Llamar a la API usando putApiService
    const res = await putApiService(Constantes.apiAuthProfile, payload, {
      successMessage: '¡Información de perfil actualizada con éxito!',
      errorMessage: 'No se pudo guardar la información del perfil.'
    });

    if (res) {
      setIsEditModalOpen(false);
      await refreshSession();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <SectionTitle>Mi Perfil</SectionTitle>

      <Grid container spacing={4}>
        {/* Tarjeta de Resumen Lateral */}
        <Grid size={{ xs: 12, md: 4 }}>
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
              onClick={() => setIsEditModalOpen(true)}
            >
              Editar Perfil
            </PrimaryButton>
          </PremiumCard>
        </Grid>

        {/* Tarjeta de Información Detallada */}
        <Grid size={{ xs: 12, md: 8 }}>
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
        </Grid>
      </Grid>

      {/* Modal de Edición */}
      <StandardModal 
        open={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Información Personal"
        actions={
          <>
            <SecondaryButton onClick={() => setIsEditModalOpen(false)}>Cancelar</SecondaryButton>
            <PrimaryButton onClick={handleEditSave} disabled={updateLoading}>
              {updateLoading ? <CircularProgress size={20} color="inherit" /> : 'Guardar Cambios'}
            </PrimaryButton>
          </>
        }
      >
        <Stack spacing={3} sx={{ py: 1 }}>
          <TextField 
            fullWidth 
            label="Nombre Completo" 
            variant="outlined" 
            value={editNombre} 
            onChange={(e) => setEditNombre(e.target.value)}
          />
          <TextField 
            fullWidth 
            label="Teléfono / WhatsApp" 
            variant="outlined" 
            value={editTelefono} 
            onChange={(e) => setEditTelefono(e.target.value)}
          />
          <TextField 
            fullWidth 
            label="Ubicación" 
            variant="outlined" 
            value={editUbicacion} 
            onChange={(e) => setEditUbicacion(e.target.value)}
          />
          
          <FormControl fullWidth>
            <InputLabel id="edit-rol-label">Rol de Usuario (Pruebas)</InputLabel>
            <Select
              labelId="edit-rol-label"
              id="edit-rol"
              value={editRol}
              label="Rol de Usuario (Pruebas)"
              onChange={(e) => setEditRol(e.target.value)}
            >
              <MenuItem value="Cliente">Cliente Estándar</MenuItem>
              <MenuItem value="Premium">Miembro Premium</MenuItem>
              <MenuItem value="Administrador">Administrador</MenuItem>
              <MenuItem value="Asesor">Asesor Técnico</MenuItem>
              <MenuItem value="Proveedor/Agente">Proveedor / Agente</MenuItem>
            </Select>
          </FormControl>

          <TextField 
            fullWidth 
            label="Biografía" 
            variant="outlined" 
            multiline 
            rows={3} 
            value={editBiografia} 
            onChange={(e) => setEditBiografia(e.target.value)}
          />
        </Stack>
      </StandardModal>
    </Container>
  );
}
