import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Avatar,
  Stack,
  Divider
} from '@mui/material';
import { useApiService } from '@/hooks/useApiService';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import LockIcon from '@mui/icons-material/Lock';
import HistoryIcon from '@mui/icons-material/History';
import MyPaginationTable from '@/components/common/MyPaginationTable';
import { PremiumCard } from '@/components/ui';

export default function AdminReportes() {
  const { user, loading: authLoading } = useAuth();
  const { getApiService, loading } = useApiService();
  const router = useRouter();

  const [data, setData] = useState({ pagos: [], stats: { totalRecaudado: 0, totalRetenido: 0, totalReembolsado: 0 } });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      const rol = user.user_metadata?.rol || user.role;
      if (rol !== 'Administrador' && rol !== 'Admin') {
        router.push('/');
      } else {
        fetchReportes();
      }
    }
  }, [user, authLoading, router]);

  const fetchReportes = async () => {
    const response = await getApiService('/api/admin/reportes');
    if (response && !response.error) {
      setData(response);
    } else {
      setError(response?.error || 'Error al cargar reportes');
    }
  };

  // Columnas para MyPaginationTable
  const columns = [
    { 
      id: 'id', 
      label: 'ID Pago', 
      render: (row) => <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>#{row.id}</Typography> 
    },
    { 
      id: 'fecha', 
      label: 'Fecha', 
      render: (row) => new Date(row.fecha).toLocaleString('es-BO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
    },
    { 
      id: 'usuario_nombre', 
      label: 'Usuario', 
      render: (row) => row.usuario?.nombre || row.usuario?.email || 'N/A' 
    },
    { 
      id: 'compra_titulo', 
      label: 'Compra Grupal', 
      render: (row) => row.compra_grupal?.titulo || 'N/A' 
    },
    { 
      id: 'metodo', 
      label: 'Método', 
      render: (row) => <Chip label={row.metodo} size="small" variant="outlined" sx={{ fontWeight: 600 }} /> 
    },
    { 
      id: 'monto', 
      label: 'Monto', 
      align: 'right',
      render: (row) => <Typography fontWeight="800" color="primary.main">${parseFloat(row.monto).toFixed(2)}</Typography> 
    },
    { 
      id: 'estado', 
      label: 'Estado', 
      render: (row) => getStatusChip(row.estado) 
    }
  ];

  const getStatusChip = (status) => {
    switch (status) {
      case 'Pagado':
        return <Chip label="Liberado / Pagado" color="success" size="small" sx={{ fontWeight: 700 }} />;
      case 'Retenido':
        return <Chip label="Retenido (Escrow)" color="warning" size="small" sx={{ fontWeight: 700 }} />;
      case 'Reembolsado':
        return <Chip label="Reembolsado" color="error" size="small" sx={{ fontWeight: 700 }} />;
      default:
        return <Chip label={status} size="small" sx={{ fontWeight: 700 }} />;
    }
  };

  if (authLoading || loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 5 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64, mr: 3, boxShadow: '0 4px 12px rgba(24, 119, 242, 0.2)' }}>
          <AdminPanelSettingsIcon fontSize="large" />
        </Avatar>
        <Box>
          <Typography variant="h3" fontWeight="900" sx={{ letterSpacing: '-0.04em' }}>
            Reportes y Movimientos
          </Typography>
          <Typography variant="body1" color="text.secondary" fontWeight={500}>
            Panel de control financiero de pagos en retención y participaciones.
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>
      )}

      {/* KPIs */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4}>
          <PremiumCard sx={{ bgcolor: 'success.main', color: 'white', border: 'none' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <AccountBalanceWalletIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 800, textTransform: 'uppercase' }}>Total Liberado</Typography>
                  <Typography variant="h4" fontWeight={900}>${data.stats.totalRecaudado.toLocaleString()}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </PremiumCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <PremiumCard sx={{ bgcolor: 'warning.main', color: 'white', border: 'none' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <LockIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 800, textTransform: 'uppercase' }}>Fondos Escrow</Typography>
                  <Typography variant="h4" fontWeight={900}>${data.stats.totalRetenido.toLocaleString()}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </PremiumCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <PremiumCard sx={{ bgcolor: 'error.main', color: 'white', border: 'none' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <HistoryIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 800, textTransform: 'uppercase' }}>Reembolsado</Typography>
                  <Typography variant="h4" fontWeight={900}>${data.stats.totalReembolsado.toLocaleString()}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </PremiumCard>
        </Grid>
      </Grid>

      {/* Tabla de Movimientos con el componente unificado */}
      <MyPaginationTable
        title="Historial de Transacciones"
        subtitle="Movimientos de caja y escrow"
        columns={columns}
        rows={data.pagos.map(p => ({
          ...p,
          usuario_nombre: p.usuario?.nombre || p.usuario?.email || '',
          compra_titulo: p.compra_grupal?.titulo || ''
        }))}
        loading={loading}
        searchPlaceholder="Buscar por usuario, compra o ID..."
        initialOrderBy="fecha"
        initialOrder="desc"
        color="primary"
      />
    </Container>
  );
}
