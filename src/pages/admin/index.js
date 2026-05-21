import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Pagination,
  CircularProgress,
  InputAdornment,
  useTheme,
  Tabs,
  Tab,
  Autocomplete
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import StarIcon from '@mui/icons-material/Star';
import BlockIcon from '@mui/icons-material/Block';
import CategoryIcon from '@mui/icons-material/Category';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import { useApiService } from '@/hooks/useApiService';
import { useAuth } from '@/contexts/AuthContext';
import { Constantes, ROLES, ESTADOS, ESTADOS_PRODUCTO } from '@/utils/constants';
import { getRoleChipColor, getEstadoChipColor } from '@/utils/helpers';
import { PrimaryButton, SecondaryButton, StandardModal, PremiumCard } from '@/components/ui';
import Link from 'next/link';

export default function AdminDashboard() {
  const theme = useTheme();
  const { user: currentUser } = useAuth();
  const { 
    getApiService, 
    putApiService, 
    postApiService, 
    patchApiService, 
    deleteApiService, 
    loading: apiLoading 
  } = useApiService();

  const [currentTab, setCurrentTab] = useState(0);

  // Estados de Usuarios
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filtros & Búsqueda de Usuarios
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [rolFilter, setRolFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');

  // Menú de acciones por usuario
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Diálogos de Confirmación de Usuarios
  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: '', value: '' });

  // Estados de Categorías
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryModal, setCategoryModal] = useState({ open: false, mode: 'create', category: null });
  const [categoryName, setCategoryName] = useState('');
  const [categoryDeleteConfirm, setCategoryDeleteConfirm] = useState({ open: false, category: null });

  // Productos admin
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productSearchVal, setProductSearchVal] = useState('');
  const [productEstadoFilter, setProductEstadoFilter] = useState('');
  const [productCategoriaFilter, setProductCategoriaFilter] = useState('');
  const [productModal, setProductModal] = useState({ open: false, mode: 'create', product: null });
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productStock, setProductStock] = useState('');
  const [productEstado, setProductEstado] = useState('Activo');
  const [productImage, setProductImage] = useState('');
  const [productCategories, setProductCategories] = useState([]);
  const [productDeleteConfirm, setProductDeleteConfirm] = useState({ open: false, product: null });

  // Cargar categorías
  const fetchCategories = useCallback(async () => {
    setCategoriesLoading(true);
    const res = await getApiService(Constantes.apiAdminCategories);
    if (res && res.code === 0) {
      setCategories(res.categories || []);
    }
    setCategoriesLoading(false);
  }, [getApiService]);

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    const query = new URLSearchParams({
      search: productSearchVal,
      estado: productEstadoFilter,
      categoria: productCategoriaFilter
    }).toString();

    const res = await getApiService(`${Constantes.apiAdminProducts}?${query}`);
    if (res && res.code === 0) {
      setProducts(res.products || []);
    }
    setProductsLoading(false);
  }, [getApiService, productSearchVal, productEstadoFilter, productCategoriaFilter]);

  const fetchStats = useCallback(async () => {
    const res = await getApiService(Constantes.apiAdminStats);
    if (res && res.code === 0) {
      setStats(res.stats);
    }
  }, [getApiService]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const query = new URLSearchParams({
      page: page.toString(),
      search: searchVal,
      rol: rolFilter,
      estado: estadoFilter
    }).toString();

    const res = await getApiService(`${Constantes.apiAdminUsers}?${query}`);
    if (res && res.code === 0) {
      setUsers(res.users);
      setTotalCount(res.count);
    }
    setLoading(false);
  }, [getApiService, page, searchVal, rolFilter, estadoFilter]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (currentTab === 1 || currentTab === 2) {
      fetchCategories();
    }
    if (currentTab === 2) {
      fetchProducts();
    }
  }, [currentTab, fetchCategories, fetchProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Manejo de búsqueda con delay simple para usuarios
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearchVal(search);
      setPage(1);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  useEffect(() => {
    const delay = setTimeout(() => {
      setProductSearchVal(productSearch);
    }, 400);

    return () => clearTimeout(delay);
  }, [productSearch]);

  // --- Manejo de Usuarios ---
  const handleOpenMenu = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const openConfirmDialog = (type, value) => {
    handleCloseMenu();
    setConfirmDialog({ open: true, type, value });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({ open: false, type: '', value: '' });
  };

  const handleConfirmAction = async () => {
    if (!selectedUser) return;
    const { type, value } = confirmDialog;
    
    const url = `${Constantes.apiAdminUsers}/${selectedUser.id}`;
    const payload = {};
    if (type === 'rol') payload.rol = value;
    if (type === 'estado') payload.estado = value;

    const res = await patchApiService(url, payload, {
      successMessage: 'Usuario actualizado con éxito',
      errorMessage: 'Error al actualizar el usuario'
    });

    if (res && res.code === 0) {
      fetchUsers();
      fetchStats();
    }
    
    closeConfirmDialog();
  };

  const resetProductForm = () => {
    setProductName('');
    setProductDescription('');
    setProductPrice('');
    setProductStock('');
    setProductEstado('Activo');
    setProductImage('');
    setProductCategories([]);
  };

  const openProductModal = (mode, product = null) => {
    if (mode === 'edit' && product) {
      setProductName(product.nombre || '');
      setProductDescription(product.descripcion || '');
      setProductPrice(product.precio ?? '');
      setProductStock(product.stock ?? '');
      setProductEstado(product.estado || 'Activo');
      setProductImage(product.image || '');
      setProductCategories(product.categorias || []);
      setProductModal({ open: true, mode: 'edit', product });
    } else {
      resetProductForm();
      setProductModal({ open: true, mode: 'create', product: null });
    }
  };

  const closeProductModal = () => {
    setProductModal({ open: false, mode: 'create', product: null });
    resetProductForm();
  };

  const handleSaveProduct = async () => {
    const payload = {
      nombre: productName,
      descripcion: productDescription,
      precio: Number(productPrice),
      stock: Number(productStock),
      estado: productEstado,
      image: productImage,
      categorias: productCategories.map(c => c.id)
    };

    if (productModal.mode === 'create') {
      const res = await postApiService(Constantes.apiAdminProducts, payload, {
        successMessage: 'Producto creado con éxito',
        errorMessage: 'Error al crear el producto'
      });
      if (res && res.code === 0) {
        fetchProducts();
        closeProductModal();
      }
      return;
    }

    const res = await putApiService(`${Constantes.apiAdminProducts}/${productModal.product.id}`, payload, {
      successMessage: 'Producto actualizado con éxito',
      errorMessage: 'Error al actualizar el producto'
    });

    if (res && res.code === 0) {
      fetchProducts();
      closeProductModal();
    }
  };

  const openDeleteProductConfirm = (product) => {
    setProductDeleteConfirm({ open: true, product });
  };

  const closeDeleteProductConfirm = () => {
    setProductDeleteConfirm({ open: false, product: null });
  };

  const handleDeleteProduct = async () => {
    const { product } = productDeleteConfirm;
    if (!product) return;

    const res = await deleteApiService(`${Constantes.apiAdminProducts}/${product.id}`, {
      successMessage: 'Producto eliminado con éxito',
      errorMessage: 'Error al eliminar el producto'
    });

    if (res && res.code === 0) {
      fetchProducts();
      closeDeleteProductConfirm();
    }
  };

  // --- Manejo de Categorías ---
  const handleOpenCategoryModal = (mode, category = null) => {
    setCategoryModal({ open: true, mode, category });
    setCategoryName(category ? category.nombre : '');
  };

  const handleCloseCategoryModal = () => {
    setCategoryModal({ open: false, mode: 'create', category: null });
    setCategoryName('');
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) return;

    if (categoryModal.mode === 'create') {
      const res = await postApiService(Constantes.apiAdminCategories, {
        nombre: categoryName.trim()
      }, {
        successMessage: 'Categoría creada con éxito',
        errorMessage: 'Error al crear la categoría'
      });

      if (res && res.code === 0) {
        fetchCategories();
        handleCloseCategoryModal();
      }
    } else {
      const { id } = categoryModal.category;
      const res = await putApiService(`${Constantes.apiAdminCategories}/${id}`, {
        nombre: categoryName.trim()
      }, {
        successMessage: 'Categoría actualizada con éxito',
        errorMessage: 'Error al actualizar la categoría'
      });

      if (res && res.code === 0) {
        fetchCategories();
        handleCloseCategoryModal();
      }
    }
  };

  const handleOpenDeleteConfirm = (category) => {
    setCategoryDeleteConfirm({ open: true, category });
  };

  const handleCloseDeleteConfirm = () => {
    setCategoryDeleteConfirm({ open: false, category: null });
  };

  const handleDeleteCategory = async () => {
    const { category } = categoryDeleteConfirm;
    if (!category) return;

    const res = await deleteApiService(`${Constantes.apiAdminCategories}/${category.id}`, {
      successMessage: 'Categoría eliminada con éxito',
      errorMessage: 'Error al eliminar la categoría'
    });

    if (res && res.code === 0) {
      fetchCategories();
      handleCloseDeleteConfirm();
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.nombre.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header del Panel */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 1, letterSpacing: '-0.02em' }}>
            Panel Administrador
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Gestión centralizada de usuarios, asignación de roles, estados de cuenta y categorías de productos.
          </Typography>
        </Box>
      </Box>

      {/* Estadísticas Globales */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <PremiumCard sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>Total Usuarios</Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', mt: 0.5 }}>{stats.total}</Typography>
              </Box>
              <Box sx={{ bgcolor: 'rgba(8, 23, 45, 0.08)', p: 1.5, borderRadius: 3, color: 'primary.main' }}>
                <PeopleAltIcon />
              </Box>
            </PremiumCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <PremiumCard sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>Socios Premium</Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, color: 'secondary.main', mt: 0.5 }}>{stats.porRol['Premium'] || 0}</Typography>
              </Box>
              <Box sx={{ bgcolor: 'rgba(255, 145, 77, 0.1)', p: 1.5, borderRadius: 3, color: 'secondary.main' }}>
                <StarIcon />
              </Box>
            </PremiumCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <PremiumCard sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>Administradores</Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, color: 'error.main', mt: 0.5 }}>{stats.porRol['Administrador'] || 0}</Typography>
              </Box>
              <Box sx={{ bgcolor: 'rgba(255, 61, 0, 0.08)', p: 1.5, borderRadius: 3, color: 'error.main' }}>
                <SupervisorAccountIcon />
              </Box>
            </PremiumCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <PremiumCard sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>Inactivos / Suspendidos</Typography>
                <Typography variant="h4" sx={{ fontWeight: 900, color: 'warning.main', mt: 0.5 }}>{(stats.suspendidos || 0) + (stats.baneados || 0)}</Typography>
              </Box>
              <Box sx={{ bgcolor: 'rgba(255, 222, 89, 0.15)', p: 1.5, borderRadius: 3, color: 'warning.dark' }}>
                <BlockIcon />
              </Box>
            </PremiumCard>
          </Grid>
        </Grid>
      )}

      {/* Tabs de Navegación del Panel */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs 
          value={currentTab} 
          onChange={(e, newTab) => setCurrentTab(newTab)} 
          textColor="primary"
          indicatorColor="primary"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 700,
              fontSize: '1rem',
              textTransform: 'none',
              px: 3,
              py: 2,
            }
          }}
        >
          <Tab icon={<PeopleAltIcon />} iconPosition="start" label="Gestión de Usuarios" />
          <Tab icon={<CategoryIcon />} iconPosition="start" label="Gestión de Categorías" />
          <Tab icon={<StarIcon />} iconPosition="start" label="Gestión de Productos" />
        </Tabs>
      </Box>

      {/* TAB 0: Gestión de Usuarios */}
      {currentTab === 0 && (
        <Box>
          {/* Controles y Búsqueda de Usuarios */}
          <Card sx={{ p: 3, mb: 4, borderRadius: 4, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar por nombre o correo electrónico..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ bgcolor: 'background.default', borderRadius: 2 }}
                />
              </Grid>
              <Grid item xs={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Filtrar por Rol</InputLabel>
                  <Select
                    value={rolFilter}
                    onChange={(e) => { setRolFilter(e.target.value); setPage(1); }}
                    label="Filtrar por Rol"
                    sx={{ bgcolor: 'background.default', borderRadius: 2 }}
                  >
                    <MenuItem value="">Todos los Roles</MenuItem>
                    {ROLES.map(role => (
                      <MenuItem key={role} value={role}>{role}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Filtrar por Estado</InputLabel>
                  <Select
                    value={estadoFilter}
                    onChange={(e) => { setEstadoFilter(e.target.value); setPage(1); }}
                    label="Filtrar por Estado"
                    sx={{ bgcolor: 'background.default', borderRadius: 2 }}
                  >
                    <MenuItem value="">Todos los Estados</MenuItem>
                    {ESTADOS.map(estado => (
                      <MenuItem key={estado} value={estado}>{estado.toUpperCase()}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Card>

          {/* Tabla de Usuarios */}
          <TableContainer component={Paper} sx={{ borderRadius: 4, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 6px 18px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
            {loading ? (
              <Box sx={{ py: 10, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress color="primary" />
              </Box>
            ) : (
              <>
                <Table>
                  <TableHead sx={{ bgcolor: 'primary.main' }}>
                    <TableRow>
                      <TableCell sx={{ color: 'white', fontWeight: 700 }}>Usuario</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 700 }}>Contacto</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 700 }}>Rol</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 700 }}>Estado</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 700 }}>Fecha Registro</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 700 }} align="right">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                          <Typography sx={{ color: 'text.secondary' }}>No se encontraron usuarios.</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((u) => (
                        <TableRow key={u.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar src={u.avatar_url} sx={{ bgcolor: 'primary.light', width: 40, height: 40 }}>
                                {u.nombre ? u.nombre.charAt(0).toUpperCase() : 'U'}
                              </Avatar>
                              <Box>
                                <Link href={`/admin/users/${u.id}`} passHref style={{ textDecoration: 'none' }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}>
                                    {u.nombre || 'Sin nombre'}
                                  </Typography>
                                </Link>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                  {u.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{u.telefono || 'No registrado'}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={u.rol}
                              size="small"
                              color={getRoleChipColor(u.rol)}
                              sx={{ fontWeight: 700, borderRadius: 2 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={u.estado ? u.estado.toUpperCase() : 'ACTIVO'}
                              size="small"
                              color={getEstadoChipColor(u.estado || 'activo')}
                              sx={{ fontWeight: 700, borderRadius: 2 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {u.created_at ? new Date(u.created_at).toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton size="small" onClick={(e) => handleOpenMenu(e, u)}>
                              <MoreVertIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                
                {/* Paginación de Usuarios */}
                {totalCount > 25 && (
                  <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
                    <Pagination
                      count={Math.ceil(totalCount / 25)}
                      page={page}
                      onChange={(e, p) => setPage(p)}
                      color="primary"
                      shape="rounded"
                    />
                  </Box>
                )}
              </>
            )}
          </TableContainer>
        </Box>
      )}

      {/* TAB 1: Gestión de Categorías */}
      {currentTab === 1 && (
        <Box>
          {/* Header de Categorías */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
              Categorías de Productos ({filteredCategories.length})
            </Typography>
            <PrimaryButton 
              startIcon={<AddIcon />} 
              onClick={() => handleOpenCategoryModal('create')}
              sx={{ height: 40 }}
            >
              Nueva Categoría
            </PrimaryButton>
          </Box>

          {/* Controles de Búsqueda de Categorías */}
          <Card sx={{ p: 3, mb: 4, borderRadius: 4, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar categorías por nombre..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ bgcolor: 'background.default', borderRadius: 2 }}
            />
          </Card>

          {/* Tabla de Categorías */}
          <TableContainer component={Paper} sx={{ borderRadius: 4, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 6px 18px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
            {categoriesLoading ? (
              <Box sx={{ py: 10, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress color="primary" />
              </Box>
            ) : (
              <Table>
                <TableHead sx={{ bgcolor: 'primary.main' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 700, width: '15%' }}>ID</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700, width: '50%' }}>Nombre de Categoría</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700, width: '20%' }}>Productos Asociados</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700, width: '15%' }} align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                        <Typography sx={{ color: 'text.secondary' }}>No se encontraron categorías.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCategories.map((cat) => (
                      <TableRow key={cat.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                            #{cat.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {cat.nombre}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={`${cat.productCount} ${cat.productCount === 1 ? 'producto' : 'productos'}`} 
                            size="small" 
                            color={cat.productCount > 0 ? 'secondary' : 'default'}
                            sx={{ fontWeight: 700, borderRadius: 2 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <IconButton 
                              size="small" 
                              color="primary" 
                              onClick={() => handleOpenCategoryModal('edit', cat)}
                              title="Editar nombre"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton 
                              size="small" 
                              color="error" 
                              onClick={() => handleOpenDeleteConfirm(cat)}
                              title="Eliminar categoría"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </Box>
      )}

      {/* TAB 2: Gestión de Productos */}
      {currentTab === 2 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
              Productos ({products.length})
            </Typography>
            <PrimaryButton
              startIcon={<AddIcon />}
              onClick={() => openProductModal('create')}
              sx={{ height: 40 }}
            >
              Nuevo Producto
            </PrimaryButton>
          </Box>

          <Card sx={{ p: 3, mb: 4, borderRadius: 4, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar producto por nombre o descripción..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ bgcolor: 'background.default', borderRadius: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Filtrar por Estado</InputLabel>
                  <Select
                    value={productEstadoFilter}
                    onChange={(e) => setProductEstadoFilter(e.target.value)}
                    label="Filtrar por Estado"
                    sx={{ bgcolor: 'background.default', borderRadius: 2 }}
                  >
                    <MenuItem value="">Todos los Estados</MenuItem>
                    {ESTADOS_PRODUCTO.map((estado) => (
                      <MenuItem key={estado} value={estado}>{estado}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={5}>
                <Autocomplete
                  options={categories}
                  getOptionLabel={(option) => option.nombre || ''}
                  value={categories.find((cat) => String(cat.id) === productCategoriaFilter) || null}
                  onChange={(_, selected) => setProductCategoriaFilter(selected ? String(selected.id) : '')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Filtrar por Categoría"
                      size="small"
                      placeholder="Seleccione una categoría"
                      sx={{ bgcolor: 'background.default', borderRadius: 2 }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Card>

          <TableContainer component={Paper} sx={{ borderRadius: 4, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 6px 18px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
            {productsLoading ? (
              <Box sx={{ py: 10, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress color="primary" />
              </Box>
            ) : (
              <Table>
                <TableHead sx={{ bgcolor: 'primary.main' }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }}>Imagen</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }}>Nombre</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }}>Precio</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }}>Stock</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }}>Estado</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }}>Categorías</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 700 }} align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <Typography sx={{ color: 'text.secondary' }}>No se encontraron productos.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow key={product.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>
                          <Avatar src={product.image} variant="rounded" sx={{ width: 56, height: 56, bgcolor: 'background.paper' }} />
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {product.nombre}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            {product.descripcion || 'Sin descripción'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>${Number(product.precio).toFixed(2)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={product.stock ?? 0} size="small" sx={{ fontWeight: 700, borderRadius: 2 }} />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={product.estado}
                            size="small"
                            color={product.estado === 'Activo' ? 'success' : product.estado === 'Inactivo' ? 'default' : 'warning'}
                            sx={{ fontWeight: 700, borderRadius: 2 }}
                          />
                        </TableCell>
                        <TableCell>
                          {product.categorias?.length ? (
                            product.categorias.map((cat) => (
                              <Chip key={cat.id} label={cat.nombre} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                            ))
                          ) : (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Sin categorías</Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <IconButton size="small" color="primary" onClick={() => openProductModal('edit', product)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => openDeleteProductConfirm(product)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </Box>
      )}

      {/* --- Diálogos y Modals Globales --- */}

      {/* Menú Contextual de Usuarios */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem component={Link} href={`/admin/users/${selectedUser?.id || ''}`} onClick={handleCloseMenu}>
          Ver Ficha Completa
        </MenuItem>
        
        {selectedUser?.id !== currentUser?.id && (
          <>
            <Box sx={{ px: 2, py: 1, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase' }}>Cambiar Rol</Typography>
            </Box>
            {ROLES.filter(r => r !== selectedUser?.rol).map(role => (
              <MenuItem key={role} onClick={() => openConfirmDialog('rol', role)} sx={{ fontSize: '0.85rem', pl: 3 }}>
                Hacer {role}
              </MenuItem>
            ))}

            <Box sx={{ px: 2, py: 1, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase' }}>Cambiar Estado</Typography>
            </Box>
            {ESTADOS.filter(e => e !== (selectedUser?.estado || 'activo')).map(estado => (
              <MenuItem key={estado} onClick={() => openConfirmDialog('estado', estado)} sx={{ fontSize: '0.85rem', pl: 3 }}>
                Marcar como {estado.toUpperCase()}
              </MenuItem>
            ))}
          </>
        )}
      </Menu>

      {/* Diálogo de Confirmación de Cambios en Usuarios */}
      <Dialog open={confirmDialog.open} onClose={closeConfirmDialog}>
        <DialogTitle sx={{ fontWeight: 800 }}>Confirmar Cambio de Usuario</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas cambiar el {confirmDialog.type} del usuario <strong>{selectedUser?.nombre}</strong> a <strong>{confirmDialog.value}</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={closeConfirmDialog} sx={{ color: 'text.secondary' }}>Cancelar</Button>
          <Button onClick={handleConfirmAction} variant="contained" color="primary">Confirmar</Button>
        </DialogActions>
      </Dialog>

      {/* Modal Formulario de Categoría (Nueva / Editar) */}
      <StandardModal
        open={categoryModal.open}
        onClose={handleCloseCategoryModal}
        title={categoryModal.mode === 'create' ? 'Nueva Categoría' : 'Editar Categoría'}
        actions={
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', width: '100%' }}>
            <SecondaryButton onClick={handleCloseCategoryModal} sx={{ height: 40 }}>
              Cancelar
            </SecondaryButton>
            <PrimaryButton onClick={handleSaveCategory} sx={{ height: 40 }} disabled={!categoryName.trim() || apiLoading}>
              Guardar
            </PrimaryButton>
          </Box>
        }
      >
        <Box sx={{ pt: 1, pb: 2 }}>
          <TextField
            autoFocus
            fullWidth
            label="Nombre de la Categoría"
            placeholder="Ej: Deportes, Accesorios, etc."
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            disabled={apiLoading}
            variant="outlined"
            sx={{ mt: 1 }}
          />
        </Box>
      </StandardModal>

      {/* Modal de Confirmación de Eliminación de Categoría */}
      <StandardModal
        open={categoryDeleteConfirm.open}
        onClose={handleCloseDeleteConfirm}
        title="Eliminar Categoría"
        actions={
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', width: '100%' }}>
            <SecondaryButton onClick={handleCloseDeleteConfirm} sx={{ height: 40 }}>
              Cancelar
            </SecondaryButton>
            <PrimaryButton 
              onClick={handleDeleteCategory} 
              sx={{ 
                height: 40, 
                background: `linear-gradient(180deg, ${theme.palette.error.light} 0%, ${theme.palette.error.main} 100%)`,
                boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.2)}`,
                color: 'white',
                fontWeight: 600,
                '&:hover': {
                  background: `linear-gradient(180deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
                  boxShadow: `0 6px 18px ${alpha(theme.palette.error.main, 0.3)}`,
                  filter: 'brightness(1.1)',
                }
              }}
              disabled={apiLoading}
            >
              Confirmar Eliminación
            </PrimaryButton>
          </Box>
        }
      >
        <Box sx={{ py: 2 }}>
          <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
            ¿Estás seguro de que deseas eliminar la categoría <strong>{categoryDeleteConfirm.category?.nombre}</strong>?
          </Typography>
          {categoryDeleteConfirm.category?.productCount > 0 ? (
            <Box sx={{ p: 2, bgcolor: 'rgba(211, 47, 47, 0.04)', border: '1px solid rgba(211, 47, 47, 0.2)', borderRadius: 2, color: 'error.main' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                ⚠️ Advertencia de Integridad:
              </Typography>
              <Typography variant="body2">
                Esta categoría tiene <strong>{categoryDeleteConfirm.category?.productCount}</strong> productos asociados.
                Al eliminar la categoría, se desvincularán de forma permanente todos los productos asignados a ella.
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Esta categoría no está asignada a ningún producto. Se puede eliminar de forma segura.
            </Typography>
          )}
        </Box>
      </StandardModal>

      {/* Modal de Producto (Crear / Editar) */}
      <StandardModal
        open={productModal.open}
        onClose={closeProductModal}
        title={productModal.mode === 'create' ? 'Nuevo Producto' : 'Editar Producto'}
        actions={
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', width: '100%' }}>
            <SecondaryButton onClick={closeProductModal} sx={{ height: 40 }}>
              Cancelar
            </SecondaryButton>
            <PrimaryButton onClick={handleSaveProduct} sx={{ height: 40 }} disabled={apiLoading || !productName.trim()}>
              Guardar Producto
            </PrimaryButton>
          </Box>
        }
      >
        <Box sx={{ pt: 1, pb: 2 }}>
          <TextField
            autoFocus
            fullWidth
            label="Nombre del Producto"
            placeholder="Ej: Lote de Accesorios Electrónicos"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            disabled={apiLoading}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Descripción"
            placeholder="Describe el producto, su contenido y características principales."
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            disabled={apiLoading}
            sx={{ mb: 2 }}
          />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Precio"
                placeholder="0.00"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                disabled={apiLoading}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Stock"
                placeholder="0"
                value={productStock}
                onChange={(e) => setProductStock(e.target.value)}
                disabled={apiLoading}
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={productEstado}
                  label="Estado"
                  onChange={(e) => setProductEstado(e.target.value)}
                  disabled={apiLoading}
                  sx={{ mb: 2 }}
                >
                  {ESTADOS_PRODUCTO.map((estado) => (
                    <MenuItem key={estado} value={estado}>{estado}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="URL de imagen"
                placeholder="https://..."
                value={productImage}
                onChange={(e) => setProductImage(e.target.value)}
                disabled={apiLoading}
                sx={{ mb: 2 }}
              />
            </Grid>
          </Grid>
          <Autocomplete
            multiple
            options={categories}
            getOptionLabel={(option) => option.nombre || ''}
            value={productCategories}
            onChange={(_, selected) => setProductCategories(selected)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Categorías"
                placeholder="Selecciona categorías"
                disabled={apiLoading}
              />
            )}
          />
        </Box>
      </StandardModal>

      {/* Modal de Confirmación de Eliminación de Producto */}
      <StandardModal
        open={productDeleteConfirm.open}
        onClose={closeDeleteProductConfirm}
        title="Eliminar Producto"
        actions={
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', width: '100%' }}>
            <SecondaryButton onClick={closeDeleteProductConfirm} sx={{ height: 40 }}>
              Cancelar
            </SecondaryButton>
            <PrimaryButton
              onClick={handleDeleteProduct}
              sx={{
                height: 40,
                background: `linear-gradient(180deg, ${theme.palette.error.light} 0%, ${theme.palette.error.main} 100%)`,
                boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.2)}`,
                color: 'white',
                fontWeight: 600,
                '&:hover': {
                  background: `linear-gradient(180deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
                  boxShadow: `0 6px 18px ${alpha(theme.palette.error.main, 0.3)}`,
                  filter: 'brightness(1.1)',
                }
              }}
              disabled={apiLoading}
            >
              Confirmar Eliminación
            </PrimaryButton>
          </Box>
        }
      >
        <Box sx={{ py: 2 }}>
          <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
            ¿Estás seguro de que deseas eliminar el producto <strong>{productDeleteConfirm.product?.nombre}</strong>?
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Esta acción eliminará el registro del producto y desvinculará todas sus categorías asociadas.
          </Typography>
        </Box>
      </StandardModal>
    </Box>
  );
}

