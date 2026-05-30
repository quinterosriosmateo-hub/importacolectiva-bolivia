import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, Chip, LinearProgress,
  CircularProgress, Divider, Stepper, Step, StepLabel, StepContent,
  Avatar, Tooltip, Alert
} from '@mui/material';
import Head from 'next/head';
import Link from 'next/link';
import GroupIcon from '@mui/icons-material/Group';
import PaidIcon from '@mui/icons-material/Paid';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useApiService } from '@/hooks/useApiService';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

const HITOS = [
  { label: 'Inscripción', desc: 'Te uniste a la compra grupal', icon: <GroupIcon /> },
  { label: 'Pago Confirmado', desc: 'Pago registrado y verificado', icon: <PaidIcon /> },
  { label: 'En Importación', desc: 'Mercancía siendo transportada', icon: <LocalShippingIcon /> },
  { label: 'En Aduana', desc: 'Proceso aduanero en curso', icon: <InventoryIcon /> },
  { label: 'Entregado', desc: '¡Mercancía entregada!', icon: <CheckCircleIcon /> },
];

const ESTADO_PAGO_COLORS = {
  'Pagado': 'success',
  'Parcial': 'warning',
  'Pendiente': 'error',
};

function ParticipacionCard({ participacion }) {
  const compra = participacion.compra_grupal || {};
  const hitoActual = participacion.hito_actual || 0;
  const progreso = Math.min(100, Math.round((hitoActual / (HITOS.length - 1)) * 100));

  return (
    <Card sx={{
      borderRadius: 4,
      border: '1.5px solid',
      borderColor: 'divider',
      boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
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
              label={compra.estado || 'En curso'}
              size="small"
              color={compra.estado === 'Abierta' ? 'success' : compra.estado === 'Completada' ? 'secondary' : 'default'}
              sx={{ fontWeight: 700, fontSize: '0.7rem' }}
            />
            <Chip
              label={participacion.estado_pago || 'Pendiente'}
              size="small"
              color={ESTADO_PAGO_COLORS[participacion.estado_pago] || 'default'}
              variant="outlined"
              sx={{ fontWeight: 700, fontSize: '0.7rem' }}
            />
          </Box>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="h6" sx={{ fontWeight: 900, color: 'success.main' }}>
            ${Number(participacion.monto || 0).toLocaleString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">Mi inversión</Typography>
        </Box>
      </Box>

      <CardContent sx={{ pt: 2 }}>
        {/* Progress bar principal */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              Progreso de la importación
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Paso {hitoActual + 1} de {HITOS.length}
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

        {/* Stepper compacto */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          {HITOS.map((hito, idx) => (
            <Tooltip key={idx} title={hito.desc} arrow>
              <Box sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5,
                flex: 1
              }}>
                <Box sx={{
                  width: 36, height: 36, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: idx <= hitoActual ? (idx === hitoActual ? 'primary.main' : 'success.main') : 'action.hover',
                  color: idx <= hitoActual ? 'white' : 'text.disabled',
                  transition: 'all 0.3s',
                  fontSize: '1.1rem',
                }}>
                  {React.cloneElement(hito.icon, { sx: { fontSize: 18 } })}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.6rem',
                    fontWeight: idx === hitoActual ? 800 : 500,
                    color: idx <= hitoActual ? (idx === hitoActual ? 'primary.main' : 'success.main') : 'text.disabled',
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
      <Box sx={{ px: 2.5, py: 1.5, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          component={Link}
          href={`/compras-grupales/${participacion.compra_grupal_id}`}
          endIcon={<ArrowForwardIcon />}
          size="small"
          sx={{ fontWeight: 700, textTransform: 'none' }}
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

  const activas = participaciones.filter(p => p.compra_grupal?.estado === 'Abierta' || p.compra_grupal?.estado === 'En proceso');
  const completadas = participaciones.filter(p => p.compra_grupal?.estado === 'Completada');
  const totalInvertido = participaciones.reduce((sum, p) => sum + Number(p.monto || 0), 0);

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
            { label: 'Participaciones Activas', value: activas.length, color: 'success.main', bg: 'rgba(69,189,98,0.08)', icon: '🟢' },
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
              <Box>
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
          </>
        )}
      </Box>
    </>
  );
}
