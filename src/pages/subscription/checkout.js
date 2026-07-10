import React, { useState, useEffect } from 'react';
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
  Stepper,
  Step,
  StepLabel,
  InputAdornment
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';
import ShieldIcon from '@mui/icons-material/Shield';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import EventIcon from '@mui/icons-material/Event';
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

const STEPS = ['Información', 'Dirección', 'Pago'];

export default function CheckoutPage() {
  const { user, refreshSession, loading: authLoading } = useAuth();
  const { postApiService } = useApiService();
  const router = useRouter();

  const [activeStep, setActiveStep] = useState(0);
  const [method, setMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Card form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // Transfer form states
  const [receiptName, setReceiptName] = useState('');

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

  const handlePay = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const res = await postApiService(
      Constantes.apiSubscription,
      {
        plan: 'Premium',
        metodoPago: method === 'qr' ? 'Pago QR' : method === 'transfer' ? 'Transferencia Bancaria' : 'Tarjeta de Crédito',
        monto: 200
      },
      {
        successMessage: '¡Pago aprobado! Tu cuenta ahora es Premium.',
        errorMessage: 'Hubo un error al validar el pago.'
      }
    );

    setLoading(false);
    if (res) {
      setSuccess(true);
      await refreshSession();
      setTimeout(() => {
        router.push('/subscription');
      }, 2000);
    }
  };

  const simulateReceiptUpload = () => {
    setReceiptName(`COMPROBANTE_BCP_${Math.floor(100000 + Math.random() * 900000)}.pdf`);
  };

  const isStepValid = (step) => {
    switch(step) {
      case 0: return !!email && !!phone;
      case 1: return !!address && !!department;
      case 2:
        if (method === 'card') return cardNumber.length >= 15 && cardExpiry.includes('/') && cardCvv.length >= 3 && !!cardName;
        if (method === 'transfer') return !!receiptName;
        return true;
      default: return false;
    }
  };

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);

  const renderStepContent = (step) => {
    switch(step) {
      case 0:
        return (
          <Fade in={activeStep === 0}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3 }}>1. Información de contacto</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}><TextField fullWidth label="Correo" value={email} onChange={(e) => setEmail(e.target.value)} required /></Grid>
                <Grid item xs={6}><TextField fullWidth label="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} required /></Grid>
              </Grid>
            </Box>
          </Fade>
        );
      case 1:
        return (
          <Fade in={activeStep === 1}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3 }}>2. Dirección</Typography>
              <TextField fullWidth label="Dirección" value={address} onChange={(e) => setAddress(e.target.value)} required sx={{ mb: 2 }} />
              <TextField fullWidth select label="Departamento" value={department} onChange={(e) => setDepartment(e.target.value)} required>
                {DEPARTMENTS.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </TextField>
            </Box>
          </Fade>
        );
      case 2:
        return (
          <Fade in={activeStep === 2}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 3 }}>3. Confirmar Método de Pago</Typography>
              <RadioGroup value={method} onChange={(e) => setMethod(e.target.value)} sx={{ mb: 4 }}>
                <Grid container spacing={2}>
                  {[ {id: 'card', label: 'Tarjeta', icon: <CreditCardIcon />}, {id: 'qr', label: 'Pago QR', icon: <QrCode2Icon />}, {id: 'transfer', label: 'Transferencia', icon: <AccountBalanceIcon />} ].map(m => (
                    <Grid item xs={4} key={m.id}>
                      <Box onClick={() => setMethod(m.id)} sx={{ border: '2px solid', borderColor: method === m.id ? 'primary.main' : 'divider', borderRadius: 3, p: 2, textAlign: 'center', cursor: 'pointer', bgcolor: method === m.id ? 'rgba(24, 119, 242, 0.04)' : 'white', transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main' } }}>
                        {React.cloneElement(m.icon, { color: method === m.id ? 'primary' : 'action', sx: { fontSize: 32, mb: 1 } })}
                        <Typography variant="caption" display="block" sx={{ fontWeight: 800 }}>{m.label}</Typography>
                        <Radio value={m.id} checked={method === m.id} size="small" />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </RadioGroup>

              <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: '#f8fafc' }}>
                {method === 'card' && (
                  <Stack spacing={2.5}>
                    <TextField fullWidth label="Titular" value={cardName} onChange={(e) => setCardName(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon fontSize="small" /></InputAdornment> }} />
                    <TextField fullWidth label="Número" value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, ''))} InputProps={{ startAdornment: <InputAdornment position="start"><CreditCardIcon fontSize="small" /></InputAdornment> }} />
                    <Grid container spacing={2}>
                      <Grid item xs={6}><TextField fullWidth label="Expiración" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><EventIcon fontSize="small" /></InputAdornment> }} /></Grid>
                      <Grid item xs={6}><TextField fullWidth label="CVV" type="password" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon fontSize="small" /></InputAdornment> }} /></Grid>
                    </Grid>
                  </Stack>
                )}
                {method === 'qr' && (
                  <Stack spacing={2} alignItems="center">
                    <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                      <svg width="160" height="160" viewBox="0 0 100 100"><path d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z" fill="#0f172a" /><path d="M40,0 h10 v10 h-10 z M50,10 h10 v10 h-10 z M40,20 h20 v10 h-20 z M30,40 h10 v10 h-10 z M50,40 h20 v10 h-20 z M80,40 h20 v10 h-20 z M0,50 h20 v10 h-20 z M40,60 h10 v10 h-10 z M60,60 h20 v10 h-20 z M50,70 h10 v10 h-10 z M90,70 h10 v10 h-10 z M30,80 h20 v10 h-20 z M70,80 h10 v10 h-10 z M90,80 h10 v10 h-10 z M40,90 h10 v10 h-10 z M60,90 h30 v10 h-30 z" fill="#1877F2" /></svg>
                    </Box>
                  </Stack>
                )}
                {method === 'transfer' && (
                  <Stack spacing={2}>
                    <Box sx={{ p: 2, bgcolor: '#eff6ff', borderRadius: 2, border: '1px dashed', borderColor: 'primary.main' }}>
                      <Typography variant="caption" color="primary" sx={{ fontWeight: 800 }}>BANCO GANADERO - CTA: 102-123456-99</Typography>
                    </Box>
                    <Button variant="outlined" fullWidth onClick={simulateReceiptUpload} sx={{ textTransform: 'none' }}>{receiptName ? '✓ Comprobante Cargado' : 'Subir Comprobante'}</Button>
                  </Stack>
                )}
              </Box>
            </Box>
          </Fade>
        );
      default: return null;
    }
  };

  if (authLoading || !user) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress size={60} thickness={5} /></Box>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <Box sx={{ mb: 4 }}><Button component={Link} href="/subscription" startIcon={<ArrowBackIcon />} sx={{ textTransform: 'none', color: 'text.secondary', fontWeight: 700 }}>Volver a planes</Button></Box>
      {success ? (
        <Box sx={{ textAlign: 'center', py: 8 }}><CheckCircleIcon color="success" sx={{ fontSize: 100 }} /><Typography variant="h3">¡Pago Confirmado!</Typography></Box>
      ) : loading ? (
        <Box sx={{ textAlign: 'center', py: 10 }}><CircularProgress size={70} /><Typography variant="h4">Procesando</Typography></Box>
      ) : (
        <Grid container spacing={6}>
          <Grid item xs={12} md={7}>
            <Box component="form" onSubmit={handlePay}>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 4 }}>Pasarela de Pago Segura</Typography>
              <Stepper activeStep={activeStep} sx={{ mb: 5 }} >{STEPS.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}</Stepper>
              <Box sx={{ minHeight: 300, mb: 4 }}>{renderStepContent(activeStep)}</Box>
              <Stack direction="row" spacing={2}>
                {activeStep > 0 && <Button variant="outlined" fullWidth onClick={handleBack} sx={{ height: 52, borderRadius: 2 }}>Anterior</Button>}
                {activeStep < STEPS.length - 1 ? <PrimaryButton fullWidth onClick={handleNext} disabled={!isStepValid(activeStep)} sx={{ height: 52 }}>Siguiente</PrimaryButton> : <PrimaryButton type="submit" fullWidth disabled={!isStepValid(activeStep)} sx={{ height: 52 }}>Pagar 200 BS</PrimaryButton>}
              </Stack>
            </Box>
          </Grid>

          {/* Columna Derecha: Resumen del Pedido */}
          <Grid item xs={12} md={5}>
            <PremiumCard sx={{ p: 4, height: 'fit-content', position: 'sticky', top: 100 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
                Resumen de Compra
              </Typography>

              <Stack spacing={3}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 54,
                      height: 54,
                      borderRadius: 3,
                      bgcolor: 'rgba(247, 185, 40, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <WorkspacePremiumIcon color="warning" sx={{ fontSize: 32 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      Suscripción Premium
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Facturación Mensual Recurrente
                    </Typography>
                  </Box>
                </Stack>

                <Divider />

                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Precio mensual</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>200,00 BS</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Impuestos (IVA 13%)</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>0,00 BS <Typography variant="caption" color="text.secondary">(Inc.)</Typography></Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Total</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>200,00 BS</Typography>
                  </Box>
                </Stack>

                <Box sx={{ p: 2, bgcolor: 'background.alt', borderRadius: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                   <RocketLaunchIcon sx={{ fontSize: 16 }} /> Beneficios inmediatos
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon color="success" sx={{ fontSize: 14 }} /> Asesorías 1-a-1 sin costo adicional.
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon color="success" sx={{ fontSize: 14 }} /> Acceso prioritario a compras grupales.
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon color="success" sx={{ fontSize: 14 }} /> Base de datos de proveedores aprobados.
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </PremiumCard>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
