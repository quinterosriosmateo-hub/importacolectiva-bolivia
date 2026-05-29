import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Button, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Select, FormControl, InputLabel, FormControlLabel, Switch,
  useTheme, CircularProgress, Avatar
} from '@mui/material';
import { useRouter } from 'next/router';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SettingsIcon from '@mui/icons-material/Settings';

import { useApiService } from '@/hooks/useApiService';
import { useAuth } from '@/contexts/AuthContext';
import { Constantes } from '@/utils/constants';

export default function AdminCourses() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { getApiService, postApiService, putApiService, deleteApiService } = useApiService();
  
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentCourse, setCurrentCourse] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    imagen_url: '',
    categoria: '',
    nivel: 'Principiante',
    es_premium: false,
    orden: 1
  });

  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, courseId: null });

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    const res = await getApiService(Constantes.apiAdminCourses, { requireAuth: true });
    if (res && res.code === 0) {
      setCourses(res.courses || []);
    }
    setLoading(false);
  }, [getApiService]);

  useEffect(() => {
    if (user && user.role !== 'Administrador') {
      router.push('/dashboard');
      return;
    }
    fetchCourses();
  }, [user, router, fetchCourses]);

  const handleOpenModal = (mode, course = null) => {
    setModalMode(mode);
    if (mode === 'edit' && course) {
      setCurrentCourse(course);
      setFormData({
        titulo: course.titulo,
        descripcion: course.descripcion,
        imagen_url: course.imagen_url || '',
        categoria: course.categoria,
        nivel: course.nivel,
        es_premium: course.es_premium,
        orden: course.orden
      });
    } else {
      setCurrentCourse(null);
      setFormData({
        titulo: '', descripcion: '', imagen_url: '', categoria: '', nivel: 'Principiante', es_premium: false, orden: courses.length + 1
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => setModalOpen(false);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    const payload = { ...formData, orden: parseInt(formData.orden) || 1 };
    
    if (modalMode === 'create') {
      const res = await postApiService(Constantes.apiAdminCourses, payload, {
        requireAuth: true, successMessage: 'Curso creado'
      });
      if (res && res.code === 0) {
        handleCloseModal();
        fetchCourses();
      }
    } else {
      const res = await putApiService(`${Constantes.apiAdminCourses}/${currentCourse.id}`, payload, {
        requireAuth: true, successMessage: 'Curso actualizado'
      });
      if (res && res.code === 0) {
        handleCloseModal();
        fetchCourses();
      }
    }
  };

  const confirmDelete = (courseId) => setDeleteConfirm({ open: true, courseId });
  const closeDelete = () => setDeleteConfirm({ open: false, courseId: null });

  const handleDelete = async () => {
    const res = await deleteApiService(`${Constantes.apiAdminCourses}/${deleteConfirm.courseId}`, {
      requireAuth: true, successMessage: 'Curso eliminado'
    });
    if (res && res.code === 0) {
      closeDelete();
      fetchCourses();
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ pb: 6 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => router.push('/admin')}
        sx={{ mb: 2, color: 'text.secondary' }}
      >
        Volver al Panel Principal
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" fontWeight={800} color="primary.main">
          Gestión de Academia (Cursos)
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpenModal('create')} sx={{ borderRadius: 2 }}>
          Nuevo Curso
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'background.alt' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Orden</TableCell>
              <TableCell><strong>Curso</strong></TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Categoría / Nivel</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Acceso</TableCell>
              <TableCell><strong>Lecciones</strong></TableCell>
              <TableCell align="right"><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">No hay cursos registrados</TableCell></TableRow>
            ) : (
              courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>{course.orden}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5 }}>
                      <Avatar src={course.imagen_url} variant="rounded" sx={{ width: 40, height: 40, bgcolor: 'primary.light' }}>
                        {course.titulo.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} color="primary.main" sx={{ lineHeight: 1.2 }}>
                          {course.titulo}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 200, display: 'block' }}>
                          {course.descripcion}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={course.categoria} size="small" sx={{ mr: 0.5, height: 20, fontSize: '0.65rem' }} />
                    <Chip label={course.nivel} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                  </TableCell>
                  <TableCell>
                    <Chip label={course.es_premium ? 'Premium' : 'Gratuito'} size="small" color={course.es_premium ? 'warning' : 'success'} sx={{ fontWeight: 700, height: 20, fontSize: '0.65rem' }} />
                  </TableCell>
                  <TableCell>
                    {course.lecciones?.[0]?.count || 0} lecciones
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="info" onClick={() => router.push(`/admin/courses/${course.id}`)} title="Gestionar Lecciones">
                      <SettingsIcon />
                    </IconButton>
                    <IconButton color="primary" onClick={() => handleOpenModal('edit', course)} title="Editar Curso">
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => confirmDelete(course.id)} title="Eliminar Curso">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal Crear/Editar Curso */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>{modalMode === 'create' ? 'Crear Nuevo Curso' : 'Editar Curso'}</DialogTitle>
        <DialogContent dividers sx={{ p: 2 }}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={9}>
                  <TextField fullWidth size="small" label="Título del Curso" name="titulo" value={formData.titulo} onChange={handleChange} required />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth size="small" label="Orden" name="orden" type="number" value={formData.orden} onChange={handleChange} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth size="small" label="Descripción" name="descripcion" value={formData.descripcion} onChange={handleChange} multiline rows={3} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Categoría" name="categoria" value={formData.categoria} onChange={handleChange} required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Nivel</InputLabel>
                    <Select name="nivel" value={formData.nivel} onChange={handleChange} label="Nivel">
                      <MenuItem value="Principiante">Principiante</MenuItem>
                      <MenuItem value="Intermedio">Intermedio</MenuItem>
                      <MenuItem value="Avanzado">Avanzado</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth size="small" label="URL de la Imagen de Portada" name="imagen_url" value={formData.imagen_url} onChange={handleChange} />
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="caption" fontWeight={700} sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>PORTADA</Typography>
              <Box sx={{ 
                width: '100%', 
                aspectRatio: '1/1', 
                maxHeight: 220, // Altura máxima para evitar que el modal crezca demasiado
                borderRadius: 2, 
                overflow: 'hidden', 
                bgcolor: 'grey.100', 
                border: `1px solid ${theme.palette.divider}`, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                {formData.imagen_url ? (
                  <img src={formData.imagen_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Typography variant="caption" color="text.disabled">Sin imagen</Typography>
                )}
              </Box>
              <FormControlLabel
                sx={{ mt: 2 }}
                control={<Switch checked={formData.es_premium} onChange={handleChange} name="es_premium" color="warning" size="small" />}
                label={<Typography variant="body2" fontWeight={700}>Premium</Typography>}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button variant="contained" color="primary" onClick={handleSave} disabled={!formData.titulo || !formData.categoria}>
            Guardar Curso
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Eliminar */}
      <Dialog open={deleteConfirm.open} onClose={closeDelete}>
        <DialogTitle>Eliminar Curso</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de que deseas eliminar este curso? Esta acción eliminará también todas sus lecciones y el progreso de los usuarios asociados a él. Es irreversible.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDelete}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
