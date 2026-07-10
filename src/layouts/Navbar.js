import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  AppBar, Box, Toolbar, Typography, Button, IconButton, Badge, InputBase,
  styled, alpha, Menu, MenuItem, Divider, Avatar, ListItemIcon, Popover,
  List, ListItem, ListItemText, CircularProgress, Chip, Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 20,
  backgroundColor: alpha(theme.palette.common.black, 0.05),
  '&:hover': { backgroundColor: alpha(theme.palette.common.black, 0.08) },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  transition: theme.transitions.create(['background-color', 'width']),
  [theme.breakpoints.up('sm')]: { marginLeft: theme.spacing(3), width: 'auto' },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justify: 'center',
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: { width: '25ch' },
  },
}));

// ── Formato de tiempo relativo ─────────────────────────────────────────────────
function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'Ahora';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

// ── Panel de Notificaciones ───────────────────────────────────────────────────
function NotificacionesPanel({ anchorEl, onClose }) {
  const router = useRouter();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const open = Boolean(anchorEl);

  const fetchNotifs = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setLoading(false); return; }
    const res = await fetch('/api/notificaciones', {
      headers: { Authorization: `Bearer ${session.access_token}` }
    });
    if (res.ok) setNotifs(await res.json());
    setLoading(false);
  }, [open]);

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  const markRead = async (id) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await fetch(`/api/notificaciones?id=${id}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${session.access_token}` }
    });
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, leida: true } : n));
  };

  const markAllRead = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await fetch('/api/notificaciones', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${session.access_token}` }
    });
    setNotifs((prev) => prev.map((n) => ({ ...n, leida: true })));
  };

  const handleClickNotif = (notif) => {
    if (!notif.leida) markRead(notif.id);
    onClose();
    if (notif.url) router.push(notif.url);
  };

  const noLeidas = notifs.filter((n) => !n.leida).length;

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      disableScrollLock
      slotProps={{
        paper: {
          sx: {
            width: 380, maxHeight: 520, borderRadius: 3, overflow: 'hidden',
            boxShadow: '0 12px 48px rgba(0,0,0,0.18)',
            border: '1px solid rgba(0,0,0,0.08)',
            display: 'flex', flexDirection: 'column',
          }
        }
      }}
    >
      <Box sx={{ px: 2.5, py: 1.8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1" fontWeight={800}>Notificaciones</Typography>
          {noLeidas > 0 && (
            <Chip label={noLeidas} size="small" color="error" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800 }} />
          )}
        </Box>
        {noLeidas > 0 && (
          <Tooltip title="Marcar todas como leídas">
            <IconButton size="small" onClick={markAllRead}>
              <DoneAllIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Box sx={{ overflowY: 'auto', flex: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifs.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <NotificationsNoneIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.disabled">Sin notificaciones</Typography>
          </Box>
        ) : (
          <List disablePadding>
            {notifs.map((notif) => (
              <ListItem
                key={notif.id}
                onClick={() => handleClickNotif(notif)}
                sx={{
                  py: 1.5, px: 2.5, cursor: 'pointer',
                  bgcolor: notif.leida ? 'transparent' : 'rgba(59,130,246,0.06)',
                  borderBottom: '1px solid', borderColor: 'divider',
                  '&:hover': { bgcolor: 'action.hover' },
                  transition: 'background 0.15s',
                  alignItems: 'flex-start',
                  gap: 1.5,
                }}
              >
                {!notif.leida && (
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', mt: 0.8, flexShrink: 0 }} />
                )}
                <ListItemText
                  sx={{ m: 0 }}
                  primary={
                    <Typography variant="body2" fontWeight={notif.leida ? 500 : 800} sx={{ lineHeight: 1.4 }}>
                      {notif.titulo}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3, lineHeight: 1.4 }}>
                        {notif.mensaje}
                      </Typography>
                      <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                        {timeAgo(notif.created_at)}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Popover>
  );
}

// ── Navbar Principal ──────────────────────────────────────────────────────────
export default function Navbar({ onToggleLeft, onToggleRight }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const openMenu = Boolean(anchorEl);
  const pollingRef = useRef(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) { setUnreadCount(0); return; }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    const res = await fetch('/api/notificaciones', {
      headers: { Authorization: `Bearer ${session.access_token}` }
    });
    if (res.ok) {
      const data = await res.json();
      setUnreadCount(data.filter((n) => !n.leida).length);
    }
  }, [user]);

  useEffect(() => {
    fetchUnreadCount();
    pollingRef.current = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(pollingRef.current);
  }, [fetchUnreadCount]);

  const handleCloseNotifPanel = () => {
    setNotifAnchor(null);
    fetchUnreadCount();
  };

  const handleOpenUserMenu = (e) => setAnchorEl(e.currentTarget);
  const handleCloseUserMenu = () => setAnchorEl(null);
  const handleMenuItemClick = (path) => { handleCloseUserMenu(); router.push(path); };
  const handleLogout = async () => { handleCloseUserMenu(); await logout(); };

  // Condición para evaluar el entorno
  const isDevelopment = process.env.NODE_ENV !== 'production';

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="primary"
      className="main-app-bar"
      sx={{ backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton size="large" edge="start" color="inherit" aria-label="open main menu" onClick={onToggleLeft} sx={{ mr: 1 }}>
            <MenuIcon />
          </IconButton>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
            <Box component="img" src="/logo.svg" alt="Logo" sx={{ mr: 1, height: 32, width: 32 }} />
            <Typography variant="h6" noWrap sx={{ fontWeight: 800, letterSpacing: -0.5, display: { xs: 'none', sm: 'block' } }}>
              Importacolectiva
            </Typography>
          </Link>
        </Box>

        <Search sx={{ display: { xs: 'none', md: 'block' } }}>
          <SearchIconWrapper><SearchIcon /></SearchIconWrapper>
          <StyledInputBase 
            placeholder="Buscar productos..." 
            inputProps={{ 'aria-label': 'search' }} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    router.push(`/compras-grupales?search=${searchQuery}`);
                    setSearchQuery('');
                }
            }}
          />
        </Search>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* API Docs: Solo se renderiza si no estamos en producción */}
          {isDevelopment && (
            <Button component={Link} href="/api-docs" variant="text" color="inherit"
              sx={{ mr: 1, fontWeight: 700, textTransform: 'none', borderRadius: 2 }}>
              API Docs
            </Button>
          )}

          {/* Carrito: Redirige directamente al historial de compras */}
          <IconButton component={Link} href="/mis-compras" size="large" aria-label="cart" color="inherit">
            <Badge badgeContent={4} color="secondary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

          {user && (
            <>
              {/* Botón de Notificaciones */}
              <IconButton
                size="large"
                aria-label={`${unreadCount} notificaciones no leídas`}
                color="inherit"
                sx={{ ml: 0.5 }}
                onClick={(e) => setNotifAnchor(e.currentTarget)}
              >
                <Badge badgeContent={unreadCount} color="secondary" max={99}>
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              <NotificacionesPanel
                anchorEl={notifAnchor}
                onClose={handleCloseNotifPanel}
              />
            </>
          )}

          {user ? (
            <>
              <IconButton size="large" edge="end" aria-label="user account" color="inherit"
                onClick={handleOpenUserMenu} sx={{ ml: 1 }}>
                <Avatar
                  src={user.avatarUrl}
                  sx={{ width: 32, height: 32, bgcolor: 'secondary.main', color: 'primary.main', fontSize: '0.875rem', fontWeight: 700 }}
                >
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleCloseUserMenu}
                onClick={handleCloseUserMenu}
                disableScrollLock
                slotProps={{
                  paper: {
                    elevation: 3,
                    sx: {
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                      mt: 1.5, borderRadius: 3, border: '1px solid rgba(0,0,0,0.08)',
                      '& .MuiAvatar-root': { width: 32, height: 32, ml: -0.5, mr: 1 },
                    }
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 2, minWidth: 240 }}>
                  <Avatar src={user.avatarUrl} sx={{ bgcolor: 'secondary.main', color: 'primary.main', fontWeight: 'bold' }}>
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>{user.displayName}</Typography>
                    <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem onClick={() => handleMenuItemClick('/profile')}>
                  <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>Mi cuenta
                </MenuItem>
                <MenuItem onClick={() => handleMenuItemClick('/orders')}>
                  <ListItemIcon><LocalShippingIcon fontSize="small" /></ListItemIcon>Mis Pedidos
                </MenuItem>
                <MenuItem onClick={() => handleMenuItemClick('/subscription')}>
                  <ListItemIcon><WorkspacePremiumIcon fontSize="small" sx={{ color: '#F7B928' }} /></ListItemIcon>Mi Suscripción
                </MenuItem>
                <MenuItem onClick={() => handleMenuItemClick('/settings')}>
                  <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>Configuración
                </MenuItem>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>Cerrar sesión
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button component={Link} href="/login" variant="contained" color="secondary"
              sx={{ ml: 2, borderRadius: 20, fontWeight: 700, textTransform: 'none' }}>
              Iniciar Sesión
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}