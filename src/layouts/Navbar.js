import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  InputBase,
  styled,
  alpha,
  Menu,
  MenuItem,
  Divider,
  Avatar,
  ListItemIcon
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SearchIcon from '@mui/icons-material/Search';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import ChatIcon from '@mui/icons-material/Chat';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 20,
  backgroundColor: alpha(theme.palette.common.black, 0.05),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.black, 0.08),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  transition: theme.transitions.create(['background-color', 'width']),
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '30ch',
    },
  },
}));

export default function Navbar({ onToggleLeft, onToggleRight }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);

  const handleOpenUserMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (path) => {
    handleCloseUserMenu();
    router.push(path);
  };

  const handleLogout = async () => {
    handleCloseUserMenu();
    await logout();
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color='primary'
      className="main-app-bar"
      sx={{
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open main menu"
            onClick={onToggleLeft}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>

          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
            <LocalShippingIcon sx={{ mr: 1, color: 'secondary.main' }} />
            <Typography variant="h6" noWrap sx={{ fontWeight: 800, letterSpacing: -0.5, display: { xs: 'none', sm: 'block' } }}>
              Importacolectiva
            </Typography>
          </Link>
        </Box>

        <Search sx={{ display: { xs: 'none', md: 'block' } }}>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Buscar productos..."
            inputProps={{ 'aria-label': 'search' }}
          />
        </Search>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            component={Link}
            href="/api-docs"
            variant="text"
            color="inherit"
            sx={{ mr: 1, fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
          >
            API Docs
          </Button>

          <IconButton size="large" aria-label="cart" color="inherit">
            <Badge badgeContent={4} color="secondary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

          {user && (
            <>
              <IconButton 
                size="large" 
                aria-label="messages" 
                color="inherit" 
                component={Link} 
                href="/messages"
                sx={{ ml: 0.5 }}
              >
                <Badge badgeContent={2} color="secondary">
                  <ChatIcon />
                </Badge>
              </IconButton>

              <IconButton 
                size="large" 
                aria-label="notifications" 
                color="inherit" 
                component={Link} 
                href="/notifications"
                sx={{ ml: 0.5 }}
              >
                <Badge badgeContent={5} color="secondary">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </>
          )}


          {user ? (
            <>
              <IconButton
                size="large"
                edge="end"
                aria-label="user account"
                color="inherit"
                onClick={handleOpenUserMenu}
                sx={{ ml: 1 }}
              >
                <PersonOutlinedIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={openMenu}
                onClose={handleCloseUserMenu}
                onClick={handleCloseUserMenu}
                disableScrollLock={true}
                slotProps={{
                  paper: {
                    elevation: 3,
                    sx: {
                      overflow: 'visible',
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                      mt: 1.5,
                      borderRadius: 3,
                      border: '1px solid rgba(0,0,0,0.08)',
                      '& .MuiAvatar-root': {
                        width: 32,
                        height: 32,
                        ml: -0.5,
                        mr: 1,
                      },
                    },
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 2, minWidth: 240 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', color: 'primary.main', fontWeight: 'bold' }}>
                    {user.displayName?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                      {user.displayName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem onClick={() => handleMenuItemClick('/profile')}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  Mi cuenta
                </MenuItem>
                <MenuItem onClick={() => handleMenuItemClick('/orders')}>
                  <ListItemIcon>
                    <LocalShippingIcon fontSize="small" />
                  </ListItemIcon>
                  Mis Pedidos
                </MenuItem>
                <MenuItem onClick={() => handleMenuItemClick('/settings')}>
                  <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                  </ListItemIcon>
                  Configuración
                </MenuItem>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  Cerrar sesión
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              component={Link}
              href="/login"
              variant="contained"
              color="secondary"
              sx={{ ml: 2, borderRadius: 20, fontWeight: 700, textTransform: 'none' }}
            >
              Iniciar Sesión
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
