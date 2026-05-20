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
  CircularProgress
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
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

export default function ProfilePage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

  const user = {
    name: authUser.displayName || 'Usuario',
    email: authUser.email || '',
    phone: authUser.phone || 'No registrado',
    location: 'Bolivia',
    bio: 'Importador y miembro activo de Importacolectiva.'
  };

  const handleEditSave = () => {
    setIsEditModalOpen(false);
    // Lógica de edición
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <SectionTitle>Mi Perfil</SectionTitle>

      <Grid container spacing={4}>
        {/* Perfil Header / Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <PremiumCard sx={{ p: 4, textAlign: 'center' }}>
            <Avatar 
              sx={{ 
                width: 120, 
                height: 120, 
                mx: 'auto', 
                mb: 2, 
                bgcolor: 'primary.main',
                fontSize: '3rem'
              }}
            >
              {user.name.charAt(0)}
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              {user.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {user.email}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Stack spacing={2} sx={{ textAlign: 'left' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PhoneIcon color="action" fontSize="small" />
                <Typography variant="body2">{user.phone}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <LocationOnIcon color="action" fontSize="small" />
                <Typography variant="body2">{user.location}</Typography>
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

        {/* Detalles y Gestión */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={4}>
            {/* Información General */}
            <PremiumCard sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="primary" /> Información General
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Bio:</strong> {user.bio}
              </Typography>
              <Typography variant="body1">
                <strong>Miembro desde:</strong> Mayo 2024
              </Typography>
            </PremiumCard>

            {/* Seguridad */}
            <PremiumCard sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <SecurityIcon color="primary" /> Seguridad
              </Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                Tu cuenta está protegida con autenticación de dos pasos.
              </Alert>
              <Stack direction="row" spacing={2}>
                <SecondaryButton>Cambiar Contraseña</SecondaryButton>
                <SecondaryButton color="error">Desactivar Cuenta</SecondaryButton>
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
            <PrimaryButton onClick={handleEditSave}>Guardar Cambios</PrimaryButton>
          </>
        }
      >
        <Stack spacing={3} sx={{ py: 1 }}>
          <TextField 
            fullWidth 
            label="Nombre Completo" 
            variant="outlined" 
            defaultValue={user.name} 
          />
          <TextField 
            fullWidth 
            label="Correo Electrónico" 
            variant="outlined" 
            defaultValue={user.email} 
          />
          <TextField 
            fullWidth 
            label="Teléfono" 
            variant="outlined" 
            defaultValue={user.phone} 
          />
          <TextField 
            fullWidth 
            label="Ubicación" 
            variant="outlined" 
            defaultValue={user.location} 
          />
          <TextField 
            fullWidth 
            label="Biografía" 
            variant="outlined" 
            multiline 
            rows={3} 
            defaultValue={user.bio} 
          />
        </Stack>
      </StandardModal>
    </Container>
  );
}
