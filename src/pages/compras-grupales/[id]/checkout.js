import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  TextField,
  RadioGroup,
  Radio,
  Button,
  Stack,
  Divider,
  CircularProgress,
  IconButton,
  MenuItem,
  Card,
  Fade,
  Alert,
  Stepper,
  Step,
  StepLabel,
  InputAdornment
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';
import ShieldIcon from '@mui/icons-material/Shield';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CategoryIcon from '@mui/icons-material/Category';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import PersonIcon from '@mui/icons-material/Person';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useApiService } from '@/hooks/useApiService';
import { Constantes } from '@/utils/constants';
import { PrimaryButton, PremiumCard } from '@/components/ui';
import Link from 'next/link';

const DEPARTMENTS = [
  'La Paz', 'Santa Cruz', 'Cochabamba', 'Oruro', 'Potosí', 'Tarija', 'Beni', 'Pando', 'Chuquisaca'
];

const STEPS = ['Cupos y Contacto', 'Dirección', 'Pago'];

export default function GroupPurchaseCheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const { getApiService, postApiService } = useApiService();
  const router = useRouter();
  const { id } = router.query;
  const [activeStep, setActiveStep] = useState(0);

  const [compra, setCompra] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  const [method, setMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Cantidad de cupos a comprar
  const [cantidad, setCantidad] = useState(1);

  // Card form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // Transfer form states
  const [receiptName, setReceiptName] = useState('');
  const [referencia, setReferencia] = useState('');

  // Billing Address
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Santa Cruz');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user, authLoading, router]);

  const fetchCompra = useCallback(async () => {
    if (!id) return;
    setDataLoading(true);
    const data = await getApiService(`/api/compras-grupales/${id}`, { requireAuth: false });
    if (data) {
      setCompra(data);
    }
    setDataLoading(false);
  }, [id, getApiService]);

  useEffect(() => {
    fetchCompra();
  }, [fetchCompra]);

  const precioUnitario = compra && compra.cupo_maximo > 0 ? (compra.costo_total / compra.cupo_maximo) : 0;
  const totalPagar = precioUnitario * cantidad;
  const cuposDisponibles = compra ? Math.max(0, compra.cupo_maximo - compra.participantes_count) : 0;

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const paymentMethod = method === 'qr' ? 'QR' : method === 'transfer' ? 'Transferencia' : 'Tarjeta';
    const refText = method === 'transfer' || method === 'qr' ? referencia || 'TRX-APP' : `TARJETA-${cardNumber.slice(-4)}`;

    const res = await postApiService(
      `/api/compras-grupales/${id}/join`,
      {
        monto: totalPagar,
        cantidad: cantidad,
        metodo: paymentMethod,
        referencia: refText,
        comprobante_url: receiptName || null
      },
      {
        successMessage: '✅ Pago registrado y cupos reservados exitosamente.',
        errorMessage: 'Hubo un error al procesar la reserva.'
      }
    );

    setLoading(false);
    if (res) {
      setSuccess(true);
      // Redirect back to group purchase details after 2.5 seconds
      setTimeout(() => {
        router.push(`/compras-grupales/${id}`);
      }, 2500);
    }
  };

  const simulateReceiptUpload = () => {
    setReceiptName(`COMPROBANTE_BCP_${Math.floor(100000 + Math.random() * 900000)}.pdf`);
    setReferencia(`REF-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  const isStepValid = (step) => {
    switch (step) {
      case 0:
        return !!email && !!phone && cantidad >= 1 && cantidad <= cuposDisponibles;
      case 1:
        return !!address && !!department;
      case 2:
        if (method === 'card') {
          return cardNumber.length >= 15 && cardExpiry.includes('/') && cardCvv.length >= 3 && !!cardName;
        }
        if (method === 'transfer') {
          return !!receiptName && !!referencia;
        }
        return true; // QR solo necesita confirmación
      default:
        return false;
    }
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Fade in={activeStep === 0}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3 }}>
                1. Selecciona tus cupos e información básica
              </Typography>
              
              {/* Selector de Cantidad */}
              <Box sx={{ mb: 4, p: 3, border: '1px solid', borderColor: 'primary.main', borderRadius: 3, bgcolor: 'rgba(59,130,246,0.03)' }}>
                <Typography variant="body2" sx={{ fontWeight: 800, mb: 2, color: 'primary.main', textTransform: 'uppercase', letterSpacing: 1 }}>
                  ¿Cuántos cupos deseas reservar?
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', bgcolor: 'white' }}>
                    <IconButton onClick={() => setCantidad(Math.max(1, cantidad - 1))} disabled={cantidad <= 1} sx={{ borderRadius: 0, p: 1.5 }}>
                      <RemoveIcon />
                    </IconButton>
                    <Typography sx={{ px: 3, fontWeight: 800, fontSize: '1.2rem', minWidth: '40px', textAlign: 'center' }}>
                      {cantidad}
                    </Typography>
                    <IconButton onClick={() => setCantidad(Math.min(cuposDisponibles, cantidad + 1))} disabled={cantidad >= cuposDisponibles} sx={{ borderRadius: 0, p: 1.5 }}>
                      <AddIcon />
                    </IconButton>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Inversión por cupo</Typography>
                    <Typography variant="h6" fontWeight={800}>${precioUnitario.toFixed(2)} USD</Typography>
                  </Box>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Correo Electrónico" variant="outlined" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Teléfono Celular" variant="outlined" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </Grid>
              </Grid>
            </Box>
          </Fade>
        );
      case 1:
        return (
          <Fade in={activeStep === 1}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3 }}>
                2. Dirección de facturación y entrega
              </Typography>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth select label="Departamento" value={department} onChange={(e) => setDepartment(e.target.value)} required>
                    {DEPARTMENTS.map((dept) => <MenuItem key={dept} value={dept}>{dept}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="País" variant="outlined" value="Bolivia" disabled />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Dirección Detallada" variant="outlined" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Av. Siempre Viva 123, Zona Sur..." required multiline rows={2} />
                </Grid>
              </Grid>
            </Box>
          </Fade>
        );
      case 2:
        return (
          <Fade in={activeStep === 2}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3 }}>
                3. Confirmar Método de Pago
              </Typography>
              <RadioGroup value={method} onChange={(e) => setMethod(e.target.value)} sx={{ mb: 4 }}>
                <Grid container spacing={2}>
                  {[
                    { id: 'card', label: 'Tarjeta', icon: <CreditCardIcon /> },
                    { id: 'qr', label: 'Pago QR', icon: <QrCode2Icon /> },
                    { id: 'transfer', label: 'Transferencia', icon: <AccountBalanceIcon /> }
                  ].map((m) => (
                    <Grid item xs={4} key={m.id}>
                      <Box
                        onClick={() => setMethod(m.id)}
                        sx={{
                          border: '2px solid', borderColor: method === m.id ? 'primary.main' : 'divider',
                          borderRadius: 3, p: 2, textAlign: 'center', cursor: 'pointer',
                          bgcolor: method === m.id ? 'rgba(24, 119, 242, 0.04)' : 'white',
                          transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main' }
                        }}
                      >
                        {React.cloneElement(m.icon, { color: method === m.id ? 'primary' : 'action', sx: { fontSize: 28, mb: 1 } })}
                        <Typography variant="caption" display="block" sx={{ fontWeight: 800 }}>{m.label}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </RadioGroup>

              <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: '#f8fafc' }}>
                {method === 'card' && (
                  <Stack spacing={2.5}>
                    <TextField fullWidth label="Nombre en la Tarjeta" value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="EJ. JUAN PEREZ" InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon fontSize="small" /></InputAdornment> }} />
                    <TextField fullWidth label="Número de Tarjeta" value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, ''))} inputProps={{ maxLength: 19 }} placeholder="0000 0000 0000 0000" InputProps={{ startAdornment: <InputAdornment position="start"><CreditCardIcon fontSize="small" /></InputAdornment> }} />
                    <Grid container spacing={2}>
                      <Grid item xs={6}><TextField fullWidth label="Expiración" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} placeholder="MM/AA" InputProps={{ startAdornment: <InputAdornment position="start"><EventIcon fontSize="small" /></InputAdornment> }} /></Grid>
                      <Grid item xs={6}><TextField fullWidth label="CVV" type="password" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} inputProps={{ maxLength: 4 }} placeholder="123" InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon fontSize="small" /></InputAdornment> }} /></Grid>
                    </Grid>
                  </Stack>
                )}
                {method === 'qr' && (
                  <Stack spacing={2} alignItems="center">
                    <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                      <svg width="160" height="160" viewBox="0 0 100 100"><path d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z" fill="#0f172a" /><path d="M40,0 h10 v10 h-10 z M50,10 h10 v10 h-10 z M40,20 h20 v10 h-20 z M30,40 h10 v10 h-10 z M50,40 h20 v10 h-20 z M80,40 h20 v10 h-20 z M0,50 h20 v10 h-20 z M40,60 h10 v10 h-10 z M60,60 h20 v10 h-20 z M50,70 h10 v10 h-10 z M90,70 h10 v10 h-10 z M30,80 h20 v10 h-20 z M70,80 h10 v10 h-10 z M90,80 h10 v10 h-10 z M40,90 h10 v10 h-10 z M60,90 h30 v10 h-30 z" fill="#1877F2" /></svg>
                    </Box>
                    <TextField fullWidth label="Número de Referencia del Pago" placeholder="Ej: 882312" value={referencia} onChange={(e) => setReferencia(e.target.value)} required />
                  </Stack>
                )}
                {method === 'transfer' && (
                  <Stack spacing={2}>
                    <Box sx={{ p: 2, bgcolor: '#eff6ff', borderRadius: 2, border: '1px dashed', borderColor: 'primary.main' }}>
                      <Typography variant="caption" color="primary" sx={{ fontWeight: 800 }}>BANCO GANADERO - CTA: 102-123456-99</Typography>
                    </Box>
                    <TextField fullWidth label="Número de Referencia" value={referencia} onChange={(e) => setReferencia(e.target.value)} required />
                    <Button variant="outlined" fullWidth onClick={simulateReceiptUpload} sx={{ textTransform: 'none' }}>{receiptName ? '✓ Comprobante Cargado' : 'Subir Comprobante'}</Button>
                  </Stack>
                )}
              </Box>
            </Box>
          </Fade>
        );
      default:
        return null;
    }
  };

  if (authLoading || dataLoading || !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} thickness={5} />
      </Box>
    );
  }

  if (!compra) {
    return (
      <Box sx={{ p: 10, textAlign: 'center' }}>
        <Typography variant="h5" color="text.secondary">Compra grupal no encontrada.</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <Box sx={{ mb: 4 }}>
        <Button
          component={Link}
          href={`/compras-grupales/${id}`}
          startIcon={<ArrowBackIcon />}
          sx={{ textTransform: 'none', color: 'text.secondary', fontWeight: 700 }}
        >
          Volver a detalles
        </Button>
      </Box>

      {success ? (
        <Fade in={success}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, textAlign: 'center' }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 100, mb: 3 }} />
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
              ¡Reserva y Pago Confirmado!
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Tus cupos han sido registrados en retención. Redirigiéndote...
            </Typography>
            <CircularProgress size={30} sx={{ mt: 4 }} />
          </Box>
        </Fade>
      ) : loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 10, textAlign: 'center' }}>
          <CircularProgress size={70} thickness={5} sx={{ mb: 4 }} />
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
            Procesando Pago Seguro
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Estamos registrando tu participación. Por favor no cierres la página.
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 4, color: 'text.secondary', alignItems: 'center' }}>
            <LockIcon fontSize="small" />
            <Typography variant="caption" sx={{ fontWeight: 700 }}>Sistema Escrow Activo</Typography>
          </Stack>
        </Box>
      ) : (
        <Grid container spacing={6} alignItems="flex-start">
          {/* Columna Izquierda: Formulario de Pago */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Box component="form" onSubmit={handlePay}>
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.02em', color: '#0f172a' }}>
                Completar Reserva
              </Typography>

              <Stepper activeStep={activeStep} sx={{ mb: 5, pt: 2 }}>
                {STEPS.map((label) => (
                  <Step key={label}>
                    <StepLabel sx={{ '& .MuiStepLabel-label': { fontWeight: 700, fontSize: '0.75rem' } }}>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Box sx={{ minHeight: 320, mb: 4 }}>
                {renderStepContent(activeStep)}
              </Box>

              <Stack direction="row" spacing={2}>
                {activeStep > 0 && (
                  <Button variant="outlined" fullWidth onClick={handleBack} sx={{ height: 52, borderRadius: 2 }}>
                    Anterior
                  </Button>
                )}
                {activeStep < STEPS.length - 1 ? (
                  <PrimaryButton fullWidth onClick={handleNext} disabled={!isStepValid(activeStep)} sx={{ height: 52 }}>
                    Siguiente
                  </PrimaryButton>
                ) : (
                  <PrimaryButton
                    type="submit"
                    fullWidth
                    disabled={!isStepValid(activeStep)}
                    startIcon={<LockIcon />}
                    sx={{ height: 52 }}
                  >
                    Pagar ${totalPagar.toFixed(2)} USD
                  </PrimaryButton>
                )}
              </Stack>

              <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'center', color: 'text.secondary', alignItems: 'center' }}>
                <ShieldIcon fontSize="small" color="success" />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  Tus fondos están protegidos por el Sistema Escrow.
                </Typography>
              </Stack>
            </Box>
          </Grid>

          {/* Columna Derecha: Resumen del Pedido */}
          <Grid size={{ xs: 12, md: 5 }}>
            <PremiumCard 
              sx={{ 
                p: 4, 
                height: 'auto', 
                position: { md: 'sticky' }, 
                top: 100,
                zIndex: 10
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
                Resumen de Inversión
              </Typography>

              <Stack spacing={3}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box sx={{ width: 54, height: 54, borderRadius: 3, overflow: 'hidden' }}>
                     <img src={compra.imagen_url || 'https://via.placeholder.com/150'} alt="Producto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                      {compra.titulo}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Importación Grupal Marítima
                    </Typography>
                  </Box>
                </Stack>

                <Divider />

                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Precio por cupo</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>${precioUnitario.toFixed(2)} USD</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Cantidad de cupos</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>x{cantidad}</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Total a Pagar</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: 'success.main' }}>
                      ${totalPagar.toFixed(2)} USD
                    </Typography>
                  </Box>
                </Stack>

                <Alert severity="info" sx={{ borderRadius: 2, '& .MuiAlert-message': { fontSize: '0.8rem' } }}>
                  <strong>Importante:</strong> Este pago quedará retenido (Escrow) hasta que se alcance la meta mínima de <strong>{compra.meta_minima} cupos</strong>. Si la meta no se cumple, el reembolso es automático.
                </Alert>
              </Stack>
            </PremiumCard>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
