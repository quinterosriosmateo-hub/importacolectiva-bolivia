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
  CardContent,
  Fade
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
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useApiService } from '@/hooks/useApiService';
import { Constantes } from '@/utils/constants';
import { PrimaryButton, SecondaryButton, PremiumCard } from '@/components/ui';
import Link from 'next/link';

const DEPARTMENTS = [
  'La Paz', 'Santa Cruz', 'Cochabamba', 'Oruro', 'Potosí', 'Tarija', 'Beni', 'Pando', 'Chuquisaca'
];

export default function CheckoutPage() {
  const { user, refreshSession, loading: authLoading } = useAuth();
  const { postApiService } = useApiService();
  const router = useRouter();

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

    // Simulate payment processing (like Stripe, Adyen)
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
      // Redirect back to subscription details after 2 seconds
      setTimeout(() => {
        router.push('/subscription');
      }, 2000);
    }
  };

  const simulateReceiptUpload = () => {
    setReceiptName(`COMPROBANTE_BCP_${Math.floor(100000 + Math.random() * 900000)}.pdf`);
  };

  const isFormValid = () => {
    if (!email || !phone || !address) return false;
    if (method === 'card') {
      return cardNumber.length >= 15 && cardExpiry.includes('/') && cardCvv.length >= 3 && cardName;
    }
    if (method === 'transfer') {
      return !!receiptName;
    }
    return true; // QR is simulated scanning, always valid
  };

  if (authLoading || !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} thickness={5} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <Box sx={{ mb: 4 }}>
        <Button
          component={Link}
          href="/subscription"
          startIcon={<ArrowBackIcon />}
          sx={{ textTransform: 'none', color: 'text.secondary', fontWeight: 700 }}
        >
          Volver a planes
        </Button>
      </Box>

      {success ? (
        <Fade in={success}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, textAlign: 'center' }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 100, mb: 3 }} />
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
              ¡Pago Confirmado!
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Tu suscripción se ha activado correctamente. Redirigiéndote a tu panel...
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
            Estamos conectando con los servidores bancarios. Por favor no cierres ni recargues la página.
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 4, color: 'text.secondary', alignItems: 'center' }}>
            <LockIcon fontSize="small" />
            <Typography variant="caption" sx={{ fontWeight: 700 }}>Conexión encriptada de 256 bits (SSL)</Typography>
          </Stack>
        </Box>
      ) : (
        <Grid container spacing={6}>
          {/* Columna Izquierda: Formulario de Pago */}
          <Grid item xs={12} md={7}>
            <Box component="form" onSubmit={handlePay}>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 4, letterSpacing: '-0.02em' }}>
                Pasarela de Pago Segura
              </Typography>

              {/* Información del Cliente */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
                  1. Información de contacto
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Correo Electrónico"
                      variant="outlined"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Teléfono Celular"
                      variant="outlined"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Dirección de Facturación */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
                  2. Dirección de facturación
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Departamento"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      required
                    >
                      {DEPARTMENTS.map((dept) => (
                        <MenuItem key={dept} value={dept}>
                          {dept}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="País"
                      variant="outlined"
                      value="Bolivia"
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Dirección de Domicilio / Oficina"
                      variant="outlined"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Calle 4, Edificio Los Pinos, Apto 3B"
                      required
                    />
                  </Grid>
                </Grid>
              </Box>

              {/* Métodos de Pago */}
              <Box sx={{ mb: 5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
                  3. Método de pago
                </Typography>

                <RadioGroup value={method} onChange={(e) => setMethod(e.target.value)} sx={{ mb: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Box
                        onClick={() => setMethod('card')}
                        sx={{
                          border: '2px solid',
                          borderColor: method === 'card' ? 'primary.main' : 'divider',
                          borderRadius: 3,
                          p: 2.5,
                          textAlign: 'center',
                          cursor: 'pointer',
                          bgcolor: method === 'card' ? 'rgba(24, 119, 242, 0.03)' : 'transparent',
                          transition: 'all 0.2s',
                          '&:hover': { borderColor: 'primary.main' }
                        }}
                      >
                        <CreditCardIcon color={method === 'card' ? 'primary' : 'action'} sx={{ fontSize: 32, mb: 1 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Tarjeta</Typography>
                        <Radio value="card" checked={method === 'card'} size="small" />
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Box
                        onClick={() => setMethod('qr')}
                        sx={{
                          border: '2px solid',
                          borderColor: method === 'qr' ? 'primary.main' : 'divider',
                          borderRadius: 3,
                          p: 2.5,
                          textAlign: 'center',
                          cursor: 'pointer',
                          bgcolor: method === 'qr' ? 'rgba(24, 119, 242, 0.03)' : 'transparent',
                          transition: 'all 0.2s',
                          '&:hover': { borderColor: 'primary.main' }
                        }}
                      >
                        <QrCode2Icon color={method === 'qr' ? 'primary' : 'action'} sx={{ fontSize: 32, mb: 1 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Pago QR</Typography>
                        <Radio value="qr" checked={method === 'qr'} size="small" />
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Box
                        onClick={() => setMethod('transfer')}
                        sx={{
                          border: '2px solid',
                          borderColor: method === 'transfer' ? 'primary.main' : 'divider',
                          borderRadius: 3,
                          p: 2.5,
                          textAlign: 'center',
                          cursor: 'pointer',
                          bgcolor: method === 'transfer' ? 'rgba(24, 119, 242, 0.03)' : 'transparent',
                          transition: 'all 0.2s',
                          '&:hover': { borderColor: 'primary.main' }
                        }}
                      >
                        <AccountBalanceIcon color={method === 'transfer' ? 'primary' : 'action'} sx={{ fontSize: 32, mb: 1 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Transferencia</Typography>
                        <Radio value="transfer" checked={method === 'transfer'} size="small" />
                      </Box>
                    </Grid>
                  </Grid>
                </RadioGroup>

                {/* Formulario según método */}
                <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'background.alt' }}>
                  {method === 'card' && (
                    <Stack spacing={2.5}>
                      <TextField
                        fullWidth
                        label="Nombre completo del titular"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="MARCO ANTONIO SOLIZ"
                        required
                      />
                      <TextField
                        fullWidth
                        label="Número de la tarjeta"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, ''))}
                        placeholder="4111 2222 3333 4444"
                        inputProps={{ maxLength: 19 }}
                        required
                      />
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="Expiración"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            placeholder="MM/AA"
                            inputProps={{ maxLength: 5 }}
                            required
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="CVV"
                            type="password"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            placeholder="123"
                            inputProps={{ maxLength: 4 }}
                            required
                          />
                        </Grid>
                      </Grid>
                    </Stack>
                  )}

                  {method === 'qr' && (
                    <Stack spacing={2.5} alignItems="center" sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Escanea el código QR que se muestra abajo usando tu aplicación bancaria (Simple, BCP, BNB, Banco Unión, Mercantil, etc.)
                      </Typography>
                      
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: 'white',
                          borderRadius: 4,
                          border: '1px solid',
                          borderColor: 'divider',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                          display: 'inline-flex'
                        }}
                      >
                        <svg width="200" height="200" viewBox="0 0 100 100" style={{ shapeRendering: 'crispEdges' }}>
                          <path d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z" fill="#1A1F2C" />
                          <path d="M40,0 h10 v10 h-10 z M50,10 h10 v10 h-10 z M40,20 h20 v10 h-20 z M30,40 h10 v10 h-10 z M50,40 h20 v10 h-20 z M80,40 h20 v10 h-20 z M0,50 h20 v10 h-20 z M40,60 h10 v10 h-10 z M60,60 h20 v10 h-20 z M50,70 h10 v10 h-10 z M90,70 h10 v10 h-10 z M30,80 h20 v10 h-20 z M70,80 h10 v10 h-10 z M90,80 h10 v10 h-10 z M40,90 h10 v10 h-10 z M60,90 h30 v10 h-30 z" fill="#1877F2" />
                          <rect x="38" y="38" width="24" height="24" rx="4" fill="#FFFFFF" />
                          <circle cx="50" cy="50" r="7" fill="#F7B928" />
                        </svg>
                      </Box>
                      
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        ID Pago: QR-BOL-{Math.floor(100000 + Math.random() * 900000)}
                      </Typography>
                    </Stack>
                  )}

                  {method === 'transfer' && (
                    <Stack spacing={2}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Realiza la transferencia desde tu banca móvil a los datos empresariales:
                      </Typography>
                      
                      <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                        <Grid container spacing={1.5}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>BANCO</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>Banco de Crédito (BCP)</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Nº DE CUENTA</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>301-5098234-3-12</Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>TITULAR</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>Importacolectiva Bolivia S.R.L.</Typography>
                          </Grid>
                        </Grid>
                      </Box>

                      <Box sx={{ mt: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>Sube tu comprobante (PDF/JPG)</Typography>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Button variant="outlined" color="primary" onClick={simulateReceiptUpload} sx={{ textTransform: 'none', borderRadius: 2 }}>
                            Simular Subida
                          </Button>
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            {receiptName || 'Ningún archivo cargado'}
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>
                  )}
                </Box>
              </Box>

              <PrimaryButton
                type="submit"
                fullWidth
                disabled={!isFormValid()}
                startIcon={<LockIcon />}
                sx={{ height: 52 }}
              >
                Pagar 200,00 BS
              </PrimaryButton>

              <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'center', color: 'text.secondary', alignItems: 'center' }}>
                <ShieldIcon fontSize="small" color="success" />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  Pagos cifrados SSL y conformes a PCI-DSS.
                </Typography>
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
