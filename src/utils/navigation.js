import HomeIcon from '@mui/icons-material/Home';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import InfoIcon from '@mui/icons-material/Info';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SettingsIcon from '@mui/icons-material/Settings';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HistoryIcon from '@mui/icons-material/History';
import GroupIcon from '@mui/icons-material/Group';
import StoreIcon from '@mui/icons-material/Store';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ChatIcon from '@mui/icons-material/Chat';
import CampaignIcon from '@mui/icons-material/Campaign';
import HelpIcon from '@mui/icons-material/Help';

export const mainNavSections = [
  {
    title: 'Principal',
    items: [
      { label: 'Inicio', path: '/', icon: <HomeIcon color="primary" /> },
      { label: 'Panel de Control', path: '/dashboard', icon: <DashboardIcon sx={{ color: '#4267B2' }} /> },
      { label: 'Tienda Online', path: '/shop', icon: <StoreIcon sx={{ color: '#F5C330' }} /> },
    ]
  },
  {
    title: 'Favoritos',
    items: [
      { label: 'Mis Deseos', path: '/wishlist', icon: <FavoriteIcon sx={{ color: '#EF3F4C' }} /> },
      { label: 'Historial', path: '/history', icon: <HistoryIcon sx={{ color: '#1877F2' }} /> },
      { label: 'Importaciones Grupales', path: '/groups', icon: <GroupIcon sx={{ color: '#45BD62' }} /> },
    ]
  },
  {
    title: 'Ayuda',
    items: [
      { label: 'Sobre Nosotros', path: '/about', icon: <InfoIcon /> },
      { label: 'Soporte Técnico', path: '/contact', icon: <ContactSupportIcon /> },
      { label: 'Guía de Importación', path: '/guide', icon: <HelpIcon /> },
    ]
  }
];

export const userNavSections = [
  {
    title: 'Mi Actividad',
    items: [
      { label: 'Notificaciones', path: '/notifications', icon: <NotificationsIcon sx={{ color: '#F7B928' }} />, badge: 5 },
      { label: 'Mensajes', path: '/messages', icon: <ChatIcon sx={{ color: '#1877F2' }} />, badge: 2 },
      { label: 'Ofertas para ti', path: '/offers', icon: <CampaignIcon sx={{ color: '#F02849' }} /> },
    ]
  },
  {
    title: 'Mi Cuenta',
    items: [
      { label: 'Perfil de Usuario', path: '/profile', icon: <PersonIcon /> },
      { label: 'Mis Pedidos', path: '/orders', icon: <LocalShippingIcon /> },
      { label: 'Configuración', path: '/settings', icon: <SettingsIcon /> },
    ]
  }
];
