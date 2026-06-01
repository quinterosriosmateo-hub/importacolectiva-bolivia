import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, TextField, IconButton, Avatar,
  CircularProgress, Chip, Tooltip, Paper
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import LockIcon from '@mui/icons-material/Lock';
import { useApiService } from '@/hooks/useApiService';
import { useAuth } from '@/contexts/AuthContext';

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-BO', { day: 'numeric', month: 'short' });
};

const getRoleColor = (rol) => {
  if (!rol) return '#64748b';
  if (rol === 'Administrador' || rol === 'Admin') return '#f59e0b';
  if (rol === 'Premium') return '#8b5cf6';
  return '#3b82f6';
};

export default function GroupChatPanel({ compraGrupalId, isParticipant }) {
  const { user } = useAuth();
  const { getApiService, postApiService } = useApiService();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    if (isParticipant && compraGrupalId) {
      fetchMessages();
      // Poll cada 8 segundos
      pollRef.current = setInterval(fetchMessages, 8000);
    }
    return () => clearInterval(pollRef.current);
  }, [compraGrupalId, isParticipant]);

  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchMessages = async () => {
    const data = await getApiService(`/api/compras-grupales/${compraGrupalId}/chat`, { requireAuth: true });
    if (data) setMessages(data);
    setLoading(false);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    const texto = newMessage.trim();
    setNewMessage('');

    // Optimistic update
    const tempMsg = {
      id: `temp-${Date.now()}`,
      contenido: texto,
      created_at: new Date().toISOString(),
      usuario_id: user?.id,
      usuario: { nombre: user?.user_metadata?.nombre || 'Tú', rol: user?.role }
    };
    setMessages(prev => [...prev, tempMsg]);

    const result = await postApiService(
      `/api/compras-grupales/${compraGrupalId}/chat`,
      { usuario_id: user?.id, contenido: texto },
      { requireAuth: true, silent: true }
    );

    if (result) {
      // Reemplazar mensaje temporal con el real
      setMessages(prev => prev.map(m => m.id === tempMsg.id ? result : m));
    } else {
      // Revertir optimistic
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
      setNewMessage(texto);
    }
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Agrupar mensajes por fecha
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = formatDate(msg.created_at);
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  if (!isParticipant) {
    return (
      <Paper elevation={0} sx={{
        borderRadius: 3, border: '1px solid', borderColor: 'divider',
        p: 5, textAlign: 'center', bgcolor: 'rgba(0,0,0,0.02)'
      }}>
        <LockIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 2 }} />
        <Typography variant="subtitle1" fontWeight={700} color="text.secondary" gutterBottom>
          Chat Exclusivo para Participantes
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Únete a esta compra grupal para acceder al chat con el grupo.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column',
      height: 480,
      borderRadius: 3, border: '1px solid', borderColor: 'divider',
      overflow: 'hidden',
      bgcolor: 'background.paper'
    }}>
      {/* Header */}
      <Box sx={{
        px: 3, py: 2,
        borderBottom: '1px solid', borderColor: 'divider',
        display: 'flex', alignItems: 'center', gap: 1.5,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
      }}>
        <ChatBubbleOutlinedIcon sx={{ color: '#45BD62', fontSize: 20 }} />
        <Typography variant="subtitle1" fontWeight={800} color="white">
          Chat del Grupo
        </Typography>
        <Chip
          label={`${messages.length} mensajes`}
          size="small"
          sx={{ ml: 'auto', bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem' }}
        />
      </Box>

      {/* Messages */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress size={28} />
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 1 }}>
            <ChatBubbleOutlinedIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
            <Typography variant="body2" color="text.disabled">
              Sé el primero en escribir en el chat grupal
            </Typography>
          </Box>
        ) : (
          Object.entries(groupedMessages).map(([date, msgs]) => (
            <React.Fragment key={date}>
              {/* Date separator */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 1.5 }}>
                <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
                <Typography variant="caption" color="text.disabled" sx={{ px: 1, whiteSpace: 'nowrap', fontSize: '0.7rem', fontWeight: 600 }}>
                  {date}
                </Typography>
                <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
              </Box>

              {msgs.map((msg) => {
                const isOwn = msg.usuario_id === user?.id;
                const nombre = msg.usuario?.nombre || 'Usuario';
                const rol = msg.usuario?.rol;
                const avatarUrl = msg.usuario?.avatar_url;
                const roleColor = getRoleColor(rol);

                return (
                  <Box
                    key={msg.id}
                    sx={{
                      display: 'flex',
                      flexDirection: isOwn ? 'row-reverse' : 'row',
                      alignItems: 'flex-end',
                      gap: 1,
                      mb: 0.5
                    }}
                  >
                    {!isOwn && (
                      <Tooltip title={`${nombre}${rol ? ` · ${rol}` : ''}`} placement="top">
                        <Avatar
                          src={avatarUrl}
                          sx={{ width: 28, height: 28, fontSize: '0.7rem', bgcolor: roleColor, flexShrink: 0 }}
                        >
                          {nombre?.[0]?.toUpperCase()}
                        </Avatar>
                      </Tooltip>
                    )}

                    <Box sx={{ maxWidth: '72%' }}>
                      {!isOwn && (
                        <Typography
                          variant="caption"
                          sx={{ display: 'block', mb: 0.3, ml: 1, fontWeight: 700, color: roleColor }}
                        >
                          {nombre}
                          {rol && <span style={{ fontWeight: 400, color: '#94a3b8', marginLeft: 4 }}>· {rol}</span>}
                        </Typography>
                      )}
                      <Box sx={{
                        px: 2, py: 1,
                        borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        bgcolor: isOwn
                          ? 'linear-gradient(135deg, #45BD62, #00b0ff)'
                          : 'rgba(0,0,0,0.05)',
                        background: isOwn
                          ? 'linear-gradient(135deg, #45BD62 0%, #00b0ff 100%)'
                          : undefined,
                        color: isOwn ? 'white' : 'text.primary',
                        opacity: msg.id?.toString().startsWith('temp-') ? 0.6 : 1
                      }}>
                        <Typography variant="body2" sx={{ lineHeight: 1.5, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                          {msg.contenido}
                        </Typography>
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{ display: 'block', mt: 0.3, color: 'text.disabled', fontSize: '0.65rem',
                          textAlign: isOwn ? 'right' : 'left', px: 1
                        }}
                      >
                        {formatTime(msg.created_at)}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </React.Fragment>
          ))
        )}
        <div ref={bottomRef} />
      </Box>

      {/* Input */}
      <Box sx={{
        px: 2, py: 1.5,
        borderTop: '1px solid', borderColor: 'divider',
        display: 'flex', gap: 1, alignItems: 'flex-end',
        bgcolor: 'rgba(0,0,0,0.02)'
      }}>
        <TextField
          fullWidth
          multiline
          maxRows={3}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje... (Enter para enviar)"
          size="small"
          variant="outlined"
          disabled={sending}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              fontSize: '0.9rem',
              bgcolor: 'background.paper'
            }
          }}
          inputProps={{ maxLength: 1000 }}
        />
        <IconButton
          onClick={handleSend}
          disabled={!newMessage.trim() || sending}
          sx={{
            bgcolor: newMessage.trim() ? 'success.main' : 'action.disabledBackground',
            color: newMessage.trim() ? 'white' : 'text.disabled',
            borderRadius: 2,
            width: 42, height: 42,
            flexShrink: 0,
            transition: 'all 0.2s',
            '&:hover': { bgcolor: 'success.dark', transform: 'scale(1.05)' },
            '&.Mui-disabled': { bgcolor: 'action.disabledBackground' }
          }}
        >
          {sending ? <CircularProgress size={18} color="inherit" /> : <SendIcon fontSize="small" />}
        </IconButton>
      </Box>
    </Box>
  );
}
