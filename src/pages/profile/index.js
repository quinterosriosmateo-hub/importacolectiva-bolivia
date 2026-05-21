import React, { useState, useEffect } from 'react';
import { Box, Container, Grid, CircularProgress } from '@mui/material';
import { SectionTitle } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useApiService } from '@/hooks/useApiService';
import { Constantes } from '@/utils/constants';
import { useRouter } from 'next/router';

// Subcomponents
import ProfileCard from '@/pages/profile/ProfileCard';
import ProfileDetails from '@/pages/profile/ProfileDetails';
import EditProfileModal from '@/pages/profile/EditProfileModal';

export default function ProfilePage() {
  const { user: authUser, loading: authLoading, refreshSession } = useAuth();
  const { putApiService, loading: updateLoading } = useApiService();
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

  const handleEditSave = async (payload) => {
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
    <Container maxWidth="lg" >
      <SectionTitle>Mi Perfil</SectionTitle>

      <Grid container spacing={4}>
        {/* Tarjeta de Resumen Lateral */}
        <Grid size={{ xs: 12, md: 4 }}>
          <ProfileCard 
            authUser={authUser} 
            onEditClick={() => setIsEditModalOpen(true)} 
          />
        </Grid>

        {/* Tarjeta de Información Detallada */}
        <Grid size={{ xs: 12, md: 8 }}>
          <ProfileDetails authUser={authUser} />
        </Grid>
      </Grid>

      {/* Modal de Edición */}
      <EditProfileModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={authUser}
        onSave={handleEditSave}
        updateLoading={updateLoading}
      />
    </Container>
  );
}
