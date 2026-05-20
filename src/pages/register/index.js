import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Paper, 
  CircularProgress, 
  MenuItem, 
  Select, 
  InputLabel, 
  FormControl, 
  Grid,
  Divider,
  Button
} from '@mui/material';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useApiService } from '@/hooks/useApiService';
import { Constantes } from '@/utils/constants';
import { PrimaryButton, SecondaryButton } from '@/components/ui';

const ROLES = [
  { value: 'Cliente', label: 'Cliente', description: 'Acceso a compras grupales y tienda.' },
  { value: 'Premium', label: 'Miembro Premium', description: 'Acceso a cursos, asesores y proveedores exclusivos.' },
  { value: 'Administrador', label: 'Administrador', description: 'Acceso al panel de control y moderación de importaciones.' },
  { value: 'Asesor', label: 'Asesor Técnico', description: 'Brinda soporte y videollamadas personalizadas.' },
  { value: 'Proveedor/Agente', label: 'Proveedor / Agente', description: 'Gestiona catálogos de fábricas y logística de envío.' }
];

export default function Register() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('Cliente');
  const [biografia, setBiografia] = useState('');
  const [ubicacion, setUbicacion] = useState('Bolivia');
  
  const { login } = useAuth();
  const { postApiService, loading: apiLoading } = useApiService();
  const [registering, setRegistering] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegistering(true);

    const payload = {
      email,
      password,
      nombre,
      telefono,
      rol,
      biografia,
      ubicacion
    };

    // Llamada al endpoint usando useApiService
    const response = await postApiService(Constantes.apiAuthRegister, payload, {
      successMessage: '¡Cuenta creada con éxito! Iniciando sesión...',
      errorMessage: 'Error al registrar el usuario'
    });

    if (response) {
      // Iniciar sesión automáticamente
      await login(email, password);
    } else {
      setRegistering(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            width: '100%',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Typography component="h1" variant="h4" align="center" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
            Únete a Importacolectiva
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Importaciones grupales y educación en un solo lugar
          </Typography>

          <Box component="form" onSubmit={handleRegister}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  required
                  fullWidth
                  id="nombre"
                  label="Nombre Completo"
                  name="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Correo Electrónico"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  id="telefono"
                  label="Teléfono / WhatsApp"
                  name="telefono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="+591 70000000"
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Contraseña"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth required>
                  <InputLabel id="rol-label">Rol en Plataforma (Pruebas)</InputLabel>
                  <Select
                    labelId="rol-label"
                    id="rol"
                    value={rol}
                    label="Rol en Plataforma (Pruebas)"
                    onChange={(e) => setRol(e.target.value)}
                  >
                    {ROLES.map((r) => (
                      <MenuItem key={r.value} value={r.value}>
                        <Box sx={{ py: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {r.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {r.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  id="ubicacion"
                  label="Ubicación"
                  name="ubicacion"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  id="biografia"
                  label="Breve Biografía"
                  name="biografia"
                  value={biografia}
                  onChange={(e) => setBiografia(e.target.value)}
                  placeholder="Ej: Emprendedor tecnológico."
                />
              </Grid>
            </Grid>

            <PrimaryButton
              type="submit"
              fullWidth
              sx={{ mt: 4, mb: 2, height: 48 }}
              disabled={registering || apiLoading}
            >
              {registering || apiLoading ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                'Registrarse'
              )}
            </PrimaryButton>
            
            <Divider sx={{ my: 3 }} />

            <Box sx={{ textAlignment: 'center', display: 'flex', justifyContent: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                ¿Ya tienes una cuenta?
              </Typography>
              <Link href="/login" passHref style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary" sx={{ fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                  Inicia Sesión
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
