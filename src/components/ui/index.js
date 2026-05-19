import React from 'react';
import { 
  Button, 
  Card, 
  Typography, 
  Box, 
  styled, 
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// --- Primary Button: Elegante y con profundidad ---
export const PrimaryButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(180deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
  border: 0,
  borderRadius: 8,
  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
  color: theme.palette.primary.contrastText,
  height: 48,
  padding: '0 32px',
  fontWeight: 600,
  letterSpacing: '0.5px',
  transition: 'all 0.25s ease-in-out',
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: `0 6px 18px ${alpha(theme.palette.primary.main, 0.3)}`,
    filter: 'brightness(1.1)',
  },
  '&:active': {
    transform: 'translateY(0)',
  }
}));

// --- Premium Card: Minimalista y limpia ---
export const PremiumCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  border: `1px solid ${theme.palette.divider}`, // Usar el divisor del tema
  background: theme.palette.background.paper,
  boxShadow: '0 8px 24px rgba(0,0,0,0.04)', // Sombra muy sutil
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  overflow: 'hidden',
  position: 'relative',
  '&:hover': {
    borderColor: alpha(theme.palette.primary.main, 0.2),
    boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
  },
}));

// --- Section Header: Tipografía jerarquizada ---
export const SectionTitle = ({ children }) => (
  <Box sx={{ mb: 5 }}>
    <Typography
      variant="h4"
      sx={{
        fontWeight: 800,
        color: 'text.primary',
        letterSpacing: '-0.02em',
        mb: 1.5
      }}
    >
      {children}
    </Typography>
    <Box sx={{
      width: 40,
      height: 4,
      borderRadius: 2,
      bgcolor: 'secondary.main' // Accent color sutil
    }} />
  </Box>
);

// --- Offer Badge: Tag de precio/oferta limpio ---
export const OfferBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  right: 16,
  background: theme.palette.secondary.main,
  color: theme.palette.secondary.contrastText,
  padding: '4px 10px',
  borderRadius: 6,
  fontWeight: 700,
  fontSize: '0.7rem',
  textTransform: 'uppercase',
  zIndex: 1,
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
}));

// --- Secondary Button: Elegante y minimalista ---
export const SecondaryButton = styled(Button)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 8,
  color: theme.palette.text.primary,
  height: 48,
  padding: '0 32px',
  fontWeight: 600,
  background: 'transparent',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: alpha(theme.palette.primary.main, 0.04),
    borderColor: theme.palette.primary.main,
  },
}));

// --- Standard Modal Component ---
export const StandardModal = ({ open, onClose, title, children, actions }) => (
  <Dialog 
    open={open} 
    onClose={onClose}
    fullWidth
    maxWidth="sm"
    PaperProps={{
      sx: { borderRadius: 3, p: 1 }
    }}
  >
    <DialogTitle sx={{ m: 0, p: 2, fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {title}
      <IconButton onClick={onClose} size="small">
        <CloseIcon />
      </IconButton>
    </DialogTitle>
    <DialogContent dividers sx={{ borderBottom: 'none' }}>
      {children}
    </DialogContent>
    {actions && (
      <DialogActions sx={{ p: 2, pt: 0 }}>
        {actions}
      </DialogActions>
    )}
  </Dialog>
);