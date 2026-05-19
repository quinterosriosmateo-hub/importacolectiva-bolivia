import { createTheme } from '@mui/material/styles';
import { colors, cssVariables } from './colors';

const theme = createTheme({
  palette: {
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    warning: colors.warning,
    info: colors.info,
    error: colors.error,
    background: colors.background,
    text: colors.text,
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    button: {
      textTransform: 'none', // Modern e-commerce look (no all-caps)
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8, // Softer edges
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': cssVariables,
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)', // Soft shadow
        },
        elevation2: {
          boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.08)',
        },
      },
    },
  },
});

export default theme;
