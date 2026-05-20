import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Paper, 
  CircularProgress, 
  Alert 
} from '@mui/material';
import Link from 'next/link';
import { useApiService } from '@/hooks/useApiService';
import { Constantes } from '@/utils/constants';
import { PrimaryButton } from '@/components/ui';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const { postApiService, loading } = useApiService();

  const handleReset = async (e) => {
    e.preventDefault();

    const response = await postApiService(Constantes.apiAuthResetPassword, { email }, {
      successMessage: 'Enlace enviado a tu bandeja de correo.',
      errorMessage: 'Error al enviar solicitud de recuperación'
    });

    if (response) {
      setSuccess(true);
    }
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
            Recuperar Contraseña
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Introduce tu correo y te enviaremos las instrucciones de restablecimiento.
          </Typography>

          {success ? (
            <Box>
              <Alert severity="success" sx={{ mb: 3 }}>
                Hemos enviado un correo electrónico con las instrucciones para restablecer tu contraseña. Revisa tu carpeta de spam si no lo recibes.
              </Alert>
              <Link href="/login" passHref style={{ textDecoration: 'none' }}>
                <PrimaryButton fullWidth sx={{ height: 48 }}>
                  Volver al Login
                </PrimaryButton>
              </Link>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleReset}>
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
              <PrimaryButton
                type="submit"
                fullWidth
                sx={{ mt: 3, mb: 2, height: 48 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Enviar Instrucciones'}
              </PrimaryButton>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Link href="/login" passHref style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="primary" sx={{ fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                    Volver al Login
                  </Typography>
                </Link>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}
