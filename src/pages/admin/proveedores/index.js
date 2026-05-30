import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApiService } from '@/hooks/useApiService';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, CircularProgress, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid,
  FormControl, InputLabel, Select, MenuItem, IconButton, InputAdornment,
  Avatar, Divider, Tooltip, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import LanguageIcon from '@mui/icons-material/Language';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import VerifiedIcon from '@mui/icons-material/Verified';
import StoreIcon from '@mui/icons-material/Store';
import { useRouter } from 'next/router';

const EMPTY_FORM = {
  nombre: '', pais: 'China', estado_verificacion: 'Pendiente',
  contacto: '', email: '', telefono: '', website: '', notas: ''
};

const VERIFICACION_COLORS = { Verificado: 'success', Pendiente: 'warning', Rechazado: 'error' };

export default function AdminProveedores() {
  const { getApiService, postApiService, putApiService, deleteApiService, loading } = useApiService();
  const [proveedores, setProveedores] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ open: false, mode: 'create', proveedor: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, proveedor: null });
  const [detailDialog, setDetailDialog] = useState({ open: false, proveedor: null });
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.role !== 'Administrador') {
      router.push('/dashboard');
      return;
    }
    fetchProveedores();
  }, [user]);

  const fetchProveedores = useCallback(async () => {
    const data = await getApiService('/api/proveedores');
    if (data) setProveedores(Array.isArray(data) ? data : []);
  }, [getApiService]);

  useEffect(() => { fetchProveedores(); }, [fetchProveedores]);

  const filtered = proveedores.filter(p =>
    !search || p.nombre?.toLowerCase().includes(search.toLowerCase()) || p.pais?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setModal({ open: true, mode: 'create', proveedor: null });
  };

  const openEdit = (prov) => {
    setForm({
      nombre: prov.nombre || '', pais: prov.pais || 'China',
      estado_verificacion: prov.estado_verificacion || 'Pendiente',
      contacto: prov.contacto || '', email: prov.email || '',
      telefono: prov.telefono || '', website: prov.website || '', notas: prov.notas || ''
    });
    setModal({ open: true, mode: 'edit', proveedor: prov });
  };

  const closeModal = () => setModal({ open: false, mode: 'create', proveedor: null });

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (modal.mode === 'create') {
      const res = await postApiService('/api/proveedores', form, { successMessage: `Proveedor "${form.nombre}" registrado exitosamente` });
      if (res) { fetchProveedores(); closeModal(); }
    } else {
      const res = await putApiService(`/api/proveedores/${modal.proveedor.id}`, form, { successMessage: 'Proveedor actualizado exitosamente' });
      if (res) { fetchProveedores(); closeModal(); }
    }
  };

  const handleDelete = async () => {
    const { proveedor } = deleteDialog;
    if (!proveedor) return;
    const res = await deleteApiService(`/api/proveedores/${proveedor.id}`, { successMessage: 'Proveedor eliminado' });
    if (res !== undefined) { fetchProveedores(); setDeleteDialog({ open: false, proveedor: null }); }
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={900} color="primary.main">Directorio de Proveedores</Typography>
          <Typography variant="body2" color="text.secondary">{proveedores.length} proveedores registrados en total</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} sx={{ borderRadius: 3, fontWeight: 700, px: 3 }}>
          Nuevo Proveedor
        </Button>
      </Box>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid rgba(0,0,0,0.06)' }}>
        <TextField
          fullWidth size="small"
          placeholder="Buscar por nombre de empresa o país..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.secondary' }} /></InputAdornment> }}
          sx={{ bgcolor: 'background.default', borderRadius: 2 }}
        />
      </Paper>

      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 4, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 6px 18px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ py: 10, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
        ) : (
          <Table>
            <TableHead sx={{ bgcolor: 'primary.main' }}>
              <TableRow>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Proveedor</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>País</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Contacto</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }}>Verificación</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700 }} align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                    <StoreIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography color="text.secondary" fontWeight={600}>No hay proveedores registrados.</Typography>
                    <Button onClick={openCreate} sx={{ mt: 2 }} variant="outlined">Registrar el primero</Button>
                  </TableCell>
                </TableRow>
              ) : filtered.map(prov => (
                <TableRow key={prov.id} hover sx={{ cursor: 'pointer' }}>
                  <TableCell onClick={() => setDetailDialog({ open: true, proveedor: prov })}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'rgba(8,23,45,0.08)', color: 'primary.main', fontWeight: 800 }}>
                        {prov.nombre?.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={800}>{prov.nombre}</Typography>
                        {prov.website && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <LanguageIcon sx={{ fontSize: 12 }} />{prov.website}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{prov.pais || '—'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                      {prov.contacto && <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><PersonIcon sx={{ fontSize: 13 }} />{prov.contacto}</Typography>}
                      {prov.email && <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><EmailIcon sx={{ fontSize: 13 }} />{prov.email}</Typography>}
                      {prov.telefono && <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><PhoneIcon sx={{ fontSize: 13 }} />{prov.telefono}</Typography>}
                      {!prov.contacto && !prov.email && !prov.telefono && <Typography variant="caption" color="text.disabled">Sin contacto</Typography>}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={prov.estado_verificacion === 'Verificado' ? <VerifiedIcon sx={{ fontSize: '1rem !important' }} /> : undefined}
                      label={prov.estado_verificacion || 'Pendiente'}
                      color={VERIFICACION_COLORS[prov.estado_verificacion] || 'default'}
                      size="small"
                      sx={{ fontWeight: 700, borderRadius: 2 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar"><IconButton size="small" onClick={() => openEdit(prov)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Eliminar"><IconButton size="small" color="error" onClick={() => setDeleteDialog({ open: true, proveedor: prov })}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* CREATE / EDIT MODAL */}
      <Dialog open={modal.open} onClose={closeModal} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 900, pb: 0 }}>
          {modal.mode === 'create' ? '🏭 Registrar Nuevo Proveedor' : `✏️ Editar: ${modal.proveedor?.nombre}`}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth required label="Nombre de la Empresa / Fábrica" name="nombre" value={form.nombre} onChange={handleChange} autoFocus />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="País de Origen" name="pais" value={form.pais} onChange={handleChange} placeholder="Ej. China, USA" />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Estado de Verificación</InputLabel>
                <Select name="estado_verificacion" value={form.estado_verificacion} label="Estado de Verificación" onChange={handleChange}>
                  <MenuItem value="Pendiente">🕐 Pendiente</MenuItem>
                  <MenuItem value="Verificado">✅ Verificado</MenuItem>
                  <MenuItem value="Rechazado">❌ Rechazado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}><Divider><Typography variant="caption" color="text.secondary" fontWeight={700}>CONTACTO</Typography></Divider></Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Nombre del Contacto" name="contacto" value={form.contacto} onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon fontSize="small" color="action" /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Teléfono / WhatsApp" name="telefono" value={form.telefono} onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon fontSize="small" color="action" /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Email de Contacto" name="email" value={form.email} onChange={handleChange} type="email"
                InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon fontSize="small" color="action" /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Sitio Web / Alibaba Link" name="website" value={form.website} onChange={handleChange}
                InputProps={{ startAdornment: <InputAdornment position="start"><LanguageIcon fontSize="small" color="action" /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={3} label="Notas Internas" name="notas" value={form.notas} onChange={handleChange}
                placeholder="Ej. Tiempo de entrega 30 días, pago por transferencia, descuento por volumen..." />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1, gap: 1 }}>
          <Button onClick={closeModal} sx={{ borderRadius: 2 }}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.nombre || loading} sx={{ borderRadius: 2, fontWeight: 700, px: 4 }}>
            {loading ? 'Guardando...' : modal.mode === 'create' ? 'Registrar Proveedor' : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DETAIL DIALOG */}
      <Dialog open={detailDialog.open} onClose={() => setDetailDialog({ open: false, proveedor: null })} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        {detailDialog.proveedor && (
          <>
            <DialogTitle sx={{ fontWeight: 900 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', color: 'white', width: 48, height: 48, fontWeight: 900, fontSize: '1.4rem' }}>
                  {detailDialog.proveedor.nombre?.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography fontWeight={900}>{detailDialog.proveedor.nombre}</Typography>
                  <Chip label={detailDialog.proveedor.estado_verificacion || 'Pendiente'} size="small"
                    color={VERIFICACION_COLORS[detailDialog.proveedor.estado_verificacion] || 'default'}
                    sx={{ fontWeight: 700, mt: 0.5, borderRadius: 2 }} />
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary" fontWeight={700}>PAÍS</Typography><Typography fontWeight={600}>{detailDialog.proveedor.pais || '—'}</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary" fontWeight={700}>CONTACTO</Typography><Typography fontWeight={600}>{detailDialog.proveedor.contacto || '—'}</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary" fontWeight={700}>TELÉFONO</Typography><Typography fontWeight={600}>{detailDialog.proveedor.telefono || '—'}</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary" fontWeight={700}>EMAIL</Typography><Typography fontWeight={600}>{detailDialog.proveedor.email || '—'}</Typography></Grid>
                <Grid item xs={12}><Typography variant="caption" color="text.secondary" fontWeight={700}>WEBSITE</Typography><Typography fontWeight={600}>{detailDialog.proveedor.website || '—'}</Typography></Grid>
                {detailDialog.proveedor.notas && (
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                      <Typography variant="caption" fontWeight={700} display="block">NOTAS INTERNAS</Typography>
                      {detailDialog.proveedor.notas}
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2, gap: 1 }}>
              <Button onClick={() => setDetailDialog({ open: false, proveedor: null })} sx={{ borderRadius: 2 }}>Cerrar</Button>
              <Button variant="contained" onClick={() => { setDetailDialog({ open: false, proveedor: null }); openEdit(detailDialog.proveedor); }} sx={{ borderRadius: 2, fontWeight: 700 }}>
                Editar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* DELETE CONFIRM DIALOG */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, proveedor: null })} PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle fontWeight={900}>⚠️ ¿Eliminar Proveedor?</DialogTitle>
        <DialogContent>
          <Typography>
            Estás por eliminar a <strong>{deleteDialog.proveedor?.nombre}</strong>. Esta acción puede afectar a las Compras Grupales vinculadas a este proveedor.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setDeleteDialog({ open: false, proveedor: null })} sx={{ borderRadius: 2 }}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDelete} disabled={loading} sx={{ borderRadius: 2, fontWeight: 700 }}>
            Eliminar Definitivamente
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
