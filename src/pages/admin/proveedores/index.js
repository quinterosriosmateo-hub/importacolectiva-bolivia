import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApiService } from '@/hooks/useApiService';
import MyPaginationTable from '@/components/common/MyPaginationTable';
import CustomModal from '@/components/common/CustomModal';
import {
  Box, Typography, Chip, Button, TextField, Grid, FormControl, InputLabel, Select, MenuItem, IconButton, InputAdornment,
  Avatar, Divider, Tooltip, Alert, Dialog, DialogTitle, DialogContent, DialogActions
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
  const [modal, setModal] = useState({ open: false, mode: 'create', proveedor: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, proveedor: null });
  const [detailDialog, setDetailDialog] = useState({ open: false, proveedor: null });
  const router = useRouter();
  const { user } = useAuth();

  // Definición de Columnas para DataTable
  const columns = [
    {
      id: 'nombre',
      label: 'Proveedor',
      render: (prov) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }} onClick={() => setDetailDialog({ open: true, proveedor: prov })}>
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
      )
    },
    { id: 'pais', label: 'País', render: (prov) => <Typography variant="body2" fontWeight={600}>{prov.pais || '—'}</Typography> },
    {
      id: 'contacto',
      label: 'Contacto',
      render: (prov) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
          {prov.contacto && <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><PersonIcon sx={{ fontSize: 13 }} />{prov.contacto}</Typography>}
          {prov.email && <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><EmailIcon sx={{ fontSize: 13 }} />{prov.email}</Typography>}
          {prov.telefono && <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><PhoneIcon sx={{ fontSize: 13 }} />{prov.telefono}</Typography>}
        </Box>
      )
    },
    {
      id: 'estado_verificacion',
      label: 'Verificación',
      render: (prov) => (
        <Chip
          icon={prov.estado_verificacion === 'Verificado' ? <VerifiedIcon sx={{ fontSize: '1rem !important' }} /> : undefined}
          label={prov.estado_verificacion || 'Pendiente'}
          color={VERIFICACION_COLORS[prov.estado_verificacion] || 'default'}
          size="small"
          sx={{ fontWeight: 700, borderRadius: 2 }}
        />
      )
    },
    {
      id: 'actions',
      label: 'Acciones',
      align: 'right',
      sortable: false,
      render: (prov) => (
        <>
          <Tooltip title="Editar"><IconButton size="small" onClick={() => openEdit(prov)}><EditIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Eliminar"><IconButton size="small" color="error" onClick={() => setDeleteDialog({ open: true, proveedor: prov })}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
        </>
      )
    }
  ];

  const fetchProveedores = useCallback(async () => {
    const data = await getApiService('/api/proveedores');
    if (data) setProveedores(Array.isArray(data) ? data : []);
  }, [getApiService]);

  useEffect(() => {
    if (user && user.role !== 'Administrador') router.push('/dashboard');
    else fetchProveedores();
  }, [user, fetchProveedores, router]);



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

      <MyPaginationTable
        title="Listado de Fábricas y Proveedores"
        subtitle="test aver que tal"
        columns={columns}
        rows={proveedores}
        loading={loading}
        searchPlaceholder="Buscar por nombre, país, contacto..."
        initialOrderBy="nombre"
        initialOrder="asc"
        color="primary"
      />

      {/* CREATE / EDIT MODAL */}
      <CustomModal
        open={modal.open}
        onClose={closeModal}
        onConfirm={handleSave}
        title={modal.mode === 'create' ? '🏭 Registrar Nuevo Proveedor' : `Editar: ${modal.proveedor?.nombre}`}
        subtitle={modal.mode === 'create' ? 'Añada una nueva fuente de suministro al sistema' : 'Modifique la información técnica del proveedor'}
        cancelText="Cancelar"
        confirmText={loading ? 'Guardando...' : modal.mode === 'create' ? 'Registrar Proveedor' : 'Guardar Cambios'}
        confirmColor={modal.mode === 'create' ? 'primary' : 'warning'}
        disableBackdropClick={true}
      >
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={8}>
            <TextField fullWidth required variant="outlined" label="Nombre de la Empresa / Fábrica" name="nombre" value={form.nombre} onChange={handleChange} autoFocus />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth required variant="outlined">
              <InputLabel>Estado de Verificación</InputLabel>
              <Select name="estado_verificacion" value={form.estado_verificacion} label="Estado de Verificación" onChange={handleChange} sx={{ borderRadius: 2 }}>
                <MenuItem value="Pendiente">🕐 Pendiente</MenuItem>
                <MenuItem value="Verificado">✅ Verificado</MenuItem>
                <MenuItem value="Rechazado">❌ Rechazado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth variant="outlined" label="País de Origen" name="pais" value={form.pais} onChange={handleChange} placeholder="Ej. China, USA" />
          </Grid>
          <Grid item xs={12} md={8}>
            <TextField fullWidth variant="outlined" label="Sitio Web / Alibaba Link" name="website" value={form.website} onChange={handleChange}
              InputProps={{ startAdornment: <InputAdornment position="start"><LanguageIcon fontSize="small" color="action" /></InputAdornment> }} />
          </Grid>
          <Grid item xs={12} sx={{ mt: 1 }}>
            <Divider textAlign="left"><Chip label="INFORMACIÓN DE CONTACTO" size="small" sx={{ fontWeight: 800, fontSize: '0.7rem', color: 'text.secondary', bgcolor: 'rgba(0,0,0,0.04)', px: 1 }} /></Divider>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth variant="outlined" label="Nombre del Contacto" name="contacto" value={form.contacto} onChange={handleChange}
              InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon fontSize="small" color="action" /></InputAdornment> }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth variant="outlined" label="Teléfono / WhatsApp" name="telefono" value={form.telefono} onChange={handleChange}
              InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon fontSize="small" color="action" /></InputAdornment> }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField fullWidth variant="outlined" label="Email de Contacto" name="email" value={form.email} onChange={handleChange} type="email"
              InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon fontSize="small" color="action" /></InputAdornment> }} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth multiline rows={3} variant="outlined" label="Notas Internas" name="notas" value={form.notas} onChange={handleChange}
              placeholder="Ej. Tiempo de entrega 30 días, pago por transferencia, descuento por volumen..." />
          </Grid>
        </Grid>
      </CustomModal>

      {/* DETAIL DIALOG */}
      <CustomModal
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, proveedor: null })}
        title="Detalles del Proveedor"
        subtitle={detailDialog.proveedor?.nombre}
        maxWidth="sm"
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={() => setDetailDialog({ open: false, proveedor: null })}>Cerrar</Button>
            <Button variant="contained" onClick={() => { setDetailDialog({ open: false, proveedor: null }); openEdit(detailDialog.proveedor); }}>Editar</Button>
          </Box>
        }
      >
        {detailDialog.proveedor && (
          <Grid container spacing={2}>
            <Grid item xs={6}><Typography variant="caption" color="text.secondary" fontWeight={700}>PAÍS</Typography><Typography fontWeight={600}>{detailDialog.proveedor.pais || '—'}</Typography></Grid>
            <Grid item xs={6}><Typography variant="caption" color="text.secondary" fontWeight={700}>CONTACTO</Typography><Typography fontWeight={600}>{detailDialog.proveedor.contacto || '—'}</Typography></Grid>
            <Grid item xs={6}><Typography variant="caption" color="text.secondary" fontWeight={700}>TELÉFONO</Typography><Typography fontWeight={600}>{detailDialog.proveedor.telefono || '—'}</Typography></Grid>
            <Grid item xs={6}><Typography variant="caption" color="text.secondary" fontWeight={700}>EMAIL</Typography><Typography fontWeight={600}>{detailDialog.proveedor.email || '—'}</Typography></Grid>
            {detailDialog.proveedor.notas && (
              <Grid item xs={12} sx={{ mt: 1 }}>
                <Alert severity="info" sx={{ borderRadius: 2 }}>{detailDialog.proveedor.notas}</Alert>
              </Grid>
            )}
          </Grid>
        )}
      </CustomModal>

      {/* DELETE CONFIRM DIALOG */}
      <CustomModal
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, proveedor: null })}
        title="⚠️ ¿Eliminar Proveedor?"
        actions={
          <>
            <Button onClick={() => setDeleteDialog({ open: false, proveedor: null })}>Cancelar</Button>
            <Button variant="contained" color="error" onClick={handleDelete} disabled={loading}>Eliminar Definitivamente</Button>
          </>
        }
      >
        <Typography>Estás por eliminar a <strong>{deleteDialog.proveedor?.nombre}</strong>. Esta acción es irreversible.</Typography>
      </CustomModal>
    </Box>
  );
}
