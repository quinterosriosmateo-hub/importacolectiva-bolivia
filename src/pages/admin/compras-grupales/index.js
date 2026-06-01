import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApiService } from '@/hooks/useApiService';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, CircularProgress,
  Grid, LinearProgress, TextField, InputAdornment, IconButton, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import GroupIcon from '@mui/icons-material/Group';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useRouter } from 'next/router';
import { PremiumCard, PrimaryButton } from '@/components/ui';

export default function AdminComprasGrupales() {
  const { getApiService, loading } = useApiService();
  const [compras, setCompras] = useState([]);
  const router = useRouter();
  const { user } = useAuth();

  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user && user.role !== 'Administrador') {
      router.push('/dashboard');
      return;
    }
    fetchCompras();
  }, [user]);

  const fetchCompras = async () => {
    const data = await getApiService('/api/compras-grupales');
    if (data) setCompras(data);
  };

  const filteredCompras = useMemo(() => {
    return compras.filter(c => c.titulo.toLowerCase().includes(search.toLowerCase()));
  }, [compras, search]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Abierta': return 'success';
      case 'En proceso': return 'info';
      case 'Pagada': return 'secondary';
      case 'Importando': return 'warning';
      case 'Cancelada': return 'error';
      default: return 'default';
    }
  };

  const stats = {
    total: compras.length,
    abiertas: compras.filter(c => c.estado === 'Abierta').length,
    participantes: compras.reduce((acc, c) => acc + (c.participantes_count || 0), 0)
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="900" color="primary.main" sx={{ letterSpacing: '-0.02em' }}>
            Gestión de Contenedores
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Administra las importaciones grupales y el estado de los envíos colectivos.
          </Typography>
        </Box>
        <PrimaryButton 
          startIcon={<AddIcon />} 
          onClick={() => router.push('/admin/compras-grupales/crear')}
        >
          Nueva Compra Grupal
        </PrimaryButton>
      </Box>

      {/* Tarjetas de Resumen */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <PremiumCard sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ bgcolor: 'primary.light', p: 1.5, borderRadius: 3, color: 'primary.main', display: 'flex' }}>
              <LocalShippingIcon />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">TOTAL GRUPOS</Typography>
              <Typography variant="h5" fontWeight="900">{stats.total}</Typography>
            </Box>
          </PremiumCard>
        </Grid>
        <Grid item xs={12} sm={4}>
          <PremiumCard sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ bgcolor: 'success.light', p: 1.5, borderRadius: 3, color: 'success.main', display: 'flex' }}>
              <TrendingUpIcon />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">GRUPOS ABIERTOS</Typography>
              <Typography variant="h5" fontWeight="900">{stats.abiertas}</Typography>
            </Box>
          </PremiumCard>
        </Grid>
        <Grid item xs={12} sm={4}>
          <PremiumCard sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ bgcolor: 'secondary.light', p: 1.5, borderRadius: 3, color: 'secondary.main', display: 'flex' }}>
              <GroupIcon />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight="bold">TOTAL IMPORTADORES</Typography>
              <Typography variant="h5" fontWeight="900">{stats.participantes}</Typography>
            </Box>
          </PremiumCard>
        </Grid>
      </Grid>

      <Paper sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <Box sx={{ p: 2, bgcolor: 'background.paper', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <TextField
            size="small"
            placeholder="Buscar por título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>Compra Grupal</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Estado</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Progreso Cupos</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>Fecha Cierre</TableCell>
                <TableCell sx={{ fontWeight: 800 }} align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCompras.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>No se encontraron registros.</TableCell>
                </TableRow>
              ) : (
                filteredCompras.map((compra) => {
                  const progress = (compra.participantes_count / compra.cupo_maximo) * 100;
                  return (
                    <TableRow key={compra.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">{compra.titulo}</Typography>
                        <Typography variant="caption" color="text.secondary">ID: {String(compra.id || '').substring(0, 8)}...</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={compra.estado} color={getStatusColor(compra.estado)} size="small" sx={{ fontWeight: 'bold' }} />
                      </TableCell>
                      <TableCell sx={{ minWidth: 150 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ flex: 1 }}>
                            <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3 }} />
                          </Box>
                          <Typography variant="caption" fontWeight="bold">{compra.participantes_count}/{compra.cupo_maximo}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{compra.fecha_cierre || 'Sin definir'}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Button 
                          size="small" 
                          variant="contained"
                          disableElevation
                          onClick={() => router.push(`/admin/compras-grupales/${compra.id}`)}
                          sx={{ borderRadius: 2, textTransform: 'none' }}
                        >
                          Gestionar
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
}
