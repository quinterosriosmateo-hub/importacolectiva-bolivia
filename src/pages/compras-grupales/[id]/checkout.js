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
  CardContent,
  Fade,
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';
import ShieldIcon from '@mui/icons-material/Shield';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CategoryIcon from '@mui/icons-material/Category';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useApiService } from '@/hooks/useApiService';
import { Constantes } from '@/utils/constants';
import { PrimaryButton, PremiumCard } from '@/components/ui';
import Link from 'next/link';

const DEPARTMENTS = [
  'La Paz', 'Santa Cruz', 'Cochabamba', 'Oruro', 'Potosí', 'Tarija', 'Beni', 'Pando', 'Chuquisaca'
];

export default function GroupPurchaseCheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const { getApiService, postApiService } = useApiService();
  const router = useRouter();
  const { id } = router.query;

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

  const isFormValid = () => {
    if (!email || !phone || !address || cantidad < 1 || cantidad > cuposDisponibles) return false;
    if (method === 'card') {
      return cardNumber.length >= 15 && cardExpiry.includes('/') && cardCvv.length >= 3 && cardName;
    }
    if (method === 'transfer') {
      return !!receiptName && !!referencia;
    }
    return true; // QR
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
        <Grid container spacing={6}>
          {/* Columna Izquierda: Formulario de Pago */}
          <Grid item xs={12} md={7}>
            <Box component="form" onSubmit={handlePay}>
              <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.02em', color: '#0f172a' }}>
                Reserva de Cupos
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4 }}>
                Asegura tu participación en esta importación con nuestro sistema de pago retenido.
              </Typography>

              {/* Selector de Cantidad */}
              <Box sx={{ mb: 5, p: 3, border: '1px solid', borderColor: 'primary.main', borderRadius: 3, bgcolor: 'rgba(59,130,246,0.03)' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: 'primary.main' }}>
                  ¿Cuántos cupos deseas reservar?
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', bgcolor: 'white' }}>
                    <IconButton 
                      onClick={() => setCantidad(Math.max(1, cantidad - 1))} 
                      disabled={cantidad <= 1}
                      sx={{ borderRadius: 0, p: 1.5 }}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <Typography sx={{ px: 3, fontWeight: 800, fontSize: '1.2rem', minWidth: '40px', textAlign: 'center' }}>
                      {cantidad}
                    </Typography>
                    <IconButton 
                      onClick={() => setCantidad(Math.min(cuposDisponibles, cantidad + 1))} 
                      disabled={cantidad >= cuposDisponibles}
                      sx={{ borderRadius: 0, p: 1.5 }}
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Precio por cupo</Typography>
                    <Typography variant="h6" fontWeight={800}>${precioUnitario.toFixed(2)} USD</Typography>
                  </Box>
                </Box>
                {cantidad >= cuposDisponibles && (
                  <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1, fontWeight: 700 }}>
                    Has alcanzado el límite de cupos disponibles ({cuposDisponibles}).
                  </Typography>
                )}
              </Box>

              {/* Información del Cliente */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
                  1. Información de contacto
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Correo Electrónico" variant="outlined" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Teléfono Celular" variant="outlined" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </Grid>
                </Grid>
              </Box>

              {/* Dirección */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
                  2. Dirección de facturación y entrega
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth select label="Departamento" value={department} onChange={(e) => setDepartment(e.target.value)} required>
                      {DEPARTMENTS.map((dept) => <MenuItem key={dept} value={dept}>{dept}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="País" variant="outlined" value="Bolivia" disabled />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Dirección" variant="outlined" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Av. Siempre Viva 123" required />
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
                          borderRadius: 3, p: 2.5, textAlign: 'center', cursor: 'pointer',
                          bgcolor: method === 'card' ? 'rgba(24, 119, 242, 0.03)' : 'transparent',
                          transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main' }
                        }}
                      >
                        <CreditCardIcon color={method === 'card' ? 'primary' : 'action'} sx={{ fontSize: 32, mb: 1 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Tarjeta</Typography>
                        <Radio value="card" checked={method === 'card'} size="small" sx={{ display: 'none' }} />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box
                        onClick={() => setMethod('qr')}
                        sx={{
                          border: '2px solid',
                          borderColor: method === 'qr' ? 'primary.main' : 'divider',
                          borderRadius: 3, p: 2.5, textAlign: 'center', cursor: 'pointer',
                          bgcolor: method === 'qr' ? 'rgba(24, 119, 242, 0.03)' : 'transparent',
                          transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main' }
                        }}
                      >
                        <QrCode2Icon color={method === 'qr' ? 'primary' : 'action'} sx={{ fontSize: 32, mb: 1 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Pago QR</Typography>
                        <Radio value="qr" checked={method === 'qr'} size="small" sx={{ display: 'none' }} />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box
                        onClick={() => setMethod('transfer')}
                        sx={{
                          border: '2px solid',
                          borderColor: method === 'transfer' ? 'primary.main' : 'divider',
                          borderRadius: 3, p: 2.5, textAlign: 'center', cursor: 'pointer',
                          bgcolor: method === 'transfer' ? 'rgba(24, 119, 242, 0.03)' : 'transparent',
                          transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main' }
                        }}
                      >
                        <AccountBalanceIcon color={method === 'transfer' ? 'primary' : 'action'} sx={{ fontSize: 32, mb: 1 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Transferencia</Typography>
                        <Radio value="transfer" checked={method === 'transfer'} size="small" sx={{ display: 'none' }} />
                      </Box>
                    </Grid>
                  </Grid>
                </RadioGroup>

                <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: 'background.alt' }}>
                  {method === 'card' && (
                    <Stack spacing={2.5}>
                      <TextField fullWidth label="Nombre completo del titular" value={cardName} onChange={(e) => setCardName(e.target.value)} required />
                      <TextField fullWidth label="Número de la tarjeta" value={cardNumber} onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, ''))} inputProps={{ maxLength: 19 }} required />
                      <Grid container spacing={2}>
                        <Grid item xs={6}><TextField fullWidth label="Expiración" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} placeholder="MM/AA" required /></Grid>
                        <Grid item xs={6}><TextField fullWidth label="CVV" type="password" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} inputProps={{ maxLength: 4 }} required /></Grid>
                      </Grid>
                    </Stack>
                  )}

                  {method === 'qr' && (
                    <Stack spacing={2.5} alignItems="center" sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Escanea el código QR que se muestra abajo usando tu aplicación bancaria.</Typography>
                      <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 4, border: '1px solid', borderColor: 'divider', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                        <svg width="200" height="200" viewBox="0 0 100 100" style={{ shapeRendering: 'crispEdges' }}>
                          <path d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z" fill="#1A1F2C" />
                          <path d="M40,0 h10 v10 h-10 z M50,10 h10 v10 h-10 z M40,20 h20 v10 h-20 z M30,40 h10 v10 h-10 z M50,40 h20 v10 h-20 z M80,40 h20 v10 h-20 z M0,50 h20 v10 h-20 z M40,60 h10 v10 h-10 z M60,60 h20 v10 h-20 z M50,70 h10 v10 h-10 z M90,70 h10 v10 h-10 z M30,80 h20 v10 h-20 z M70,80 h10 v10 h-10 z M90,80 h10 v10 h-10 z M40,90 h10 v10 h-10 z M60,90 h30 v10 h-30 z" fill="#1877F2" />
                        </svg>
                      </Box>
                      <TextField fullWidth label="Número de Referencia" placeholder="Ej: 12345678" value={referencia} onChange={(e) => setReferencia(e.target.value)} required />
                    </Stack>
                  )}

                  {method === 'transfer' && (
                    <Stack spacing={2}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Realiza la transferencia desde tu banca móvil a los datos empresariales:</Typography>
                      <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                        <Grid container spacing={1.5}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>BANCO</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>Banco Ganadero</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>Nº DE CUENTA</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>102-123456-99</Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>TITULAR</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>Importacolectiva Bolivia S.R.L.</Typography>
                          </Grid>
                        </Grid>
                      </Box>
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>Sube tu comprobante y anota la referencia</Typography>
                        <Stack spacing={2}>
                          <TextField fullWidth label="Número de Referencia" placeholder="Ej: 12345678" value={referencia} onChange={(e) => setReferencia(e.target.value)} required />
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Button variant="outlined" color="primary" onClick={simulateReceiptUpload} sx={{ textTransform: 'none', borderRadius: 2 }}>
                              Simular Subida
                            </Button>
                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                              {receiptName || 'Ningún archivo cargado'}
                            </Typography>
                          </Stack>
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
                Pagar ${totalPagar.toFixed(2)} USD
              </PrimaryButton>

              <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'center', color: 'text.secondary', alignItems: 'center' }}>
                <ShieldIcon fontSize="small" color="success" />
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  Tus fondos están protegidos por el Sistema Escrow.
                </Typography>
              </Stack>
            </Box>
          </Grid>

          {/* Columna Derecha: Resumen del Pedido */}
          <Grid item xs={12} md={5}>
            <PremiumCard sx={{ p: 4, height: 'fit-content', position: 'sticky', top: 100 }}>
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
