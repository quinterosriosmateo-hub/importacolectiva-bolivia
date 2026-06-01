import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useApiService } from '@/hooks/useApiService';
import { useAuth } from '@/contexts/AuthContext';
import Head from 'next/head';
import GroupChatPanel from '@/components/pages/GroupChatPanel';
import CostDistributionModal from '@/components/pages/CostDistributionModal';
import {
  Box, Typography, Grid, Paper, Button, Chip,
  LinearProgress, Divider, Avatar, CircularProgress,
  List, ListItem, ListItemText, Alert, Tab, Tabs,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, FormControl, InputLabel,
  Tooltip, Badge, IconButton, Stepper, Step, StepLabel,
  StepContent
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CategoryIcon from '@mui/icons-material/Category';
import GroupIcon from '@mui/icons-material/Group';
import ChatIcon from '@mui/icons-material/Chat';
import PaymentIcon from '@mui/icons-material/Payment';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import GavelIcon from '@mui/icons-material/Gavel';
import StorefrontIcon from '@mui/icons-material/Storefront';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CancelIcon from '@mui/icons-material/Cancel';
import CalculateIcon from '@mui/icons-material/Calculate';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

// ─────────────────────────────────────────────
// Constantes de estados
// ─────────────────────────────────────────────
const ESTADOS = [
  { key: 'Abierta',            label: 'Abierta',            icon: <GroupIcon />,          color: '#22c55e', bg: '#f0fdf4' },
  { key: 'En proceso',         label: 'En Proceso',         icon: <PaymentIcon />,         color: '#3b82f6', bg: '#eff6ff' },
  { key: 'Pagada',             label: 'Pagada',             icon: <CheckCircleIcon />,     color: '#8b5cf6', bg: '#f5f3ff' },
  { key: 'En tránsito',        label: 'En Tránsito',        icon: <FlightTakeoffIcon />,   color: '#f59e0b', bg: '#fffbeb' },
  { key: 'En aduana',          label: 'En Aduana',          icon: <GavelIcon />,           color: '#ef4444', bg: '#fef2f2' },
  { key: 'Lista para retiro',  label: 'Lista para Retiro',  icon: <StorefrontIcon />,      color: '#06b6d4', bg: '#ecfeff' },
  { key: 'Completada',         label: 'Completada',         icon: <EmojiEventsIcon />,     color: '#10b981', bg: '#ecfdf5' },
];

const getEstadoInfo = (estado) =>
  ESTADOS.find(e => e.key === estado) || { label: estado, color: '#64748b', bg: '#f8fafc', icon: <InfoIcon /> };

const getEstadoChipColor = (estado) => {
  const map = {
    'Abierta': 'success',
    'Cancelada': 'error',
    'Completada': 'success',
  };
  return map[estado] || 'default';
};

// ─────────────────────────────────────────────
// Indicador de ciclo de vida visual
// ─────────────────────────────────────────────
function LifecycleTimeline({ estadoActual }) {
  const currentIndex = ESTADOS.findIndex(e => e.key === estadoActual);

  return (
    <Box>
      <Stepper orientation="vertical" activeStep={currentIndex} nonLinear>
        {ESTADOS.map((estado, idx) => {
          const isPast = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          return (
            <Step key={estado.key} completed={isPast}>
              <StepLabel
                icon={
                  <Box sx={{
                    width: 32, height: 32, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: isCurrent ? estado.color : isPast ? '#22c55e' : '#e2e8f0',
                    color: isCurrent || isPast ? 'white' : '#94a3b8',
                    transition: 'all 0.3s',
                    fontSize: 16,
                    boxShadow: isCurrent ? `0 0 0 4px ${estado.color}30` : 'none'
                  }}>
                    {React.cloneElement(estado.icon, { fontSize: 'small' })}
                  </Box>
                }
              >
                <Typography
                  variant="caption"
                  fontWeight={isCurrent ? 800 : isPast ? 600 : 400}
                  color={isCurrent ? estado.color : isPast ? 'success.main' : 'text.disabled'}
                >
                  {estado.label}
                </Typography>
              </StepLabel>
              {isCurrent && (
                <StepContent>
                  <Typography variant="caption" color="text.secondary">
                    Estado actual de la importación
                  </Typography>
                </StepContent>
              )}
            </Step>
          );
        })}
      </Stepper>
    </Box>
  );
}

// ─────────────────────────────────────────────
// Panel de participantes
// ─────────────────────────────────────────────
function ParticipantesPanel({ compraGrupalId, isAdmin }) {
  const { getApiService } = useApiService();
  const [participantes, setParticipantes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (compraGrupalId) fetchParticipantes();
  }, [compraGrupalId]);

  const fetchParticipantes = async () => {
    // requireAuth: true → envía el token JWT para que la política RLS
    // 'participante_compra_select_authenticated' permita leer todas las filas.
    const data = await getApiService(`/api/compras-grupales/${compraGrupalId}/participantes`, { requireAuth: true });
    if (data) setParticipantes(data);
    setLoading(false);
  };

  const getEstadoPagoColor = (estado) => {
    const map = {
      'Pagado': 'success', 'Parcial': 'warning', 'Pendiente': 'default',
      'Reembolsado': 'info', 'Saldo Pendiente': 'warning'
    };
    return map[estado] || 'default';
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={28} /></Box>;

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={2}>
        {participantes.length} participante{participantes.length !== 1 ? 's' : ''} inscritos
      </Typography>
      <List disablePadding>
        {participantes.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <GroupIcon sx={{ fontSize: 36, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.disabled">Aún no hay participantes</Typography>
          </Box>
        ) : participantes.map((p) => (
          <ListItem
            key={p.id}
            disablePadding
            sx={{
              py: 1.5, px: 2, mb: 0.5, borderRadius: 2,
              border: '1px solid', borderColor: 'divider',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.02)' }
            }}
          >
            <Avatar
              src={p.usuario?.avatar_url}
              sx={{ width: 36, height: 36, mr: 1.5, fontSize: '0.85rem', bgcolor: '#3b82f6' }}
            >
              {p.usuario?.nombre?.[0]?.toUpperCase() || '?'}
            </Avatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" fontWeight={700}>
                    {p.usuario?.nombre || `Participante #${p.id}`}
                  </Typography>
                  {p.es_premium && (
                    <Chip label="Premium" size="small" sx={{ fontSize: '0.65rem', height: 18, bgcolor: '#f5f3ff', color: '#7c3aed' }} />
                  )}
                </Box>
              }
              secondary={
                <Typography variant="caption" color="text.secondary">
                  Cupo {p.hito_actual || 1} · ${parseFloat(p.monto_final || p.monto || 0).toLocaleString()} USD
                </Typography>
              }
            />
            <Chip
              label={p.estado_pago || 'Pendiente'}
              color={getEstadoPagoColor(p.estado_pago)}
              size="small"
              sx={{ fontWeight: 700, fontSize: '0.7rem' }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

// Modal de pago eliminado, ahora se redirige al checkout

// ─────────────────────────────────────────────
// Página Principal
// ─────────────────────────────────────────────
export default function CompraGrupalDetalle() {
  const router = useRouter();
  const { id } = router.query;
  const { getApiService, postApiService, loading: apiLoading } = useApiService();
  const { user } = useAuth();

  const [compra, setCompra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [isParticipant, setIsParticipant] = useState(false);
  const [costModalOpen, setCostModalOpen] = useState(false);

  const isAdmin = user?.user_metadata?.rol === 'Administrador' || user?.user_metadata?.rol === 'Admin';

  const fetchCompra = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    // requireAuth: !!user → si el usuario está autenticado, envía el token
    // para que Supabase pueda devolver participante_compra sin que RLS lo bloquee.
    const data = await getApiService(`/api/compras-grupales/${id}`, { requireAuth: !!user });
    if (data) {
      setCompra(data);
      if (user && data.participante_compra) {
        const found = data.participante_compra.find(p => p.usuario_id === user.id);
        setIsParticipant(!!found);
      }
    }
    setLoading(false);
  }, [id, user]);

  useEffect(() => { fetchCompra(); }, [fetchCompra]);

  const handleJoin = async () => {
    if (!user) { router.push('/login'); return; }
    router.push(`/compras-grupales/${id}/checkout`);
  };

  const handleLeave = async () => {
    if (!window.confirm('¿Estás seguro de que quieres salir de esta compra grupal? Se procesará el reembolso si ya pagaste.')) return;
    const res = await postApiService(
      `/api/compras-grupales/${id}/leave`,
      {},
      { successMessage: 'Has salido de la compra grupal. Se procesará tu reembolso.' }
    );
    if (res) fetchCompra();
  };

  const handleStateTransition = async (nuevoEstado) => {
    if (!window.confirm(`¿Cambiar estado a "${nuevoEstado}"?`)) return;
    const res = await postApiService(
      `/api/compras-grupales/${id}/estado`,
      { estado: nuevoEstado },
      { successMessage: `Estado cambiado a "${nuevoEstado}"` },
      'PUT'
    );
    if (res) fetchCompra();
  };

  if (loading || apiLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={60} thickness={5} />
      </Box>
    );
  }

  if (!compra) {
    return (
      <Box sx={{ p: 10, textAlign: 'center' }}>
        <Typography variant="h4" color="text.secondary" fontWeight={800} mb={2}>
          Oportunidad no encontrada
        </Typography>
        <Typography variant="body1" color="text.disabled" mb={4}>
          Esta compra grupal no existe o ya no está disponible.
        </Typography>
        <Button variant="contained" onClick={() => router.push('/compras-grupales')} sx={{ borderRadius: 3, px: 4, py: 1.5, fontWeight: 700 }}>
          Volver a Compras Grupales
        </Button>
      </Box>
    );
  }

  const estadoInfo = getEstadoInfo(compra.estado);
  const progreso = compra.cupo_maximo > 0 ? (compra.participantes_count / compra.cupo_maximo) * 100 : 0;
  const llena = compra.participantes_count >= compra.cupo_maximo;
  const precioUnitario = compra.cupo_maximo > 0 ? (compra.costo_total / compra.cupo_maximo) : 0;
  const esCancelada = compra.estado === 'Cancelada';
  const esCompletada = compra.estado === 'Completada';
  const puedeUnirse = compra.estado === 'Abierta' && !llena && !isParticipant && !esCancelada;
  const participanteActual = compra.participante_compra?.find(p => p.usuario_id === user?.id);

  // Transiciones disponibles para el admin
  const NEXT_STATES = {
    'Abierta':           ['En proceso', 'Cancelada'],
    'En proceso':        ['Pagada', 'Cancelada'],
    'Pagada':            ['En tránsito'],
    'En tránsito':       ['En aduana'],
    'En aduana':         ['Lista para retiro'],
    'Lista para retiro': ['Completada'],
    'Completada':        [],
    'Cancelada':         [],
  };
  const nextStates = NEXT_STATES[compra.estado] || [];

  return (
    <>
      <Head>
        <title>{compra.titulo} - Importacolectiva Bolivia</title>
        <meta name="description" content={compra.producto?.descripcion || `Importación grupal: ${compra.titulo}`} />
      </Head>

      {/* Hero */}
      <Box sx={{
        bgcolor: estadoInfo.bg,
        borderBottom: '1px solid', borderColor: 'divider',
        pt: { xs: 4, md: 8 }, pb: { xs: 6, md: 10 }, mb: -6,
        position: 'relative', zIndex: 0,
        transition: 'background 0.4s'
      }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3 }}>
          <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <Chip
              icon={React.cloneElement(estadoInfo.icon, { style: { color: estadoInfo.color } })}
              label={estadoInfo.label.toUpperCase()}
              sx={{
                fontWeight: 800, fontSize: '0.75rem', borderRadius: 2,
                bgcolor: estadoInfo.color + '18', color: estadoInfo.color,
                border: `1px solid ${estadoInfo.color}40`
              }}
            />
            {compra.producto && (
              <Chip icon={<CategoryIcon />} label={compra.producto.nombre} variant="outlined"
                sx={{ fontWeight: 700, borderRadius: 2, bgcolor: 'white' }} />
            )}
            {isParticipant && (
              <Chip label="✓ Eres participante" sx={{ bgcolor: '#f0fdf4', color: '#16a34a', fontWeight: 800, borderRadius: 2, border: '1px solid #bbf7d0' }} />
            )}
          </Box>
          <Typography variant="h2" fontWeight={900} sx={{ letterSpacing: '-0.03em', color: '#0f172a', mb: 2, maxWidth: 800 }}>
            {compra.titulo}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, fontWeight: 400, lineHeight: 1.6 }}>
            {compra.descripcion || compra.producto?.descripcion || 'Comparte el costo de un contenedor y compra a precios directos de fábrica. Nosotros gestionamos todo el proceso logístico y aduanero.'}
          </Typography>
        </Box>
      </Box>

      {/* Admin panel */}
      {isAdmin && nextStates.length > 0 && (
        <Box sx={{ bgcolor: '#fefce8', borderBottom: '1px solid #fde68a' }}>
          <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="caption" fontWeight={800} color="warning.dark" sx={{ mr: 1 }}>
              ADMIN — Transicionar Estado:
            </Typography>
            {nextStates.map(s => {
              const si = getEstadoInfo(s);
              return (
                <Button
                  key={s}
                  size="small"
                  variant="outlined"
                  onClick={() => handleStateTransition(s)}
                  startIcon={React.cloneElement(si.icon, { style: { fontSize: 14 } })}
                  sx={{
                    borderRadius: 2, fontWeight: 700, fontSize: '0.75rem',
                    borderColor: s === 'Cancelada' ? 'error.main' : si.color,
                    color: s === 'Cancelada' ? 'error.main' : si.color,
                    '&:hover': { bgcolor: si.bg }
                  }}
                >
                  {si.label}
                </Button>
              );
            })}
            {(compra.estado === 'Pagada' || compra.estado === 'En tránsito' || compra.estado === 'En aduana') && (
              <Button
                size="small"
                variant="outlined"
                startIcon={<CalculateIcon />}
                onClick={() => setCostModalOpen(true)}
                sx={{ borderRadius: 2, fontWeight: 700, fontSize: '0.75rem', borderColor: '#8b5cf6', color: '#8b5cf6', '&:hover': { bgcolor: '#f5f3ff' } }}
              >
                Distribuir Costos
              </Button>
            )}
          </Box>
        </Box>
      )}

      {/* Main content */}
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 3 }, position: 'relative', zIndex: 1, mt: 8 }}>
        <Grid container spacing={4}>
          {/* Columna izquierda */}
          <Grid size={{ xs: 12, md: 7, lg: 8 }}>
            {/* Imagen */}
            <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden', mb: 4, border: '1px solid', borderColor: 'divider', boxShadow: '0 12px 40px rgba(0,0,0,0.06)' }}>
              <img
                src={compra.imagen_url || `https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800`}
                alt={compra.titulo}
                style={{ width: '100%', height: 'auto', maxHeight: 420, objectFit: 'cover', display: 'block' }}
              />
            </Paper>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto">
                <Tab label="Detalles" id="tab-0" />
                <Tab
                  label={
                    <Badge badgeContent={compra.participantes_count || 0} color="primary" max={999}>
                      <Box sx={{ pr: 1.5 }}>Participantes</Box>
                    </Badge>
                  }
                  id="tab-1"
                />
                <Tab
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ChatIcon fontSize="small" />
                      Chat
                    </Box>
                  }
                  id="tab-2"
                />
                <Tab label="Progreso" id="tab-3" />
              </Tabs>
            </Box>

            {/* Tab 0 — Detalles */}
            {activeTab === 0 && (
              <Box>
                <Typography variant="h5" fontWeight={800} mb={3} color="#0f172a">
                  Por qué participar en esta importación
                </Typography>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  {[
                    { icon: <CheckCircleIcon />, color: '#22c55e', bg: 'rgba(34,197,94,0.1)', title: 'Precios de Fábrica', desc: 'Al importar por volumen logramos precios hasta un 60% más bajos que el mercado local.' },
                    { icon: <LocalShippingIcon />, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', title: 'Logística Resuelta', desc: 'Nos encargamos del flete, agenciamiento y desaduanización. Solo recoges tu mercancía.' },
                    { icon: <GavelIcon />, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', title: 'Trámites Aduaneros', desc: 'Gestionamos todo el proceso con la Aduana Nacional de Bolivia por ti.' },
                    { icon: <EmojiEventsIcon />, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', title: 'Garantía de Meta', desc: `Si no se alcanzan los ${compra.meta_minima} cupos, devolvemos el 100% de tu inversión.` },
                  ].map((feat) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={feat.title}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Avatar sx={{ bgcolor: feat.bg, color: feat.color, width: 48, height: 48 }}>
                          {feat.icon}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={800}>{feat.title}</Typography>
                          <Typography variant="body2" color="text.secondary">{feat.desc}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                <Divider sx={{ my: 4 }} />
                <Typography variant="h5" fontWeight={800} mb={3} color="#0f172a">Garantía Importacolectiva</Typography>
                <Paper elevation={0} sx={{ bgcolor: 'rgba(247,185,40,0.05)', border: '1px solid rgba(247,185,40,0.2)', p: 4, borderRadius: 4 }}>
                  <Typography variant="body1">
                    Todos los proveedores son <strong>verificados in situ</strong> en China. Si la meta mínima
                    de <strong>{compra.meta_minima} cupos</strong> no se cumple, te devolvemos el 100% de tu dinero.
                    Tus fondos están protegidos por nuestro sistema de <strong>retención (Escrow)</strong> hasta que la
                    importación se concrete.
                  </Typography>
                </Paper>

                {/* Proveedor */}
                {compra.proveedor && (
                  <>
                    <Divider sx={{ my: 4 }} />
                    <Typography variant="h5" fontWeight={800} mb={2} color="#0f172a">Proveedor</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                      <Avatar sx={{ bgcolor: '#eff6ff', color: '#3b82f6', width: 48, height: 48, fontWeight: 800 }}>
                        {compra.proveedor.nombre?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={800}>{compra.proveedor.nombre}</Typography>
                        <Typography variant="body2" color="text.secondary">{compra.proveedor.pais}</Typography>
                      </Box>
                      {compra.proveedor.estado_verificacion === 'Verificado' && (
                        <Chip label="✓ Verificado" size="small" sx={{ ml: 'auto', bgcolor: '#f0fdf4', color: '#16a34a', fontWeight: 800 }} />
                      )}
                    </Box>
                  </>
                )}
              </Box>
            )}

            {/* Tab 1 — Participantes */}
            {activeTab === 1 && (
              <ParticipantesPanel compraGrupalId={id} isAdmin={isAdmin} />
            )}

            {/* Tab 2 — Chat */}
            {activeTab === 2 && (
              <GroupChatPanel
                compraGrupalId={id}
                isParticipant={isParticipant || isAdmin}
              />
            )}

            {/* Tab 3 — Progreso / Timeline */}
            {activeTab === 3 && (
              <Box>
                <Typography variant="h6" fontWeight={800} mb={3} color="#0f172a">
                  Ciclo de Vida de la Importación
                </Typography>
                <LifecycleTimeline estadoActual={compra.estado} />

                {/* Costos distribuidos si los hay */}
                {(compra.costo_logistico > 0 || compra.costo_aduana > 0) && (
                  <Box sx={{ mt: 4, p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: '#f8fafc' }}>
                    <Typography variant="subtitle2" fontWeight={800} mb={2}>Costos Adicionales Distribuidos</Typography>
                    {[
                      { label: 'Costo Logístico', value: compra.costo_logistico },
                      { label: 'Costo Aduana', value: compra.costo_aduana },
                    ].filter(r => r.value > 0).map(row => (
                      <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75 }}>
                        <Typography variant="body2" color="text.secondary">{row.label}</Typography>
                        <Typography variant="body2" fontWeight={700}>${parseFloat(row.value).toLocaleString()} USD</Typography>
                      </Box>
                    ))}
                    {participanteActual?.monto_ajuste > 0 && (
                      <>
                        <Divider sx={{ my: 1.5 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle2" fontWeight={800}>Tu ajuste:</Typography>
                          <Typography variant="subtitle2" fontWeight={900} color="warning.main">
                            +${parseFloat(participanteActual.monto_ajuste).toFixed(2)} USD
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                          <Typography variant="subtitle2" fontWeight={800}>Tu total final:</Typography>
                          <Typography variant="subtitle2" fontWeight={900} color="success.main">
                            ${parseFloat(participanteActual.monto_final || 0).toFixed(2)} USD
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </Grid>

          {/* Columna derecha — Panel de inversión */}
          <Grid size={{ xs: 12, md: 5, lg: 4 }}>
            <Paper elevation={0} sx={{
              p: { xs: 3, sm: 4 }, borderRadius: 4, position: 'sticky', top: 100,
              border: '1px solid', borderColor: 'divider',
              boxShadow: '0 20px 50px rgba(0,0,0,0.08)'
            }}>
              <Typography variant="overline" color="text.secondary" fontWeight={800} letterSpacing={1}>
                Inversión por Cupo
              </Typography>
              <Typography variant="h3" fontWeight={900} color="primary.main" mb={0.5} sx={{ letterSpacing: '-0.02em' }}>
                ${precioUnitario.toLocaleString('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                USD · {compra.precio_congelado ? '🔒 Precio congelado' : 'Estimado, puede ajustarse'}
              </Typography>

              {/* Progreso */}
              <Box sx={{ mb: 4, bgcolor: '#f8fafc', p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'center' }}>
                  <Typography variant="subtitle2" fontWeight={800} color="#0f172a">Progreso del Contenedor</Typography>
                  <Typography variant="subtitle2" color="primary.main" fontWeight={900}>{Math.round(progreso)}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(progreso, 100)}
                  sx={{
                    height: 12, borderRadius: 6, bgcolor: 'rgba(0,0,0,0.05)',
                    '& .MuiLinearProgress-bar': { borderRadius: 6, background: 'linear-gradient(90deg, #45BD62, #00b0ff)' }
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {compra.participantes_count} inscritos
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Meta: {compra.meta_minima} | Máx: {compra.cupo_maximo}
                  </Typography>
                </Box>
              </Box>

              {/* Info */}
              <List disablePadding sx={{ mb: 3 }}>
                {[
                  { label: 'Estado', value: compra.estado },
                  { label: 'Fecha de Cierre', value: compra.fecha_cierre ? new Date(compra.fecha_cierre).toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Por definir' },
                  { label: 'Cupos Disponibles', value: `${Math.max(0, compra.cupo_maximo - compra.participantes_count)} de ${compra.cupo_maximo}` },
                ].map(row => (
                  <ListItem key={row.label} disablePadding sx={{ py: 1.2, borderBottom: '1px dashed', borderColor: 'divider' }}>
                    <ListItemText primary={<Typography variant="body2" color="text.secondary">{row.label}</Typography>} />
                    <Typography variant="subtitle2" fontWeight={800}>{row.value}</Typography>
                  </ListItem>
                ))}
              </List>

              {/* Mi saldo pendiente */}
              {isParticipant && participanteActual?.estado_pago === 'Saldo Pendiente' && (
                <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                  Tienes un saldo pendiente de{' '}
                  <strong>${parseFloat(participanteActual.monto_final || 0).toFixed(2)} USD</strong>
                </Alert>
              )}

              {/* Acciones */}
              {esCancelada ? (
                <Alert severity="error" sx={{ borderRadius: 2 }}>Esta compra grupal fue cancelada.</Alert>
              ) : esCompletada ? (
                <Alert severity="success" sx={{ borderRadius: 2 }}>✅ Importación completada exitosamente.</Alert>
              ) : llena && !isParticipant ? (
                <Alert severity="warning" sx={{ borderRadius: 2 }}>Esta importación ha alcanzado su cupo máximo.</Alert>
              ) : puedeUnirse ? (
                <Button
                  fullWidth variant="contained" color="success" size="large" onClick={handleJoin}
                  sx={{
                    py: 2, fontWeight: 800, fontSize: '1.1rem', borderRadius: 3,
                    boxShadow: '0 8px 24px rgba(69,189,98,0.3)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 12px 32px rgba(69,189,98,0.4)' }
                  }}
                >
                  Reservar mi Cupo
                </Button>
              ) : isParticipant ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {(participanteActual?.estado_pago === 'Pendiente' || participanteActual?.estado_pago === 'Saldo Pendiente') && (
                    <Button
                      fullWidth variant="contained" color="success" size="large"
                      startIcon={<PaymentIcon />}
                      onClick={() => router.push(`/compras-grupales/${id}/checkout`)}
                      sx={{ py: 1.5, fontWeight: 800, borderRadius: 3, boxShadow: '0 8px 24px rgba(69,189,98,0.3)' }}
                    >
                      Registrar mi Pago
                    </Button>
                  )}
                  {compra.estado === 'Abierta' && (
                    <Button
                      fullWidth variant="outlined" color="error" size="small"
                      startIcon={<ExitToAppIcon />}
                      onClick={handleLeave}
                      sx={{ borderRadius: 3, fontWeight: 700 }}
                    >
                      Salir de la Compra
                    </Button>
                  )}
                </Box>
              ) : compra.estado !== 'Abierta' ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>Esta importación ya no acepta nuevos participantes.</Alert>
              ) : null}

              <Box sx={{ mt: 3, display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
                <InfoIcon sx={{ fontSize: 20, color: 'text.secondary', mt: 0.2 }} />
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                  Tu inversión está protegida por nuestro sistema de <strong>retención (Escrow)</strong>. Solo se libera cuando se cumple la meta.
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Modals */}


      <CostDistributionModal
        open={costModalOpen}
        onClose={() => setCostModalOpen(false)}
        compraGrupalId={id}
        participantesCount={compra.participantes_count || 0}
        onSuccess={fetchCompra}
      />
    </>
  );
}
