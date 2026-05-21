import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Card,
  Grid,
  Avatar,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
  Paper,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InfoIcon from '@mui/icons-material/Info';

import { useApiService } from '@/hooks/useApiService';
import { useAuth } from '@/contexts/AuthContext';
import { Constantes, ROLES, ESTADOS } from '@/utils/constants';
import { getRoleChipColor, getEstadoChipColor } from '@/utils/helpers';

export default function UserDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user: currentUser } = useAuth();
  const { getApiService, patchApiService } = useApiService();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [selectedRol, setSelectedRol] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');

  const fetchUser = async () => {
    if (!id) return;
    setLoading(true);
    const res = await getApiService(`${Constantes.apiAdminUsers}/${id}`);
    if (res && res.code === 0) {
      setUser(res.user);
      setSelectedRol(res.user.rol || 'Cliente');
      setSelectedEstado(res.user.estado || 'activo');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  const handleUpdate = async () => {
    if (!user) return;
    setUpdating(true);

    const res = await patchApiService(`${Constantes.apiAdminUsers}/${user.id}`, {
      rol: selectedRol,
      estado: selectedEstado
    }, {
      successMessage: 'Usuario actualizado con éxito',
      errorMessage: 'Error al actualizar el usuario'
    });

    if (res && res.code === 0) {
      fetchUser();
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={50} />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h5" color="error" sx={{ mb: 2 }}>Usuario no encontrado</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/admin')}>Volver al Panel</Button>
      </Box>
    );
  }

  const isSelf = currentUser?.id === user.id;

  return (
    <Box sx={{ pb: 6 }}>
      {/* Botón de retorno */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.push('/admin')}
        sx={{ mb: 3, fontWeight: 700, color: 'text.secondary' }}
      >
        Volver al Panel Administrador
      </Button>

      <Grid container spacing={4}>
        {/* Tarjeta Perfil Físico */}
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 4, textAlign: 'center', borderRadius: 4, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <Avatar
              src={user.avatar_url}
              sx={{ width: 120, height: 120, mx: 'auto', mb: 3, bgcolor: 'primary.light', fontSize: '3rem' }}
            >
              {user.nombre ? user.nombre.charAt(0).toUpperCase() : 'U'}
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
              {user.nombre}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 3 }}>
              <Chip label={user.rol} color={getRoleChipColor(user.rol)} sx={{ fontWeight: 700, borderRadius: 2 }} />
              <Chip label={(user.estado || 'activo').toUpperCase()} color={getEstadoChipColor(user.estado || 'activo')} sx={{ fontWeight: 700, borderRadius: 2 }} />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, textAlign: 'left' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <EmailIcon sx={{ color: 'text.secondary' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Correo electrónico</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{user.email}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <PhoneIcon sx={{ color: 'text.secondary' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Teléfono</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{user.telefono || 'No registrado'}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <LocationOnIcon sx={{ color: 'text.secondary' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Ubicación</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{user.ubicacion || 'No especificada'}</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CalendarMonthIcon sx={{ color: 'text.secondary' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Miembro desde</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Detalles / Edición de Roles y Estado */}
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 4, borderRadius: 4, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', mb: 3 }}>
              Gestión de Permisos
            </Typography>

            {isSelf ? (
              <Box sx={{ bgcolor: 'rgba(255, 61, 0, 0.05)', p: 2.5, borderRadius: 3, border: '1px solid rgba(255, 61, 0, 0.1)', mb: 3 }}>
                <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>
                  ⚠️ Estás viendo tu propio perfil. Para evitar bloqueos accidentales, no puedes cambiar tu propio rol desde este panel.
                </Typography>
              </Box>
            ) : null}

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={isSelf || updating}>
                  <InputLabel>Rol de Usuario</InputLabel>
                  <Select
                    value={selectedRol}
                    onChange={(e) => setSelectedRol(e.target.value)}
                    label="Rol de Usuario"
                  >
                    {ROLES.map(role => (
                      <MenuItem key={role} value={role}>{role}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth disabled={isSelf || updating}>
                  <InputLabel>Estado de Cuenta</InputLabel>
                  <Select
                    value={selectedEstado}
                    onChange={(e) => setSelectedEstado(e.target.value)}
                    label="Estado de Cuenta"
                  >
                    {ESTADOS.map(estado => (
                      <MenuItem key={estado} value={estado}>{estado.toUpperCase()}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                color="primary"
                disabled={isSelf || updating || (selectedRol === user.rol && selectedEstado === user.estado)}
                onClick={handleUpdate}
                sx={{ px: 4, py: 1.2, fontWeight: 700 }}
              >
                {updating ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </Box>
          </Card>

          <Card sx={{ p: 4, borderRadius: 4, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', mb: 3 }}>
              Biografía / Notas
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6, fontStyle: user.biografia ? 'normal' : 'italic' }}>
              {user.biografia || 'El usuario no ha definido una biografía.'}
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
