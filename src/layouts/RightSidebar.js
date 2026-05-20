import React from 'react';
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

const SIDEBAR_WIDTH = 270;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: SIDEBAR_WIDTH,
    boxSizing: 'border-box',
    border: 'none',
    backgroundColor: theme.palette.background.alt,
    zIndex: theme.zIndex.appBar - 1, // Stay below Navbar
    paddingTop: 64, // Height of Navbar
  },
}));

const upcomingServices = [
  { label: 'ImportaPay (Billetera)', icon: <AccountBalanceWalletIcon sx={{ opacity: 0.6 }} />, tag: 'Soon' },
  { label: 'Club de Recompensas', icon: <EmojiEventsIcon sx={{ opacity: 0.6 }} />, tag: 'Beta' }
];


export default function RightSidebar({ open, onToggle, variant = 'temporary' }) {
  const router = useRouter();
  const { notify } = useNotification();

  const handleSoonClick = (label) => {
    notify(`El servicio de "${label}" estará disponible en la próxima versión de la plataforma.`, 'info');
  };

  return (
    <StyledDrawer
      anchor="right"
      open={open}
      onClose={onToggle}
      variant={variant}
      sx={{
        display: variant === 'permanent' ? { xs: 'none', lg: 'block' } : 'block',
      }}
    >
      <Box sx={{ overflow: 'auto', p: 1 }} className="no-scrollbar">
        {userNavSections.map((section, sIdx) => (
          <List 
            key={section.title}
            subheader={
              <ListSubheader sx={{ bgcolor: 'transparent', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                {section.title}
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
                    '&.Mui-selected': {
                      bgcolor: 'white',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      color: 'primary.main',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {item.badge ? (
                      <Badge badgeContent={item.badge} color="error">
                        {item.icon}
                      </Badge>
                    ) : item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: 600 } } }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        ))}

        <Divider sx={{ my: 2, mx: 1 }} />

        <List
          subheader={
            <ListSubheader sx={{ bgcolor: 'transparent', fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase', fontSize: '0.75rem' }}>
              Servicios Extra
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
                  opacity: 0.6,
                  '&:hover': {
                    bgcolor: 'action.hover',
                    opacity: 0.9,
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: 500 } } }}
                />
                <Chip
                  label={item.tag}
                  size="small"
                  color="warning"
                  variant="outlined"
                  sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, px: 0.5 }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </StyledDrawer>
  );
}
