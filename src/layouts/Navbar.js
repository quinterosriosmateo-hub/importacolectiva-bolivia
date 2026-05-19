import React from 'react';
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
  alpha
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SearchIcon from '@mui/icons-material/Search';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined'
import Link from 'next/link';

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
          <IconButton size="large" aria-label="cart" color="inherit">
            <Badge badgeContent={4} color="secondary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

          <IconButton
            size="large"
            edge="end"
            aria-label="user account"
            color="inherit"
            onClick={onToggleRight}
            sx={{ ml: 1 }}
          >
            <PersonOutlinedIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
