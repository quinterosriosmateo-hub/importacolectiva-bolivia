import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/styles/theme';
import '@/styles/globals.css';
import MainLayout from '@/layouts/MainLayout';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { AuthProvider } from '@/contexts/AuthContext';

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NotificationProvider>
        <AuthProvider>
          <MainLayout>
            <Component {...pageProps} />
          </MainLayout>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}
