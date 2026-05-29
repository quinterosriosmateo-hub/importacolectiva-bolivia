import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Grid,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  CircularProgress,
  Stack,
  Fade
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { PrimaryButton, SecondaryButton } from '@/components/ui';

export default function PaymentModal({ open, onClose, onConfirm, planName, price }) {
  const [method, setMethod] = useState('qr');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form states for Credit Card
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // Receipt upload simulation for bank transfer
  const [receiptName, setReceiptName] = useState('');

  const handleMethodChange = (event) => {
    setMethod(event.target.value);
  };

  const handlePay = async () => {
    setLoading(true);
    // Simular procesamiento del pago
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoading(false);
    setSuccess(true);
    // Simular un pequeño retardo antes de cerrar y notificar al padre
    await new Promise((resolve) => setTimeout(resolve, 1500));
    onConfirm(method);
    // Reset modal state
    setSuccess(false);
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setCardName('');
    setReceiptName('');
  };

  const handleFileSimulate = () => {
    setReceiptName('comprobante_pago_importa_' + Math.floor(Math.random() * 100000) + '.jpg');
  };

  const isFormValid = () => {
    if (method === 'card') {
      return cardNumber && cardExpiry && cardCvv && cardName;
    }
    if (method === 'transfer') {
      return !!receiptName;
    }
    return true; // QR is always valid as it's simulated scanning
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: 4, p: 1 }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>Pagar Suscripción</Typography>
        {!loading && (
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent dividers sx={{ borderBottom: 'none', py: 3 }}>
        {success ? (
          <Fade in={success}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, textAlign: 'center' }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                ¡Pago Simulado con Éxito!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Procesando tu suscripción a {planName}...
              </Typography>
            </Box>
          </Fade>
        ) : loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, textAlign: 'center' }}>
            <CircularProgress size={60} thickness={5} sx={{ mb: 3 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Procesando Pago Simulado...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Por favor, no cierres esta ventana.
            </Typography>
          </Box>
        ) : (
          <Box>
            <Box sx={{ mb: 3, p: 2, bgcolor: 'background.alt', borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
              <Grid container justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>Plan Seleccionado</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>{planName}</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>Total a Pagar</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>{price}</Typography>
                </Box>
              </Grid>
            </Box>

            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
              Selecciona tu método de pago
            </Typography>

            <RadioGroup value={method} onChange={handleMethodChange}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box
                    sx={{
                      border: '2px solid',
                      borderColor: method === 'qr' ? 'primary.main' : 'divider',
                      borderRadius: 3,
                      p: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      bgcolor: method === 'qr' ? 'rgba(24, 119, 242, 0.04)' : 'transparent',
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: 'primary.main' }
                    }}
                    onClick={() => setMethod('qr')}
                  >
                    <QrCode2Icon color={method === 'qr' ? 'primary' : 'action'} sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Pago QR</Typography>
                    <Radio value="qr" checked={method === 'qr'} size="small" sx={{ mt: 0.5 }} />
                  </Box>
                </Grid>

                <Grid item xs={4}>
                  <Box
                    sx={{
                      border: '2px solid',
                      borderColor: method === 'transfer' ? 'primary.main' : 'divider',
                      borderRadius: 3,
                      p: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      bgcolor: method === 'transfer' ? 'rgba(24, 119, 242, 0.04)' : 'transparent',
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: 'primary.main' }
                    }}
                    onClick={() => setMethod('transfer')}
                  >
                    <AccountBalanceIcon color={method === 'transfer' ? 'primary' : 'action'} sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Transferencia</Typography>
                    <Radio value="transfer" checked={method === 'transfer'} size="small" sx={{ mt: 0.5 }} />
                  </Box>
                </Grid>

                <Grid item xs={4}>
                  <Box
                    sx={{
                      border: '2px solid',
                      borderColor: method === 'card' ? 'primary.main' : 'divider',
                      borderRadius: 3,
                      p: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      bgcolor: method === 'card' ? 'rgba(24, 119, 242, 0.04)' : 'transparent',
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: 'primary.main' }
                    }}
                    onClick={() => setMethod('card')}
                  >
                    <CreditCardIcon color={method === 'card' ? 'primary' : 'action'} sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Tarjeta</Typography>
                    <Radio value="card" checked={method === 'card'} size="small" sx={{ mt: 0.5 }} />
                  </Box>
                </Grid>
              </Grid>
            </RadioGroup>

            <Box sx={{ mt: 4 }}>
              {method === 'qr' && (
                <Stack spacing={2} alignItems="center" sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Escanea el código QR desde la aplicación de tu banco favorito en Bolivia para realizar el pago simulado de 200 BS.
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: 'white',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 4,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {/* Render a mock premium SVG QR code */}
                    <svg width="180" height="180" viewBox="0 0 100 100" style={{ shapeRendering: 'crispEdges' }}>
                      <path d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z" fill="#1A1F2C" />
                      <path d="M40,0 h10 v10 h-10 z M50,10 h10 v10 h-10 z M40,20 h20 v10 h-20 z M30,40 h10 v10 h-10 z M50,40 h20 v10 h-20 z M80,40 h20 v10 h-20 z M0,50 h20 v10 h-20 z M40,60 h10 v10 h-10 z M60,60 h20 v10 h-20 z M50,70 h10 v10 h-10 z M90,70 h10 v10 h-10 z M30,80 h20 v10 h-20 z M70,80 h10 v10 h-10 z M90,80 h10 v10 h-10 z M40,90 h10 v10 h-10 z M60,90 h30 v10 h-30 z" fill="#1877F2" />
                      {/* Logo in the center */}
                      <rect x="38" y="38" width="24" height="24" rx="4" fill="#FFFFFF" />
                      <circle cx="50" cy="50" r="8" fill="#F7B928" />
                    </svg>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Código de transacción: ICB-SUB-{Math.floor(Math.random() * 1000000)}
                  </Typography>
                </Stack>
              )}

              {method === 'transfer' && (
                <Stack spacing={2}>
                  <Typography variant="body2" color="text.secondary">
                    Realiza una transferencia bancaria a la siguiente cuenta de la empresa y sube tu comprobante.
                  </Typography>
                  <Box sx={{ p: 2.5, bgcolor: 'background.alt', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>BANCO</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>Banco de Crédito (BCP)</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>NÚMERO DE CUENTA</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>301-5098234-3-12</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>BENEFICIARIO</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>Importacolectiva Bolivia S.R.L.</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>NIT</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>349812028</Typography>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Sube tu comprobante de pago</Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Button variant="outlined" color="primary" onClick={handleFileSimulate} sx={{ textTransform: 'none', borderRadius: 2 }}>
                        Simular Subir Archivo
                      </Button>
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        {receiptName || 'Ningún archivo seleccionado'}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              )}

              {method === 'card' && (
                <Stack spacing={2}>
                  <Typography variant="body2" color="text.secondary">
                    Ingresa los datos de tu tarjeta de crédito o débito de forma segura.
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="Nombre en la Tarjeta"
                    variant="outlined"
                    size="small"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="JUAN PEREZ"
                  />
                  
                  <TextField
                    fullWidth
                    label="Número de Tarjeta"
                    variant="outlined"
                    size="small"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4111 2222 3333 4444"
                  />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Fecha de Expiración"
                        variant="outlined"
                        size="small"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/AA"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Código de Seguridad (CVV)"
                        variant="outlined"
                        size="small"
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="123"
                      />
                    </Grid>
                  </Grid>
                </Stack>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>

      {!success && !loading && (
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <SecondaryButton onClick={onClose} sx={{ flex: 1 }}>
            Cancelar
          </SecondaryButton>
          <PrimaryButton
            onClick={handlePay}
            disabled={!isFormValid()}
            sx={{ flex: 1 }}
          >
            Confirmar Pago
          </PrimaryButton>
        </DialogActions>
      )}
    </Dialog>
  );
}
