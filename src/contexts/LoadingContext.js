import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, CircularProgress, Backdrop, Typography } from '@mui/material';

const LoadingContext = createContext();

const IMPORT_TIPS = [
  "Participar en compras grupales reduce drásticamente el costo de flete por metro cúbico.",
  "El arancel aduanero promedio en Bolivia para tecnología varía entre el 5% y el 15%.",
  "Antes de ofertar, utiliza el Simulador de Costos para estimar el precio final de importación.",
  "Importacolectiva gestiona todo el papeleo de aduanas por ti. ¡Tú solo recibes el producto!",
  "El plan Premium te da acceso a tarifas especiales y asesoría personalizada 1-a-1.",
  "Consolidar carga con otros importadores te da poder de negociación directo con fábricas en Yiwu.",
  "Siempre verifica la reputación del proveedor en China antes de solicitar una simulación especial.",
  "Los tiempos estimados de transporte marítimo desde China a Bolivia (vía Arica) son de 45 a 60 días.",
  "Unirte a una importación colectiva activa te permite acceder a los mismos precios que un gran importador."
];

export function LoadingProvider({ children }) {
  const [globalLoading, setGlobalLoading] = useState(false);
  const [currentTip, setCurrentTip] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleStart = (url) => {
      if (url !== router.asPath) {
        setGlobalLoading(true);
      }
    };
    const handleComplete = () => setGlobalLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router.asPath, router.events]);

  useEffect(() => {
    if (globalLoading) {
      const randomIdx = Math.floor(Math.random() * IMPORT_TIPS.length);
      setCurrentTip(IMPORT_TIPS[randomIdx]);
    }
  }, [globalLoading]);

  return (
    <LoadingContext.Provider value={{ setGlobalLoading }}>
      {children}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 9999,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'rgba(10, 25, 41, 0.85)',
          backdropFilter: 'blur(8px)',
          gap: 4,
          px: 3,
          textAlign: 'center',
        }}
        open={globalLoading}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress color="secondary" size={70} thickness={4.5} sx={{ filter: 'drop-shadow(0 0 10px rgba(245, 195, 48, 0.3))' }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'secondary.main', letterSpacing: '1px', textTransform: 'uppercase', mt: 2 }}>
            Cargando conocimientos...
          </Typography>
        </Box>
        
        {currentTip && (
          <Box 
            sx={{ 
              maxWidth: 500, 
              p: 3, 
              borderRadius: 4, 
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 800, mb: 1.5, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, fontSize: '0.85rem', letterSpacing: '1px' }}>
              💡 TIP DE IMPORTACIÓN
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.6, fontStyle: 'italic', fontSize: '0.95rem' }}>
              "{currentTip}"
            </Typography>
          </Box>
        )}
      </Backdrop>
    </LoadingContext.Provider>
  );
}

export function useGlobalLoading() {
  return useContext(LoadingContext);
}
