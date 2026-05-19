import React, { createContext, useCallback, useContext, useState } from 'react';
import {
  Alert,
  Box,
  Collapse,
  IconButton,
  Portal,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// ─── Context ──────────────────────────────────────────────────────────────────
const NotificationContext = createContext(null);

let _uid = 0;
const nextId = () => ++_uid;

// ─── Provider ─────────────────────────────────────────────────────────────────
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  /**
   * Show a notification.
   * @param {string} message
   * @param {'success'|'error'|'warning'|'info'} severity
   * @param {number} duration  Auto-dismiss in ms. Pass 0 to disable.
   */
  const notify = useCallback((message, severity = 'info', duration = 4500) => {
    const id = nextId();
    setNotifications((prev) => [...prev, { id, message, severity, visible: true }]);

    if (duration > 0) {
      // First fade out, then remove from list
      setTimeout(() => {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, visible: false } : n))
        );
      }, duration);

      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, duration + 350); // 350ms matches the Collapse transition
    }
  }, []);

  const dismiss = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, visible: false } : n))
    );
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 350);
  }, []);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}

      {/* ── Toast Stack (top-right) ── */}
      <Portal>
        <Box
          sx={{
            position: 'fixed',
            top: 80, // Below the Navbar (64px) + 16px gap
            right: 16,
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            maxWidth: 380,
            width: '100%',
            pointerEvents: 'none', // allow clicks through empty space
          }}
        >
          {notifications.map(({ id, message, severity, visible }) => (
            <Collapse key={id} in={visible} timeout={300}>
              <Alert
                severity={severity}
                variant="filled"
                onClose={() => dismiss(id)}
                closeText="Cerrar"
                action={
                  <IconButton
                    size="small"
                    onClick={() => dismiss(id)}
                    sx={{ color: 'inherit', pointerEvents: 'all' }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                }
                sx={{
                  pointerEvents: 'all',
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
                  fontSize: '0.875rem',
                  alignItems: 'flex-start',
                  '& .MuiAlert-action': { pt: 0 },
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.4 }}>
                  {message}
                </Typography>
              </Alert>
            </Collapse>
          ))}
        </Box>
      </Portal>
    </NotificationContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
/**
 * @returns {{ notify: (message: string, severity?: string, duration?: number) => void }}
 */
export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotification must be used inside <NotificationProvider>');
  }
  return ctx;
}
