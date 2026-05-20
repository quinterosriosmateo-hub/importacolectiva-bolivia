import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, CircularProgress, Backdrop } from '@mui/material';

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [globalLoading, setGlobalLoading] = useState(false);
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

  return (
    <LoadingContext.Provider value={{ setGlobalLoading }}>
      {children}
      <Backdrop
        sx={{
          color: '#fff',
          zIndex: (theme) => theme.zIndex.drawer + 9999,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
        }}
        open={globalLoading}
      >
        <CircularProgress color="inherit" size={60} thickness={4} />
      </Backdrop>
    </LoadingContext.Provider>
  );
}

export function useGlobalLoading() {
  return useContext(LoadingContext);
}
