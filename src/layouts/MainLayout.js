import React, { useState, useEffect } from 'react';
import { Box, useMediaQuery, useTheme, CircularProgress } from '@mui/material';
import { useRouter } from 'next/router';
import Navbar from './Navbar';
import Footer from './Footer';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import { useAuth } from '@/contexts/AuthContext';

const SIDEBAR_WIDTH = 270;

export default function MainLayout({ children }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const router = useRouter();
  const { user, loading } = useAuth();
  
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

  const toggleLeftSidebar = () => setLeftSidebarOpen(!leftSidebarOpen);
  const toggleRightSidebar = () => setRightSidebarOpen(!rightSidebarOpen);

  const isAdminRoute = router.pathname.startsWith('/admin');
  const isAuthorized = !isAdminRoute || (user && user.role === 'Administrador');

  useEffect(() => {
    if (loading) return;

    if (isAdminRoute) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'Administrador') {
        router.push('/dashboard');
      }
    }
  }, [router.pathname, user, loading, router, isAdminRoute]);

  // Ocultar sidebars en páginas específicas como la página de inicio, documentación de la API y login para comodidad
  const hideSidebars = router.pathname === '/' || router.pathname === '/api-docs' || router.pathname === '/login' || router.pathname === '/register' || router.pathname === '/forgot-password' || router.pathname === '/update-password';

  if (isAdminRoute && (loading || !isAuthorized)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'var(--bg-color)' }}>
        <CircularProgress size={50} />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'var(--bg-color)' }}>
      {/* Navbar on top */}
      <Box sx={{ zIndex: theme.zIndex.appBar, position: 'sticky', top: 0 }}>
        <Navbar 
          onToggleLeft={toggleLeftSidebar} 
          onToggleRight={toggleRightSidebar} 
        />
      </Box>
      
      {/* Sidebars below Navbar */}
      {!hideSidebars && (
        <>
          <LeftSidebar 
            open={isDesktop ? true : leftSidebarOpen} 
            onToggle={toggleLeftSidebar} 
            variant={isDesktop ? 'permanent' : 'temporary'}
          />

          <RightSidebar 
            open={isDesktop ? true : rightSidebarOpen} 
            onToggle={toggleRightSidebar} 
            variant={isDesktop ? 'permanent' : 'temporary'}
          />
        </>
      )}

      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          py: 4,
          px: { xs: 2, lg: 4 },
          ml: { xs: 0, lg: hideSidebars ? 0 : `${SIDEBAR_WIDTH}px` },
          mr: { xs: 0, lg: hideSidebars ? 0 : `${SIDEBAR_WIDTH}px` },
          transition: theme.transitions.create(['margin', 'padding'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Box sx={{ maxWidth: hideSidebars ? '100%' : 1200, mx: 'auto' }}>
          {children}
        </Box>
      </Box>
      
      <Box sx={{ 
        ml: { xs: 0, lg: hideSidebars ? 0 : `${SIDEBAR_WIDTH}px` },
        mr: { xs: 0, lg: hideSidebars ? 0 : `${SIDEBAR_WIDTH}px` },
      }}>
        <Footer />
      </Box>
    </Box>
  );
}
