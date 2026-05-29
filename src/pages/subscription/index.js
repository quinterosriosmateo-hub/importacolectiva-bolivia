import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Stack,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpIcon from '@mui/icons-material/Help';

import { useAuth } from '@/contexts/AuthContext';
import { useApiService } from '@/hooks/useApiService';
import { Constantes } from '@/utils/constants';
import { SectionTitle, PremiumCard, PrimaryButton, SecondaryButton } from '@/components/ui';
import { useRouter } from 'next/router';

const PREMIUM_BENEFITS = [
  { title: 'Asesorías Personalizadas', desc: 'Consultas directas 1-a-1 con nuestros asesores de comercio exterior.' },
  { title: 'Acceso Prioritario', desc: 'Sé el primero en unirte a las compras grupales más cotizadas.' },
  { title: 'Proveedores Exclusivos', desc: 'Acceso directo a contactos de fábricas chinas verificadas con auditoría.' },
  { title: 'Cursos Premium', desc: 'Aprende paso a paso cómo importar con videos y guías avanzadas.' },
  { title: 'Calculadoras Avanzadas', desc: 'Simulador Pro de costos arancelarios y aduanas para Bolivia.' },
  { title: 'Herramientas Avanzadas', desc: 'Descarga plantillas de contratos y plantillas de cotización.' }
];

export default function SubscriptionPage() {
  const { user, refreshSession, loading: authLoading } = useAuth();
  const { getApiService, postApiService } = useApiService();
  const router = useRouter();

  const [subscription, setSubscription] = useState(null);
  const [payments, setPayments] = useState([]);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Redirigir si el usuario no está logueado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Cargar datos de suscripción e historial
  const loadData = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);
    
    // Obtener suscripción
    const subRes = await getApiService(Constantes.apiSubscription, { requireAuth: true, errorMessage: false });
    if (subRes && subRes.subscription) {
      setSubscription(subRes.subscription);
    } else {
      setSubscription(null);
    }

    // Obtener pagos
    const payRes = await getApiService(Constantes.apiSubscriptionHistory, { requireAuth: true, errorMessage: false });
    if (payRes && payRes.history) {
      setPayments(payRes.history);
    }
    setLoadingData(false);
  }, [user, getApiService]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  if (authLoading || !user || loadingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress thickness={5} size={60} />
      </Box>
    );
  }

  // Redirige a la pasarela de pago dedicada
  const handleGoToCheckout = () => {
    router.push('/subscription/checkout');
  };

  // Procesar cancelación de renovación
  const handleCancelRenewal = async () => {
    setCancelling(true);
    const res = await postApiService(
      Constantes.apiSubscriptionCancel,
      {},
      {
        successMessage: 'Renovación automática cancelada correctamente.',
        errorMessage: 'No se pudo cancelar la renovación automática.'
      }
    );

    if (res) {
      setIsCancelOpen(false);
      await refreshSession();
      await loadData();
    }
    setCancelling(false);
  };

  const isPremiumActive = 
    subscription && 
    subscription.plan === 'Premium' && 
    (subscription.estado === 'Activa' || subscription.estado === 'Cancelada');

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <SectionTitle>Membresía Premium</SectionTitle>

      {/* DISEÑO CONDICIONAL PARA EVITAR CRAMPING VERTICAL */}
      {!isPremiumActive ? (
        /* USUARIO NO PREMIUM: Mostramos planes en la parte superior directamente */
        <Box>
          <Box sx={{ mb: 6, textAlign: 'center', maxWidth: 700, mx: 'auto' }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5, color: 'primary.main' }}>
              Impulsa tu negocio de importaciones al siguiente nivel
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Únete a nuestro club premium y obtén acceso a proveedores exclusivos de China, asesorías personalizadas con expertos y herramientas avanzadas de cálculo.
            </Typography>
          </Box>

          {/* Planes en la parte superior */}
          <Grid container spacing={4} justifyContent="center" sx={{ mb: 8 }}>
            {/* Plan Básico */}
            <Grid item xs={12} md={5}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 4, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.secondary', mb: 1 }}>
                    Plan Gratuito
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
                    <Typography variant="h3" sx={{ fontWeight: 800 }}>0 BS</Typography>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ ml: 1 }}>/ mes</Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  <Stack spacing={2} sx={{ flexGrow: 1, mb: 4 }}>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <CheckCircleIcon color="action" fontSize="small" sx={{ mt: 0.3 }} />
                      <Typography variant="body2">Acceso a compras grupales públicas</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <CheckCircleIcon color="action" fontSize="small" sx={{ mt: 0.3 }} />
                      <Typography variant="body2">Seguimiento de aduanas básico</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ opacity: 0.5 }}>
                      <HighlightOffIcon color="disabled" fontSize="small" sx={{ mt: 0.3 }} />
                      <Typography variant="body2" color="text.secondary">Acceso a proveedores exclusivos</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ opacity: 0.5 }}>
                      <HighlightOffIcon color="disabled" fontSize="small" sx={{ mt: 0.3 }} />
                      <Typography variant="body2" color="text.secondary">Asesorías 1-a-1 con profesionales</Typography>
                    </Stack>
                  </Stack>
                  <SecondaryButton fullWidth disabled>
                    Tu Plan Actual
                  </SecondaryButton>
                </CardContent>
              </Card>
            </Grid>

            {/* Plan Premium */}
            <Grid item xs={12} md={5}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 4,
                  border: '2px solid',
                  borderColor: 'primary.main',
                  position: 'relative',
                  boxShadow: '0 8px 32px rgba(24, 119, 242, 0.08)'
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    bgcolor: 'secondary.main',
                    color: 'secondary.contrastText',
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase'
                  }}
                >
                  Recomendado
                </Box>
                <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
                    Plan Premium
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
                    <Typography variant="h3" sx={{ fontWeight: 800 }}>200 BS</Typography>
                    <Typography variant="subtitle1" color="text.secondary" sx={{ ml: 1 }}>/ mes</Typography>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  <Stack spacing={2} sx={{ flexGrow: 1, mb: 4 }}>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <CheckCircleIcon color="success" fontSize="small" sx={{ mt: 0.3 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Asesorías personalizadas ilimitadas</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <CheckCircleIcon color="success" fontSize="small" sx={{ mt: 0.3 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Acceso a base de proveedores verificados</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <CheckCircleIcon color="success" fontSize="small" sx={{ mt: 0.3 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Cursos premium de importación y aduanas</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <CheckCircleIcon color="success" fontSize="small" sx={{ mt: 0.3 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Calculadora Pro y herramientas arancelarias</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      <CheckCircleIcon color="success" fontSize="small" sx={{ mt: 0.3 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Acceso y cupos prioritarios en compras grupales</Typography>
                    </Stack>
                  </Stack>
                  <PrimaryButton
                    fullWidth
                    onClick={handleGoToCheckout}
                  >
                    Adquirir Premium
                  </PrimaryButton>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Beneficios detallados en la parte inferior */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 4, textAlign: 'center' }}>
              ¿Qué incluye la Membresía Premium?
            </Typography>
            <Grid container spacing={3}>
              {PREMIUM_BENEFITS.map((b) => (
                <Grid item xs={12} sm={6} md={4} key={b.title}>
                  <Box sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%', transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' } }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon fontSize="small" color="success" /> {b.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {b.desc}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      ) : (
        /* USUARIO PREMIUM ACTIVO: Mostramos estado y facturación en la parte superior */
        <Box>
          <PremiumCard sx={{ p: 4, mb: 5, border: '2px solid', borderColor: 'primary.main' }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={8}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <WorkspacePremiumIcon color="warning" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      Membresía Premium Activa
                    </Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                      Acceso completo e ilimitado para importar desde China a Bolivia.
                    </Typography>
                  </Box>
                </Stack>

                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={6} sm={4}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CalendarMonthIcon color="action" fontSize="small" />
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>FECHA INICIO</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {subscription.fecha_inicio ? new Date(subscription.fecha_inicio).toLocaleDateString('es-BO') : 'N/A'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>

                  <Grid item xs={6} sm={4}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CalendarMonthIcon color="action" fontSize="small" />
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>FECHA FIN</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {subscription.fecha_fin ? new Date(subscription.fecha_fin).toLocaleDateString('es-BO') : 'N/A'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CreditCardIcon color="action" fontSize="small" />
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>RENOVACIÓN</Typography>
                        <Box sx={{ mt: 0.2 }}>
                          <Chip
                            label={subscription.renovacion_automatica ? 'Activa' : 'Desactivada'}
                            color={subscription.renovacion_automatica ? 'success' : 'default'}
                            size="small"
                            sx={{ fontWeight: 700 }}
                          />
                        </Box>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>

                {!subscription.renovacion_automatica && (
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'background.alt', borderRadius: 2, borderLeft: '4px solid', borderColor: 'warning.main' }}>
                    <Typography variant="body2" color="text.secondary">
                      * Has desactivado la renovación automática. Mantendrás todos tus beneficios hasta el{' '}
                      <strong>{subscription.fecha_fin ? new Date(subscription.fecha_fin).toLocaleDateString('es-BO') : 'N/A'}</strong>.
                    </Typography>
                  </Box>
                )}
              </Grid>

              <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                {subscription.renovacion_automatica && (
                  <SecondaryButton
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => setIsCancelOpen(true)}
                    disabled={cancelling}
                    sx={{ width: { xs: '100%', md: 'auto' } }}
                  >
                    Cancelar Renovación
                  </SecondaryButton>
                )}
              </Grid>
            </Grid>
          </PremiumCard>

          {/* Historial de Pagos */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <ReceiptLongIcon color="primary" /> Historial de Facturación
            </Typography>

            {payments.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center', border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 3 }}>
                <Typography variant="body1" color="text.secondary">
                  No se registran transacciones previas de facturación.
                </Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'background.alt' }}>
                      <TableCell sx={{ fontWeight: 800 }}>Fecha</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Nº de Factura</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Método</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Monto</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Estado</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Comprobante</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payments.map((p) => (
                      <TableRow key={p.id} hover>
                        <TableCell>{new Date(p.fecha).toLocaleDateString('es-BO')}</TableCell>
                        <TableCell>#ICB-INV-{p.id}</TableCell>
                        <TableCell>{p.metodo}</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>{p.monto} BS</TableCell>
                        <TableCell>
                          <Chip
                            label={p.estado}
                            color={p.estado === 'Completado' ? 'success' : 'default'}
                            size="small"
                            sx={{ fontWeight: 700, height: 20 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            color="primary"
                            sx={{ cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
                            onClick={() => alert(`Visualizando comprobante para factura #ICB-INV-${p.id}\nDetalle: Pago Suscripción Premium 200 BS.`)}
                          >
                            Descargar PDF
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>

          {/* Beneficios en formato compacto para suscriptores */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
              Tus Beneficios Activos
            </Typography>
            <Grid container spacing={3}>
              {PREMIUM_BENEFITS.map((b) => (
                <Grid item xs={12} sm={6} md={4} key={b.title}>
                  <Box sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%', bgcolor: 'background.alt' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon fontSize="small" color="success" /> {b.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {b.desc}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      )}

      {/* Modal de Cancelación de Renovación */}
      <Dialog
        open={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>¿Desactivar Renovación Automática?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Si desactivas la renovación, perderás tu acceso a los asesores de aduanas, herramientas de cotización pro y la base de proveedores certificados el día{' '}
            <strong>{subscription && new Date(subscription.fecha_fin).toLocaleDateString('es-BO')}</strong>.
            <br />
            <br />
            ¿Estás seguro de que deseas continuar?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <SecondaryButton onClick={() => setIsCancelOpen(false)} sx={{ flex: 1 }}>
            Mantener Premium
          </SecondaryButton>
          <PrimaryButton
            onClick={handleCancelRenewal}
            color="error"
            disabled={cancelling}
            sx={{ flex: 1, bgcolor: 'error.main', '&:hover': { bgcolor: 'error.dark' } }}
          >
            {cancelling ? 'Cancelando...' : 'Sí, Cancelar'}
          </PrimaryButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
