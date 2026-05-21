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
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

// Secciones del menú izquierdo (Cosas de Logística)
export const mainNavSections = [
  {
    title: 'Operaciones Logísticas',
    items: [
      { label: 'Panel de Control', path: '/dashboard', icon: <DashboardIcon sx={{ color: '#1877F2' }} /> },
      { label: 'Panel Administrador', path: '/admin', icon: <AdminPanelSettingsIcon sx={{ color: '#ff3d00' }} />, isAdminOnly: true },
      { label: 'Tienda Importaciones', path: '/shop', icon: <StoreIcon sx={{ color: '#F5C330' }} /> },
      { label: 'Importaciones Grupales', path: '/groups', icon: <GroupIcon sx={{ color: '#45BD62' }} /> },
    ]
  },
  {
    title: 'Ayuda y Recursos',
    items: [
      { label: 'Guía de Importación', path: '/guide', icon: <HelpIcon sx={{ color: '#F02849' }} /> },
      { label: 'Sobre Nosotros', path: '/about', icon: <InfoIcon /> },
      { label: 'Soporte Técnico', path: '/contact', icon: <ContactSupportIcon /> },
    ]
  }
];

// Secciones del menú derecho (Cosas del Usuario)
export const userNavSections = [
  {
    title: 'Mi Cuenta',
    items: [
      { label: 'Perfil de Usuario', path: '/profile', icon: <PersonIcon sx={{ color: '#1877F2' }} /> },
      { label: 'Configuración', path: '/settings', icon: <SettingsIcon /> },
    ]
  },
  {
    title: 'Mi Actividad',
    items: [
      { label: 'Mis Pedidos', path: '/orders', icon: <LocalShippingIcon sx={{ color: '#45BD62' }} /> },
      { label: 'Mis Deseos', path: '/wishlist', icon: <FavoriteIcon sx={{ color: '#EF3F4C' }} /> },
      { label: 'Historial', path: '/history', icon: <HistoryIcon sx={{ color: '#F7B928' }} /> },
      { label: 'Ofertas para ti', path: '/offers', icon: <CampaignIcon sx={{ color: '#F02849' }} /> },
    ]
  }
];
