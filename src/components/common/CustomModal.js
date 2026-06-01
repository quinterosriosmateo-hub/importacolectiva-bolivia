import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Slide,
  Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// Componente de transición dinámica que lee la dirección del estado del Dialog
const DynamicTransition = React.forwardRef(function Transition(props, ref) {
  const direction = props['data-direction'] || 'up'; // 'up' por defecto para que suba al aparecer
  return <Slide direction={direction} ref={ref} {...props} timeout={{ enter: 400, exit: 300 }} />;
});

/**
 * Componente Modal Reutilizable Ultra-Completo para Formularios y Confirmaciones
 * Con salidas animadas condicionales y botones personalizables.
 */
const CustomModal = ({
  open,
  onClose,
  onConfirm, // Nueva función específica para procesar la confirmación
  title,
  subtitle,
  children,
  actions, // Si pasas acciones personalizadas, anula los botones por defecto
  maxWidth = "sm",
  fullWidth = true,
  icon,
  disableBackdropClick = false,
  // Props opcionales de personalización de textos para los botones por defecto
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmColor = "primary",
}) => {
  // 'up' hace que el modal suba desde abajo al aparecer.
  const [slideDirection, setSlideDirection] = useState('up');

  // Cada vez que el modal se abre de nuevo, reiniciamos la animación para que entre desde abajo ('up')
  useEffect(() => {
    if (open) {
      setSlideDirection('up');
    }
  }, [open]);

  // Manejo de la salida por cancelación, clic externo o botón X (Hacia abajo)
  const handleCloseDown = (event, reason) => {
    if (disableBackdropClick && reason === 'backdropClick') return;
    
    setSlideDirection('down'); // Cambia la física de salida para que caiga
    setTimeout(() => {
      if (onClose) onClose(event, reason);
    }, 50); // Pequeño delay imperceptible para que el estado de la dirección se aplique
  };

  // Manejo de la salida por éxito o confirmación (Hacia arriba)
  const handleConfirmUp = (event) => {
    setSlideDirection('up'); // Sigue subiendo hacia arriba al salir
    setTimeout(() => {
      if (onConfirm) onConfirm(event);
    }, 50);
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseDown}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      scroll="paper"
      TransitionComponent={DynamicTransition}
      TransitionProps={{ 'data-direction': slideDirection }} // Inyecta la dirección actual al componente Slide
      sx={{
        '& .MuiDialog-container': {
          alignItems: 'center',
        }
      }}
      PaperProps={{
        sx: {
          borderRadius: '24px',
          boxShadow: '0px 24px 64px rgba(0, 0, 0, 0.12), 0px 8px 24px rgba(0, 0, 0, 0.04)',
          backgroundImage: 'none',
          position: 'relative',
        }
      }}
    >
      {/* HEADER */}
      <DialogTitle
        sx={{
          p: 3,
          pb: subtitle ? 1.5 : 2.5,
          position: 'relative',
          display: 'flex',
          gap: 2,
          alignItems: icon ? 'flex-start' : 'center',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px'
        }}
      >
        {icon && <Box sx={{ display: 'flex', pt: 0.5 }}>{icon}</Box>}

        <Box sx={{ pr: 4, flex: 1 }}>
          <Typography
            variant="h6"
            component="h2"
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              letterSpacing: '-0.025em',
              lineHeight: 1.25
            }}
          >
            {title}
          </Typography>

          {subtitle && (
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', mt: 0.5, lineHeight: 1.45 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {onClose && (
          <IconButton
            aria-label="close"
            onClick={(e) => handleCloseDown(e, 'closeButtonClick')}
            size="small"
            sx={{
              position: 'absolute',
              right: 20,
              top: 20,
              color: 'text.disabled',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                color: 'text.primary',
                backgroundColor: 'action.hover',
                transform: 'scale(1.08)'
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </DialogTitle>

      {/* CONTENIDO */}
      <DialogContent
        sx={{
          px: 3,
          py: 0.5,
          borderBottomLeftRadius: (actions || onConfirm) ? 0 : '24px',
          borderBottomRightRadius: (actions || onConfirm) ? 0 : '24px',
          overflowY: 'auto',
          '&::-webkit-scrollbar': { width: '8px' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: 'divider', borderRadius: '4px' }
        }}
      >
        <Box sx={{ py: 1.5 }}>{children}</Box>
      </DialogContent>

      {/* ACCIONES (Botones dinámicos inteligentes) */}
      {(actions || onConfirm || onClose) && (
        <DialogActions
          sx={{
            p: 3,
            pt: 2,
            gap: 1.5,
            borderBottomLeftRadius: '24px',
            borderBottomRightRadius: '24px',
            borderTop: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'grey.50',
            flexWrap: 'wrap-reverse',
            justifyContent: 'flex-end'
          }}
        >
          {/* Si pasas la prop nativa 'actions', se dibuja tu layout libre customizado */}
          {actions ? (
            actions
          ) : (
            <>
              {/* De lo contrario, autogenera los botones usando las nuevas props de configuración */}
              {onClose && (
                <Button 
                  onClick={(e) => handleCloseDown(e, 'cancelButtonClick')} 
                  variant="outlined" 
                  color="inherit"
                  sx={{ borderRadius: '10px', px: 2.5 }}
                >
                  {cancelText}
                </Button>
              )}
              {onConfirm && (
                <Button 
                  onClick={handleConfirmUp} 
                  variant="contained" 
                  color={confirmColor}
                  sx={{ borderRadius: '10px', px: 3, fontWeight: 600 }}
                >
                  {confirmText}
                </Button>
              )}
            </>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default CustomModal;