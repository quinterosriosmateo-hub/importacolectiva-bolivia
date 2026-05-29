import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Button, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Select, FormControl, InputLabel, useTheme, CircularProgress,
  Chip
} from '@mui/material';
import { useRouter } from 'next/router';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useApiService } from '@/hooks/useApiService';
import { useAuth } from '@/contexts/AuthContext';
import { Constantes } from '@/utils/constants';

export default function AdminLessons() {
  const theme = useTheme();
  const router = useRouter();
  const { id: courseId } = router.query;
  const { user } = useAuth();
  const { getApiService, postApiService, putApiService, deleteApiService } = useApiService();
  
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentLesson, setCurrentLesson] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    video_url: '',
    duracion_min: 0,
    orden: 1,
    tipo: 'video',
    recurso_descargable_url: ''
  });

  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, lessonId: null });

  const fetchData = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    
    // Fetch course details
    const courseRes = await getApiService(`${Constantes.apiCourses}/${courseId}`, { requireAuth: true, errorMessage: false });
    if (courseRes && courseRes.course) {
      setCourse(courseRes.course);
    }

    // Fetch lessons for admin
    const lessonsRes = await getApiService(`${Constantes.apiAdminCourses}/${courseId}/lessons`, { requireAuth: true });
    if (lessonsRes && lessonsRes.code === 0) {
      setLessons(lessonsRes.lessons || []);
    }
    
    setLoading(false);
  }, [getApiService, courseId]);

  useEffect(() => {
    if (user && user.role !== 'Administrador') {
      router.push('/dashboard');
      return;
    }
    fetchData();
  }, [user, router, fetchData]);

  const handleOpenModal = (mode, lesson = null) => {
    setModalMode(mode);
    if (mode === 'edit' && lesson) {
      setCurrentLesson(lesson);
      setFormData({
        titulo: lesson.titulo,
        descripcion: lesson.descripcion || '',
        video_url: lesson.video_url || '',
        duracion_min: lesson.duracion_min || 0,
        orden: lesson.orden,
        tipo: lesson.tipo || 'video',
        recurso_descargable_url: lesson.recurso_descargable_url || ''
      });
    } else {
      setCurrentLesson(null);
      setFormData({
        titulo: '', descripcion: '', video_url: '', duracion_min: 0, 
        orden: lessons.length + 1, tipo: 'video', recurso_descargable_url: ''
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => setModalOpen(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const payload = { 
      ...formData, 
      orden: parseInt(formData.orden) || 1,
      duracion_min: parseInt(formData.duracion_min) || 0
    };
    
    if (modalMode === 'create') {
      const res = await postApiService(`${Constantes.apiAdminCourses}/${courseId}/lessons`, payload, {
        requireAuth: true, successMessage: 'Lección creada'
      });
      if (res && res.code === 0) {
        handleCloseModal();
        fetchData();
      }
    } else {
      const res = await putApiService(`${Constantes.apiAdminLessons}/${currentLesson.id}`, payload, {
        requireAuth: true, successMessage: 'Lección actualizada'
      });
      if (res && res.code === 0) {
        handleCloseModal();
        fetchData();
      }
    }
  };

  const confirmDelete = (lessonId) => setDeleteConfirm({ open: true, lessonId });
  const closeDelete = () => setDeleteConfirm({ open: false, lessonId: null });

  const handleDelete = async () => {
    const res = await deleteApiService(`${Constantes.apiAdminLessons}/${deleteConfirm.lessonId}`, {
      requireAuth: true, successMessage: 'Lección eliminada'
    });
    if (res && res.code === 0) {
      closeDelete();
      fetchData();
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ pb: 6 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => router.push('/admin/courses')}
        sx={{ mb: 2, color: 'text.secondary' }}
      >
        Volver a Gestión de Cursos
      </Button>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight={800} color="primary.main">
          Gestión de Lecciones
        </Typography>
        {course && (
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Curso: {course.titulo}
          </Typography>
        )}
      </Box>

      <Card sx={{ p: 2, mb: 3, borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="subtitle1" fontWeight={700}>
          Total de lecciones: {lessons.length}
        </Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpenModal('create')} size="small" sx={{ borderRadius: 2 }}>
          Nueva Lección
        </Button>
      </Card>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'background.alt' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Orden</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Título</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Duración</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Video URL</TableCell>
              <TableCell align="right"><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lessons.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">No hay lecciones en este curso</TableCell></TableRow>
            ) : (
              lessons.map((lesson) => (
                <TableRow key={lesson.id}>
                  <TableCell>{lesson.orden}</TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={700}>{lesson.titulo}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={lesson.tipo} size="small" color={lesson.tipo === 'video' ? 'error' : 'info'} sx={{ height: 20, fontSize: '0.65rem' }} />
                  </TableCell>
                  <TableCell>{lesson.duracion_min} min</TableCell>
                  <TableCell>
                    <Typography variant="caption" noWrap sx={{ maxWidth: 150, display: 'block', color: 'info.main', textDecoration: 'underline' }}>
                      {lesson.video_url || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleOpenModal('edit', lesson)} title="Editar">
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => confirmDelete(lesson.id)} title="Eliminar">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal Crear/Editar Lección */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, py: 2 }}>{modalMode === 'create' ? 'Crear Nueva Lección' : 'Editar Lección'}</DialogTitle>
        <DialogContent dividers sx={{ p: 2 }}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={7}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={9}>
                  <TextField fullWidth size="small" label="Título de la Lección" name="titulo" value={formData.titulo} onChange={handleChange} required />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField fullWidth size="small" label="Orden" name="orden" type="number" value={formData.orden} onChange={handleChange} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth size="small" label="Descripción" name="descripcion" value={formData.descripcion} onChange={handleChange} multiline rows={2} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Tipo de Contenido</InputLabel>
                    <Select name="tipo" value={formData.tipo} onChange={handleChange} label="Tipo de Contenido">
                      <MenuItem value="video">Video (YouTube)</MenuItem>
                      <MenuItem value="documento">Documento / Lectura</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth size="small" label="Duración (minutos)" name="duracion_min" type="number" value={formData.duracion_min} onChange={handleChange} />
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    size="small" 
                    label={formData.tipo === 'video' ? "URL de YouTube" : "URL del Documento"} 
                    name={formData.tipo === 'video' ? "video_url" : "recurso_descargable_url"} 
                    value={formData.tipo === 'video' ? formData.video_url : formData.recurso_descargable_url} 
                    onChange={handleChange} 
                  />
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12} md={5}>
              <Typography variant="caption" fontWeight={700} sx={{ mb: 1, display: 'block', color: 'text.secondary', textTransform: 'uppercase' }}>
                Vista Previa del Contenido
              </Typography>
              <Box sx={{ 
                width: '100%', 
                aspectRatio: '16/9', 
                maxHeight: 220, // Altura máxima para videos
                bgcolor: 'black', 
                borderRadius: 2, 
                overflow: 'hidden', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                border: `1px solid ${theme.palette.divider}` 
              }}>
                {formData.tipo === 'video' && formData.video_url ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={formData.video_url.replace('watch?v=', 'embed/')}
                    title="Preview"
                    frameBorder="0"
                    allowFullScreen
                  />
                ) : (
                  <Typography variant="caption" color="grey.500">Sin vista previa disponible</Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button variant="contained" color="primary" onClick={handleSave} disabled={!formData.titulo}>
            Guardar Lección
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Eliminar */}
      <Dialog open={deleteConfirm.open} onClose={closeDelete}>
        <DialogTitle>Eliminar Lección</DialogTitle>
        <DialogContent>
          <Typography>¿Estás seguro de que deseas eliminar esta lección? Es irreversible.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDelete}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
