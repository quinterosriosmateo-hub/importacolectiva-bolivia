import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, Chip, LinearProgress,
  CircularProgress, Divider, Avatar, Tooltip, Alert, IconButton
} from '@mui/material';
import Head from 'next/head';
import Link from 'next/link';
import GroupIcon from '@mui/icons-material/Group';
import PaidIcon from '@mui/icons-material/Paid';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GavelIcon from '@mui/icons-material/Gavel';
import StorefrontIcon from '@mui/icons-material/Storefront';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ChatIcon from '@mui/icons-material/Chat';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PaymentIcon from '@mui/icons-material/Payment';
import { useApiService } from '@/hooks/useApiService';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

// 7 estados reales del ciclo de vida
const HITOS = [
  { key: 'Abierta',           label: 'Inscripción',       desc: 'Te uniste a la compra grupal',          icon: <GroupIcon /> },
  { key: 'En proceso',        label: 'En Proceso',         desc: 'Meta alcanzada, esperando pagos',         icon: <PaidIcon /> },
  { key: 'Pagada',            label: 'Pagada',             desc: 'Todos los pagos confirmados',             icon: <CheckCircleIcon /> },
  { key: 'En tránsito',       label: 'En Tránsito',       desc: 'Mercancía siendo transportada',          icon: <LocalShippingIcon /> },
  { key: 'En aduana',         label: 'En Aduana',          desc: 'Proceso aduanero en curso',               icon: <GavelIcon /> },
  { key: 'Lista para retiro', label: 'Para Retiro',        desc: 'Lista para retirar en depósito',         icon: <StorefrontIcon /> },
  { key: 'Completada',        label: 'Entregado',          desc: '¡Mercancía entregada exitosamente!',    icon: <EmojiEventsIcon /> },
];

const ACTIVE_STATES = ['Abierta', 'En proceso', 'Pagada', 'En tránsito', 'En aduana', 'Lista para retiro'];

const ESTADO_PAGO_COLORS = {
  'Pagado':         'success',
  'Parcial':        'warning',
  'Pendiente':      'error',
  'Saldo Pendiente':'warning',
  'Reembolsado':    'info',
};

function ParticipacionCard({ participacion }) {
  const compra = participacion.compra_grupal || {};
  const estadoActual = compra.estado || 'Abierta';
  const hitoIndex = HITOS.findIndex(h => h.key === estadoActual);
  const hitoActual = hitoIndex >= 0 ? hitoIndex : 0;
  const progreso = Math.min(100, Math.round((hitoActual / (HITOS.length - 1)) * 100));
  const tieneSaldoPendiente = participacion.estado_pago === 'Saldo Pendiente';
  const puedeVerChat = ['En proceso', 'Pagada', 'En tránsito', 'En aduana', 'Lista para retiro'].includes(estadoActual);

  return (
    <Card sx={{
      borderRadius: 4,
      border: '1.5px solid',
      borderColor: tieneSaldoPendiente ? 'warning.light' : 'divider',
      boxShadow: tieneSaldoPendiente ? '0 4px 16px rgba(245,158,11,0.12)' : '0 4px 16px rgba(0,0,0,0.04)',
      overflow: 'hidden',
      transition: 'all 0.2s',
      '&:hover': { boxShadow: '0 8px 30px rgba(0,0,0,0.08)', transform: 'translateY(-2px)' }
    }}>
      {/* Header con imagen y datos básicos */}
      <Box sx={{ display: 'flex', gap: 2, p: 2.5, pb: 0 }}>
        <Avatar
          src={compra.imagen_url}
          variant="rounded"
          sx={{ width: 72, height: 72, borderRadius: 3 }}
        >
          <GroupIcon />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.3 }}>
            {compra.titulo || `Compra Grupal #${participacion.compra_grupal_id}`}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
            <Chip
              label={estadoActual}
              size="small"
              color={estadoActual === 'Completada' ? 'success' : estadoActual === 'Cancelada' ? 'error' : 'default'}
              sx={{ fontWeight: 700, fontSize: '0.7rem' }}
            />
            <Chip
              label={participacion.estado_pago || 'Pendiente'}
              size="small"
              color={ESTADO_PAGO_COLORS[participacion.estado_pago] || 'default'}
              variant="outlined"
              sx={{ fontWeight: 700, fontSize: '0.7rem' }}
            />
            {participacion.es_premium && (
              <Chip label="Premium" size="small" sx={{ fontSize: '0.65rem', height: 18, bgcolor: '#f5f3ff', color: '#7c3aed', fontWeight: 800 }} />
            )}
          </Box>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="h6" sx={{ fontWeight: 900, color: 'success.main' }}>
            ${Number(participacion.monto_final || participacion.monto || 0).toLocaleString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">Mi inversión</Typography>
        </Box>
      </Box>

      <CardContent sx={{ pt: 2 }}>
        {/* Alerta de saldo pendiente */}
        {tieneSaldoPendiente && (
          <Alert
            severity="warning"
            sx={{ mb: 2, borderRadius: 2 }}
            action={
              <Button
                component={Link}
                href={`/compras-grupales/${participacion.compra_grupal_id}`}
                size="small"
                color="inherit"
                startIcon={<PaymentIcon />}
                sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
              >
                Pagar ahora
              </Button>
            }
          >
            <strong>Tienes un saldo pendiente</strong> de ${parseFloat(participacion.monto_final || 0).toFixed(2)} USD
            {participacion.monto_ajuste > 0 && ` (ajuste adicional: $${parseFloat(participacion.monto_ajuste).toFixed(2)})`}
          </Alert>
        )}

        {/* Progress bar principal */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              Progreso de la importación
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Etapa {hitoActual + 1} de {HITOS.length}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progreso}
            sx={{
              height: 10, borderRadius: 5,
              bgcolor: 'action.hover',
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
                background: 'linear-gradient(90deg, #45BD62, #00b0ff)',
              }
            }}
          />
        </Box>

        {/* Stepper compacto de 7 hitos */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          {HITOS.map((hito, idx) => (
            <Tooltip key={idx} title={hito.desc} arrow>
              <Box sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5,
                flex: 1
              }}>
                <Box sx={{
                  width: 32, height: 32, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: idx < hitoActual ? '#22c55e' : idx === hitoActual ? 'primary.main' : 'action.hover',
                  color: idx <= hitoActual ? 'white' : 'text.disabled',
                  transition: 'all 0.3s',
                  boxShadow: idx === hitoActual ? '0 0 0 3px rgba(59,130,246,0.25)' : 'none'
                }}>
                  {React.cloneElement(hito.icon, { sx: { fontSize: 15 } })}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.55rem',
                    fontWeight: idx === hitoActual ? 800 : 500,
                    color: idx < hitoActual ? 'success.main' : idx === hitoActual ? 'primary.main' : 'text.disabled',
                    textAlign: 'center',
                    lineHeight: 1.2,
                    display: { xs: 'none', sm: 'block' }
                  }}
                >
                  {hito.label}
                </Typography>
              </Box>
            </Tooltip>
          ))}
        </Box>

        {participacion.estado_aduanas && (
          <Alert
            severity={participacion.estado_aduanas === 'Entregado' ? 'success' : 'info'}
            sx={{ mt: 2, borderRadius: 3, fontSize: '0.8rem' }}
          >
            Estado en aduana: <strong>{participacion.estado_aduanas}</strong>
          </Alert>
        )}
      </CardContent>

      <Divider />
      <Box sx={{ px: 2.5, py: 1.5, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
        {puedeVerChat && (
          <Button
            component={Link}
            href={`/compras-grupales/${participacion.compra_grupal_id}#tab-chat`}
            size="small"
            startIcon={<ChatIcon />}
            sx={{ fontWeight: 700, textTransform: 'none', color: '#45BD62' }}
          >
            Chat
          </Button>
        )}
        <Button
          component={Link}
          href={`/compras-grupales/${participacion.compra_grupal_id}`}
          endIcon={<ArrowForwardIcon />}
          size="small"
          sx={{ fontWeight: 700, textTransform: 'none', ml: 'auto' }}
        >
          Ver detalles
        </Button>
      </Box>
    </Card>
  );
}

export default function MisComprasPage() {
  const { getApiService } = useApiService();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [participaciones, setParticipaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    const fetchMisCompras = async () => {
      setLoading(true);
      const data = await getApiService('/api/compras-grupales/mis-compras');
      if (data && Array.isArray(data)) setParticipaciones(data);
      setLoading(false);
    };
    fetchMisCompras();
  }, [user, authLoading, getApiService, router]);

  const activas = participaciones.filter(p => ACTIVE_STATES.includes(p.compra_grupal?.estado));
  const completadas = participaciones.filter(p => p.compra_grupal?.estado === 'Completada');
  const canceladas = participaciones.filter(p => p.compra_grupal?.estado === 'Cancelada');
  const conSaldoPendiente = participaciones.filter(p => p.estado_pago === 'Saldo Pendiente').length;
  const totalInvertido = participaciones.reduce((sum, p) => sum + Number(p.monto_final || p.monto || 0), 0);

  if (authLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={60} thickness={5} />
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>Mis Compras Grupales - Importacolectiva Bolivia</title>
      </Head>
      <Box>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: '-0.02em' }}>
            Mis Compras Grupales
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            Seguimiento de tus participaciones en importaciones mayoristas
          </Typography>
        </Box>

        {/* Resumen */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { label: 'En Curso', value: activas.length, color: 'success.main', bg: 'rgba(69,189,98,0.08)', icon: '🚀' },
            { label: 'Completadas', value: completadas.length, color: 'primary.main', bg: 'rgba(8,23,45,0.06)', icon: '✅' },
            { label: 'Total Invertido', value: `$${totalInvertido.toLocaleString()}`, color: '#8B5CF6', bg: 'rgba(139,92,246,0.08)', icon: '💰' },
          ].map(stat => (
            <Grid xs={12} sm={4} key={stat.label}>
              <Card sx={{ p: 3, borderRadius: 4, border: '1.5px solid', borderColor: 'divider', boxShadow: 'none', bgcolor: stat.bg }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: stat.color }}>
                  {stat.icon} {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mt: 0.5 }}>
                  {stat.label}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Banner de saldo pendiente */}
        {conSaldoPendiente > 0 && (
          <Alert
            severity="warning"
            sx={{ mb: 3, borderRadius: 3 }}
            action={
              <Button color="inherit" size="small" fontWeight={700} component={Link} href="/compras-grupales">
                Ver compras
              </Button>
            }
          >
            Tienes <strong>{conSaldoPendiente} compra{conSaldoPendiente > 1 ? 's' : ''}</strong> con liquidación de costos pendiente. Revisa y paga el ajuste de aduana.
          </Alert>
        )}

        {/* Participaciones */}
        {participaciones.length === 0 ? (
          <Box sx={{
            py: 10, textAlign: 'center',
            border: '2px dashed', borderColor: 'divider', borderRadius: 4
          }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.secondary', mb: 1 }}>
              Aún no participas en ninguna compra grupal
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
              Explora las compras disponibles y únete a tu primera importación mayorista.
            </Typography>
            <Button
              component={Link}
              href="/compras-grupales"
              variant="contained"
              color="success"
              size="large"
              sx={{ borderRadius: 3, fontWeight: 700, textTransform: 'none', px: 4 }}
            >
              Explorar Compras Grupales
            </Button>
          </Box>
        ) : (
          <>
            {activas.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: 'success.dark' }}>
                  🚀 En Curso ({activas.length})
                </Typography>
                <Grid container spacing={3}>
                  {activas.map(p => (
                    <Grid xs={12} md={6} key={p.id}>
                      <ParticipacionCard participacion={p} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {completadas.length > 0 && (
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: 'text.secondary' }}>
                  ✅ Completadas ({completadas.length})
                </Typography>
                <Grid container spacing={3}>
                  {completadas.map(p => (
                    <Grid xs={12} md={6} key={p.id}>
                      <ParticipacionCard participacion={p} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {canceladas.length > 0 && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: 'error.main' }}>
                  ❌ Canceladas / Reembolsadas ({canceladas.length})
                </Typography>
                <Grid container spacing={3}>
                  {canceladas.map(p => (
                    <Grid xs={12} md={6} key={p.id}>
                      <ParticipacionCard participacion={p} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </>
        )}
      </Box>
    </>
  );
}
