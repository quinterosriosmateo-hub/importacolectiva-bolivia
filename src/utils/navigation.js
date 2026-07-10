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
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import SchoolIcon from '@mui/icons-material/School';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CalculateIcon from '@mui/icons-material/Calculate';
import StorefrontIcon from '@mui/icons-material/Storefront';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

// Secciones del menú izquierdo (Cosas de Logística)
export const mainNavSections = [
  {
    title: 'Operaciones Logísticas',
    items: [
      { label: 'Panel de Control', path: '/dashboard', icon: <DashboardIcon sx={{ color: '#1877F2' }} /> },
      { label: 'Panel Administrador', path: '/admin', icon: <AdminPanelSettingsIcon sx={{ color: '#ff3d00' }} />, isAdminOnly: true },
      { label: 'Reportes y Movimientos', path: '/admin/reportes', icon: <HistoryIcon sx={{ color: '#00b0ff' }} />, isAdminOnly: true },
      { label: 'Proveedores', path: '/admin/proveedores', icon: <StoreIcon sx={{ color: '#ff9800' }} />, isAdminOnly: true },
      { label: 'Compras Grupales', path: '/compras-grupales', icon: <GroupIcon sx={{ color: '#45BD62' }} /> },
      { label: 'Mis Compras', path: '/mis-compras', icon: <Inventory2Icon sx={{ color: '#8B5CF6' }} /> },
      { label: 'Calculadora de Costos', path: '/calculadora', icon: <CalculateIcon sx={{ color: '#3b82f6' }} /> },
      // { label: 'Reventa (Abandonos)', path: '/reventa', icon: <StorefrontIcon sx={{ color: '#10b981' }} /> },
      // { label: 'Tienda', path: '/shop', icon: <StoreIcon sx={{ color: '#F5C330' }} /> },
    ]
  },
  {
    title: 'Recursos',
    items: [
      { label: 'Academia & Cursos', path: '/courses', icon: <SchoolIcon sx={{ color: '#00b0ff' }} /> },
      { label: 'Guía de Importación', path: '/guide', icon: <HelpIcon sx={{ color: '#F02849' }} /> },
      { label: 'Asesoría 1-a-1', path: '/asesoria', icon: <SupportAgentIcon sx={{ color: '#8b5cf6' }} /> },
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
      { label: 'Mi Suscripción', path: '/subscription', icon: <WorkspacePremiumIcon sx={{ color: '#F7B928' }} /> },
      { label: 'Configuración', path: '/settings', icon: <SettingsIcon /> },
    ]
  },
  {
    title: 'Mi Actividad',
    items: [
      { label: 'Mis Compras Grupales', path: '/mis-compras', icon: <GroupIcon sx={{ color: '#45BD62' }} /> },
      { label: 'Mis Pedidos', path: '/orders', icon: <LocalShippingIcon sx={{ color: '#45BD62' }} /> },
      { label: 'Mis Deseos', path: '/wishlist', icon: <FavoriteIcon sx={{ color: '#EF3F4C' }} /> },
      { label: 'Historial', path: '/history', icon: <HistoryIcon sx={{ color: '#F7B928' }} /> },
      { label: 'Ofertas para ti', path: '/offers', icon: <CampaignIcon sx={{ color: '#F02849' }} /> },
    ]
  }
];
