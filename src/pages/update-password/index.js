import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Paper, 
  CircularProgress, 
  Alert 
} from '@mui/material';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import { PrimaryButton } from '@/components/ui';
import { useNotification } from '@/contexts/NotificationContext';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { notify } = useNotification();

  useEffect(() => {
    // Supabase will automatically process the recovery token from the URL hash
    // and log the user in. We just need to wait for the user to submit the new password.
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // We'll give it a moment as it might be parsing
        setTimeout(async () => {
          const { data: { session: delayedSession } } = await supabase.auth.getSession();
          if (!delayedSession) {
            setError('El enlace de recuperación es inválido o ha expirado.');
          }
        }, 1000);
      }
    };
    
    checkSession();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      notify(updateError.message, 'error');
    } else {
      setSuccess(true);
      notify('Contraseña actualizada correctamente.', 'success');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
    setLoading(false);
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
            Actualizar Contraseña
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
          
          {success ? (
            <Alert severity="success" sx={{ mb: 3 }}>
              ¡Tu contraseña se ha actualizado exitosamente! Redirigiendo al inicio de sesión...
            </Alert>
          ) : (
            <Box component="form" onSubmit={handleUpdate}>
              <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
                Ingresa tu nueva contraseña a continuación.
              </Typography>
              <TextField
                margin="normal"
                required
                fullWidth
                id="password"
                label="Nueva Contraseña"
                name="password"
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <PrimaryButton
                type="submit"
                fullWidth
                sx={{ mt: 3, mb: 2, height: 48 }}
                disabled={loading || !!error}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Actualizar Contraseña'}
              </PrimaryButton>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
}
