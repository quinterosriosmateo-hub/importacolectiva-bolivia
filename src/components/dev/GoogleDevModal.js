import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Avatar,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import BugReportIcon from '@mui/icons-material/BugReport';
import { PrimaryButton, SecondaryButton } from '@/components/ui';

/**
 * GoogleDevModal
 * Modal exclusivo de desarrollo que simula el login con Google.
 * Carga la lista de usuarios reales de Supabase y permite iniciar sesión
 * como cualquiera de ellos ingresando la contraseña.
 *
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - onLogin: (email, password) => Promise<void>  ← llama al login real
 */
export default function GoogleDevModal({ open, onClose, onLogin }) {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Cargar lista de usuarios cuando se abre el modal
  useEffect(() => {
    if (!open) return;
    setLoadingUsers(true);
    setFetchError(null);

    fetch('/api/dev/users')
      .then((r) => r.json())
      .then((data) => {
        if (data.code === 0 && data.users?.length > 0) {
          setUsers(data.users);
          setSelectedEmail(data.users[0].email);
        } else {
          setFetchError('No se encontraron usuarios registrados.');
        }
      })
      .catch(() => setFetchError('Error al cargar los usuarios.'))
      .finally(() => setLoadingUsers(false));
  }, [open]);

  const handleSubmit = useCallback(async () => {
    if (!selectedEmail || !password) return;
    setSubmitting(true);
    try {
      await onLogin(selectedEmail, password);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }, [selectedEmail, password, onLogin, onClose]);

  const selectedUser = users.find((u) => u.email === selectedEmail);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: 'linear-gradient(135deg, #fff 0%, #f8faff 100%)',
          boxShadow: '0 8px 40px rgba(66,133,244,0.15)',
        },
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ pb: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: 'rgba(66,133,244,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <GoogleIcon sx={{ color: '#4285F4', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Login con Google
            </Typography>
            <Chip
              icon={<BugReportIcon sx={{ fontSize: '14px !important' }} />}
              label="Modo desarrollo"
              size="small"
              color="warning"
              variant="outlined"
              sx={{ height: 20, fontSize: 11, mt: 0.3 }}
            />
          </Box>
        </Box>
      </DialogTitle>

      <Divider sx={{ mx: 3, mt: 2 }} />

      <DialogContent sx={{ pt: 2.5 }}>
        {loadingUsers ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={32} />
          </Box>
        ) : fetchError ? (
          <Typography color="error" variant="body2" textAlign="center" sx={{ py: 2 }}>
            {fetchError}
          </Typography>
        ) : (
          <>
            {/* Selector de usuario */}
            <TextField
              select
              fullWidth
              label="Iniciar sesión como"
              value={selectedEmail}
              onChange={(e) => setSelectedEmail(e.target.value)}
              size="small"
              sx={{ mb: 2 }}
            >
              {users.map((u) => (
                <MenuItem key={u.id} value={u.email}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      src={u.avatar_url}
                      alt={u.nombre}
                      sx={{ width: 28, height: 28, fontSize: 13 }}
                    >
                      {u.nombre?.[0]?.toUpperCase() ?? '?'}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600} lineHeight={1.2}>
                        {u.nombre}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" lineHeight={1}>
                        {u.email}
                      </Typography>
                    </Box>
                    {u.rol && u.rol !== 'Cliente' && (
                      <Chip label={u.rol} size="small" color="primary" sx={{ ml: 'auto', height: 18, fontSize: 10 }} />
                    )}
                  </Box>
                </MenuItem>
              ))}
            </TextField>

            {/* Preview del usuario seleccionado */}
            {selectedUser && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'rgba(66,133,244,0.06)',
                  border: '1px solid rgba(66,133,244,0.2)',
                  mb: 2,
                }}
              >
                <Avatar
                  src={selectedUser.avatar_url}
                  sx={{ width: 36, height: 36, bgcolor: '#4285F4' }}
                >
                  {selectedUser.nombre?.[0]?.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={700}>
                    {selectedUser.nombre}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedUser.email}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Contraseña propuesta */}
            <TextField
              fullWidth
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="small"
              helperText="Podés cambiarla si tu cuenta usa una diferente"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((v) => !v)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <SecondaryButton onClick={onClose} disabled={submitting} size="small">
          Cancelar
        </SecondaryButton>
        <PrimaryButton
          onClick={handleSubmit}
          disabled={submitting || loadingUsers || !selectedEmail || !!fetchError}
          size="small"
          startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <GoogleIcon />}
          sx={{ flex: 1 }}
        >
          {submitting ? 'Iniciando...' : 'Entrar'}
        </PrimaryButton>
      </DialogActions>
    </Dialog>
  );
}
