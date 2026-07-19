import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/styles/theme';
import '@/styles/globals.css';
import MainLayout from '@/layouts/MainLayout';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { useAuth } from '@/contexts/AuthContext';
import dynamic from 'next/dynamic';

// El modal solo se carga en desarrollo para no aumentar el bundle en producción
const GoogleDevModal = process.env.NODE_ENV !== 'production'
  ? dynamic(() => import('@/components/dev/GoogleDevModal'), { ssr: false })
  : null;

/**
 * DevTools — Renderiza herramientas de desarrollo (modal de login simulado Google).
 * Solo activo en NODE_ENV !== 'production'. Se monta dentro de AuthProvider.
 */
function DevTools() {
  const { googleDevModalOpen, setGoogleDevModalOpen, login } = useAuth();

  if (process.env.NODE_ENV === 'production' || !GoogleDevModal) return null;

  return (
    <GoogleDevModal
      open={googleDevModalOpen}
      onClose={() => setGoogleDevModalOpen(false)}
      onLogin={async (email, password) => {
        await login(email, password);
      }}
    />
  );
}

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LoadingProvider>
        <NotificationProvider>
          <AuthProvider>
            <DevTools />
            <MainLayout>
              <Component {...pageProps} />
            </MainLayout>
          </AuthProvider>
        </NotificationProvider>
      </LoadingProvider>
    </ThemeProvider>
  );
}

