import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardMedia, CardContent, CardActions,
  Button, Chip, LinearProgress, Tooltip, CircularProgress,
  TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel,
  Avatar, AvatarGroup, Divider
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GroupIcon from '@mui/icons-material/Group';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import Link from 'next/link';
import Head from 'next/head';
import { useApiService } from '@/hooks/useApiService';
import { useAuth } from '@/contexts/AuthContext';

const ESTADO_COLORS = {
  'Abierta': 'success',
  'En proceso': 'info',
  'Completada': 'secondary',
  'Cancelada': 'error',
  'Borrador': 'default',
};

function diasRestantes(fechaCierre) {
  if (!fechaCierre) return null;
  const diff = new Date(fechaCierre) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function CompraCard({ compra }) {
  const progreso = compra.cupo_maximo > 0
    ? Math.min(100, Math.round((compra.participantes_count / compra.cupo_maximo) * 100))
    : 0;
  const dias = diasRestantes(compra.fecha_cierre);
  const cerrada = compra.estado !== 'Abierta';
  const llena = compra.participantes_count >= compra.cupo_maximo;
  const metaAlcanzada = compra.participantes_count >= compra.meta_minima;

  return (
    <Card
      sx={{
        borderRadius: 4,
        border: '1.5px solid',
        borderColor: cerrada ? 'divider' : 'success.light',
        boxShadow: cerrada ? 'none' : '0 4px 20px rgba(69,189,98,0.10)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'all 0.25s',
        opacity: cerrada ? 0.75 : 1,
        '&:hover': {
          transform: cerrada ? 'none' : 'translateY(-4px)',
          boxShadow: cerrada ? 'none' : '0 8px 32px rgba(69,189,98,0.18)',
        }
      }}
    >
      {/* Imagen */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="180"
          image={compra.imagen_url || `https://source.unsplash.com/600x300/?import,wholesale,${compra.id}`}
          alt={compra.titulo}
          sx={{ objectFit: 'cover' }}
        />
        <Box sx={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 1 }}>
          <Chip
            label={compra.estado}
            color={ESTADO_COLORS[compra.estado] || 'default'}
            size="small"
            sx={{ fontWeight: 700, fontSize: '0.7rem' }}
          />
          {metaAlcanzada && compra.estado === 'Abierta' && (
            <Tooltip title="Meta mínima alcanzada - ¡Esta compra está garantizada!">
              <Chip
                icon={<CheckCircleIcon sx={{ fontSize: '0.9rem !important' }} />}
                label="Meta ✓"
                color="warning"
                size="small"
                sx={{ fontWeight: 700, fontSize: '0.7rem' }}
              />
            </Tooltip>
          )}
        </Box>
        {cerrada && (
          <Box sx={{
            position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <LockIcon sx={{ color: 'white', fontSize: 40, opacity: 0.8 }} />
          </Box>
        )}
      </Box>

      <CardContent sx={{ flex: 1, pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.3, mb: 1 }}>
          {compra.titulo}
        </Typography>

        {compra.producto && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            📦 {compra.producto.nombre}
          </Typography>
        )}

        {/* Barra de Progreso */}
        <Box sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: progreso >= 100 ? 'success.main' : 'text.secondary' }}>
              {compra.participantes_count} de {compra.cupo_maximo} cupos
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {progreso}%
            </Typography>
          </Box>
          <Tooltip title={`Meta mínima: ${compra.meta_minima} participantes`}>
            <LinearProgress
              variant="determinate"
              value={progreso}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'action.hover',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  bgcolor: progreso >= 100 ? 'success.main' : progreso >= 50 ? 'warning.main' : 'primary.main',
                }
              }}
            />
          </Tooltip>
          {compra.meta_minima > 0 && (
            <Box
              sx={{
                position: 'relative',
                height: 0,
                mt: '-8px',
                ml: `${Math.min(99, (compra.meta_minima / compra.cupo_maximo) * 100)}%`,
              }}
            >
              <Tooltip title={`Meta mínima: ${compra.meta_minima}`}>
                <Box sx={{
                  width: 2, height: 8,
                  bgcolor: 'warning.dark',
                  display: 'inline-block',
                  borderRadius: 1,
                }} />
              </Tooltip>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Info grid */}
        <Grid container spacing={1}>
          <Grid xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <GroupIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {compra.cupo_maximo - compra.participantes_count} cupos libres
              </Typography>
            </Box>
          </Grid>
          <Grid xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarTodayIcon sx={{ fontSize: 16, color: dias <= 7 ? 'error.main' : 'text.secondary' }} />
              <Typography variant="caption" color={dias <= 7 ? 'error.main' : 'text.secondary'} fontWeight={dias <= 7 ? 700 : 400}>
                {dias !== null ? (dias === 0 ? 'Cierra hoy' : `${dias} días`) : 'Sin fecha'}
              </Typography>
            </Box>
          </Grid>
          {compra.costo_total > 0 && (
            <Grid xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocalShippingIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  Costo total estimado: <strong>${Number(compra.costo_total).toLocaleString()}</strong>
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        <Button
          component={Link}
          href={`/compras-grupales/${compra.id}`}
          fullWidth
          variant={cerrada || llena ? 'outlined' : 'contained'}
          color={cerrada || llena ? 'inherit' : 'success'}
          disabled={false}
          sx={{
            borderRadius: 3,
            fontWeight: 700,
            textTransform: 'none',
            py: 1.2,
          }}
        >
          {compra.estado === 'Completada' ? 'Ver Resultados' :
           compra.estado === 'Cancelada' ? 'Ver Detalles' :
           llena ? 'Ver Lista de Espera' :
           cerrada ? 'Ver Detalles' : '¡Unirse a esta Compra!'}
        </Button>
      </CardActions>
    </Card>
  );
}

export default function ComprasGrupalesPage() {
  const { getApiService } = useApiService();
  const { user } = useAuth();
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('Abierta');

  useEffect(() => {
    const fetchCompras = async () => {
      setLoading(true);
      const data = await getApiService('/api/compras-grupales', { requireAuth: false });
      if (data) setCompras(Array.isArray(data) ? data : []);
      setLoading(false);
    };
    fetchCompras();
  }, [getApiService]);

  const filtradas = compras.filter(c => {
    const matchSearch = !search || c.titulo?.toLowerCase().includes(search.toLowerCase());
    const matchEstado = !estadoFilter || c.estado === estadoFilter;
    return matchSearch && matchEstado;
  });

  const abiertas = compras.filter(c => c.estado === 'Abierta').length;
  const totalParticipantes = compras.reduce((sum, c) => sum + (c.participantes_count || 0), 0);

  return (
    <>
      <Head>
        <title>Compras Grupales - Importacolectiva Bolivia</title>
        <meta name="description" content="Únete a importaciones mayoristas grupales desde China. Ahorra en electrónicos, ropa, maquinaria y más." />
      </Head>
      <Box>
        {/* Hero */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #08172D 0%, #0d2444 60%, #1a3a6b 100%)',
            borderRadius: 4,
            p: { xs: 4, md: 6 },
            mb: 4,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{
            position: 'absolute', top: -40, right: -40,
            width: 200, height: 200,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.04)',
          }} />
          <Box sx={{
            position: 'absolute', bottom: -60, left: '40%',
            width: 300, height: 300,
            borderRadius: '50%',
            bgcolor: 'rgba(69,189,98,0.08)',
          }} />

          <Typography variant="overline" sx={{ color: '#45BD62', fontWeight: 700, letterSpacing: 2 }}>
            🚢 Importacolectiva Bolivia
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 900, mt: 1, mb: 2, letterSpacing: '-0.02em' }}>
            Importaciones Grupales
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', maxWidth: 600, fontWeight: 400, mb: 3 }}>
            Únete a otros importadores y compra al por mayor desde China. Comparte costos logísticos y accede a precios mayoristas reales.
          </Typography>

          {/* Stats */}
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#45BD62' }}>{abiertas}</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Compras abiertas</Typography>
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#F7B928' }}>{totalParticipantes}</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Importadores activos</Typography>
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 900, color: 'white' }}>{compras.length}</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Compras totales</Typography>
            </Box>
          </Box>
        </Box>

        {/* Filtros */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Buscar compras grupales..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            size="small"
            sx={{ flex: 1, minWidth: 220 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><SearchIcon sx={{ color: 'text.secondary' }} /></InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Estado</InputLabel>
            <Select value={estadoFilter} onChange={e => setEstadoFilter(e.target.value)} label="Estado">
              <MenuItem value="">Todas</MenuItem>
              <MenuItem value="Abierta">Abiertas</MenuItem>
              <MenuItem value="En proceso">En proceso</MenuItem>
              <MenuItem value="Completada">Completadas</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Grid de compras */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress size={60} thickness={5} />
          </Box>
        ) : filtradas.length === 0 ? (
          <Box sx={{ py: 10, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              No hay compras grupales disponibles en este momento.
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
              Pronto se publicarán nuevas oportunidades de importación grupal.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filtradas.map(compra => (
              <Grid xs={12} sm={6} md={4} key={compra.id}>
                <CompraCard compra={compra} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </>
  );
}
