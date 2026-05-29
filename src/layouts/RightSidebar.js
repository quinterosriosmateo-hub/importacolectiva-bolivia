import React, { useState } from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Box,
  styled,
  ListSubheader,
  Badge,
  Chip
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { userNavSections } from '@/utils/navigation';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useNotification } from '@/contexts/NotificationContext';

const SIDEBAR_WIDTH = 220;
const MINI_WIDTH = 56;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: MINI_WIDTH,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  '& .MuiDrawer-paper': {
    boxSizing: 'border-box',
    border: 'none',
    backgroundColor: theme.palette.background.alt,
    zIndex: theme.zIndex.appBar - 1, // Stay below Navbar
    paddingTop: 64, // Height of Navbar
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
}));

const upcomingServices = [
  { label: 'ImportaPay (Billetera)', icon: <AccountBalanceWalletIcon sx={{ opacity: 0.6 }} />, tag: 'Soon' },
  { label: 'Club de Recompensas', icon: <EmojiEventsIcon sx={{ opacity: 0.6 }} />, tag: 'Beta' }
];


export default function RightSidebar({ open, onToggle, variant = 'temporary' }) {
  const [hovered, setHovered] = useState(false);
  const router = useRouter();
  const { notify } = useNotification();

  // En desktop (permanent), el "abierto" es el ancho completo, "cerrado" es mini-iconos.
  const isExpanded = variant === 'temporary' ? open : hovered;
  const currentWidth = isExpanded ? SIDEBAR_WIDTH : MINI_WIDTH;

  const handleSoonClick = (label) => {
    notify(`El servicio de "${label}" estará disponible en la próxima versión de la plataforma.`, 'info');
  };

  return (
    <StyledDrawer
      anchor="right"
      open={open}
      onClose={onToggle}
      variant={variant}
      onMouseEnter={() => variant === 'permanent' && setHovered(true)}
      onMouseLeave={() => variant === 'permanent' && setHovered(false)}
      sx={{
        display: variant === 'permanent' ? { xs: 'none', lg: 'block' } : 'block',
        '& .MuiDrawer-paper': { width: currentWidth }
      }}
    >
      <Box sx={{ overflow: 'auto', p: 1 }} className="no-scrollbar">
        {userNavSections.map((section, sIdx) => (
          <List 
            key={section.title}
            subheader={
              <ListSubheader sx={{ 
                bgcolor: 'transparent', 
                fontWeight: 700, 
                color: 'text.secondary', 
                textTransform: 'uppercase', 
                fontSize: '0.75rem',
                opacity: isExpanded ? 1 : 0,
                transition: 'opacity 0.2s'
              }}>
                {isExpanded ? section.title : '•'}
              </ListSubheader>
            }
          >
            {section.items.map((item) => (
              <ListItem key={item.label} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.path}
                  onClick={() => variant === 'temporary' && onToggle()}
                  selected={router.pathname === item.path}
                  sx={{
                    mx: 1,
                    my: 0.2,
                    borderRadius: 2,
                    px: isExpanded ? 2 : 1.5,
                    justifyContent: isExpanded ? 'initial' : 'center',
                    '&.Mui-selected': {
                      bgcolor: 'white',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      color: 'primary.main',
                    },
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: 0,
                    mr: isExpanded ? 2 : 'auto',
                    justifyContent: 'center'
                  }}>
                    {item.badge ? (
                      <Badge badgeContent={item.badge} color="error">
                        {item.icon}
                      </Badge>
                    ) : item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    sx={{ opacity: isExpanded ? 1 : 0 }}
                    slotProps={{ primary: { sx: { 
                      fontSize: '0.9rem', 
                      fontWeight: 600,
                      whiteSpace: 'nowrap'
                    } } }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        ))}

        <Divider sx={{ my: 2, mx: 1 }} />

        <List
          subheader={
            <ListSubheader sx={{ 
              bgcolor: 'transparent', 
              fontWeight: 700, 
              color: 'text.disabled', 
              textTransform: 'uppercase', 
              fontSize: '0.75rem',
              opacity: isExpanded ? 1 : 0
            }}>
              {isExpanded ? 'Servicios Extra' : '...'}
            </ListSubheader>
          }
        >
          {upcomingServices.map((item) => (
            <ListItem key={item.label} disablePadding>
              <ListItemButton
                onClick={() => handleSoonClick(item.label)}
                sx={{
                  mx: 1,
                  my: 0.2,
                  borderRadius: 2,
                  px: isExpanded ? 2 : 1.5,
                  justifyContent: isExpanded ? 'initial' : 'center',
                  opacity: 0.6,
                  '&:hover': {
                    bgcolor: 'action.hover',
                    opacity: 0.9,
                  }
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: 0,
                  mr: isExpanded ? 2 : 'auto',
                  justifyContent: 'center'
                }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  sx={{ opacity: isExpanded ? 1 : 0 }}
                  slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: 500, whiteSpace: 'nowrap' } } }}
                />
                {isExpanded && (
                  <Chip
                  label={item.tag}
                  size="small"
                  color="warning"
                  variant="outlined"
                  sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, px: 0.5 }}
                />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </StyledDrawer>
  );
}
