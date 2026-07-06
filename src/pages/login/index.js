import React, { useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import GoogleIcon from '@mui/icons-material/Google';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { PrimaryButton } from '@/components/ui';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, loginWithGoogle, loading } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    await loginWithGoogle();
    // La página redirige a Google; si hay error loginWithGoogle notifica.
    setGoogleLoading(false);
  };

  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            width: '100%',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Typography component="h1" variant="h5" align="center" sx={{ fontWeight: 800, mb: 1 }}>
            Iniciar Sesión
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Bienvenido de vuelta a Importacolectiva
          </Typography>

          {/* Botón Google */}
          <Button
            fullWidth
            variant="outlined"
            startIcon={googleLoading ? <CircularProgress size={18} /> : <GoogleIcon />}
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            sx={{
              height: 48,
              borderColor: 'divider',
              color: 'text.primary',
              fontWeight: 600,
              mb: 3,
              '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
            }}
          >
            Continuar con Google
          </Button>

          <Divider sx={{ mb: 3 }}>
            <Typography variant="caption" color="text.secondary">
              o con correo y contraseña
            </Typography>
          </Divider>

          <Box component="form" onSubmit={handleLogin}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Correo Electrónico"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <PrimaryButton
              type="submit"
              fullWidth
              sx={{ mt: 3, mb: 2, width: '100%', height: 48 }}
              disabled={loading || googleLoading}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Entrar'}
            </PrimaryButton>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Link href="/forgot-password" passHref style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                  ¿Olvidaste tu contraseña?
                </Typography>
              </Link>
              <Link href="/register" passHref style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary" sx={{ fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                  Registrarse
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
