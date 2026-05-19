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
  ListSubheader
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { mainNavSections } from '@/utils/navigation';

const SIDEBAR_WIDTH = 320;

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

export default function LeftSidebar({ open, onToggle, variant = 'temporary' }) {
  const router = useRouter();

  return (
    <StyledDrawer
      anchor="left"
      open={open}
      onClose={onToggle}
      variant={variant}
      sx={{
        display: variant === 'permanent' ? { xs: 'none', lg: 'block' } : 'block',
      }}
    >
      <Box sx={{ overflow: 'auto', p: 1 }} className="no-scrollbar">
        {mainNavSections.map((section, sIdx) => (
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
                  <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    slotProps={{ primary: { sx: { fontSize: '0.9rem', fontWeight: 600 } } }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        ))}
      </Box>
    </StyledDrawer>
  );
}
