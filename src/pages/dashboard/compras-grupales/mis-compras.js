import React, { useEffect, useState } from 'react';
import { useApiService } from '@/hooks/useApiService';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Box, Typography, Grid, Paper, Button, Chip, Divider, CircularProgress, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField 
} from '@mui/material';
import { useRouter } from 'next/router';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import InventoryIcon from '@mui/icons-material/Inventory';

export default function MisComprasGrupales() {
  const { getApiService, postApiService, loading } = useApiService();
  const { user } = useAuth();
  const router = useRouter();
  
  const [compras, setCompras] = useState([]);
  const [openPayModal, setOpenPayModal] = useState(false);
  const [selectedParticipante, setSelectedParticipante] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchMisCompras();
  }, [user]);

  const fetchMisCompras = async () => {
    const data = await getApiService('/api/compras-grupales/mis-compras');
    if (data) setCompras(data);
  };

  const handleOpenPay = (participante) => {
    setSelectedParticipante(participante);
    setOpenPayModal(true);
  };

  const handlePay = async () => {
    // Simulamos el pago enviando al backend (ej. a una ruta ficticia de simulación por ahora)
    // En la vida real, redirigiría a pasarela o enviaría el comprobante
    const data = await postApiService(`/api/pagos/simular`, { 
      participante_id: selectedParticipante.id,
      hito: selectedParticipante.hito_actual
    }, {
      successMessage: 'Pago registrado y en verificación.'
    });

    if (data) {
      setOpenPayModal(false);
      fetchMisCompras();
    }
  };

  if (loading && compras.length === 0) {
    return <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Mi Portafolio de Importaciones
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Gestiona tus contenedores activos y realiza los pagos de hitos (Anticipo, Aduanas).
      </Typography>

      {compras.length === 0 ? (
        <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 4 }}>
          <InventoryIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6">Aún no te has unido a ninguna compra grupal.</Typography>
          <Button 
            variant="contained" 
            sx={{ mt: 3 }}
            onClick={() => router.push('/dashboard/compras-grupales')}
          >
            Explorar Contenedores
          </Button>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, width: '100%' }}>
          {compras.map((p) => {
            const cg = p.compra_grupal || {};
            const needsPayment = p.estado_pago === 'Pendiente';
            
            return (
              <Paper 
                key={p.id}
                variant="outlined"
                sx={{ 
                  p: 2.5, 
                  borderRadius: 4, 
                  width: '100%',
                  borderLeft: needsPayment ? '6px solid #ef4444' : '6px solid #10b981',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.02)'
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', md: 'row' }, 
                  alignItems: { xs: 'flex-start', md: 'center' }, 
                  justifyContent: 'space-between',
                  gap: 3,
                  width: '100%' 
                }}>
                  {/* Bloque 1 (Info) */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 2, minWidth: 0 }}>
                    <Box 
                      component="img"
                      src={cg.imagen_url || 'https://via.placeholder.com/100'}
                      sx={{ width: 80, height: 80, borderRadius: 3, objectFit: 'cover', flexShrink: 0 }}
                    />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="h6" fontWeight="bold" noWrap>
                        {cg.titulo}
                      </Typography>
                      <Chip 
                        size="small" 
                        label={`Estado Contenedor: ${cg.estado}`} 
                        sx={{ mt: 0.5, fontWeight: 700 }} 
                      />
                    </Box>
                  </Box>
                  
                  {/* Bloque 2 (Inversión) */}
                  <Box sx={{ flex: 1, minWidth: 120 }}>
                    <Typography variant="body2" color="text.secondary">Mi Inversión / Cupos</Typography>
                    <Typography variant="h6" fontWeight="bold">${Number(p.monto).toLocaleString()} USD</Typography>
                  </Box>

                  {/* Bloque 3 (Acción/Hito) */}
                  <Box sx={{ flex: 1, textAlign: { xs: 'left', md: 'right' }, minWidth: 180 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Hito {p.hito_actual}: {p.hito_actual === 1 ? 'Anticipo' : 'Aduana'}
                    </Typography>
                    
                    {needsPayment ? (
                      <Button 
                        variant="contained" 
                        color="error" 
                        startIcon={<MonetizationOnIcon />}
                        onClick={() => handleOpenPay(p)}
                        sx={{ borderRadius: 2, fontWeight: 700 }}
                      >
                        Pagar Pendiente
                      </Button>
                    ) : (
                      <Chip label="Pago al Día" color="success" sx={{ fontWeight: 700 }} />
                    )}
                  </Box>
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* Modal Simulación Pago */}
      <Dialog open={openPayModal} onClose={() => setOpenPayModal(false)}>
        <DialogTitle>Confirmar Pago - Hito {selectedParticipante?.hito_actual}</DialogTitle>
        <DialogContent>
          <DialogContentText mb={2}>
            Estás a punto de simular el pago para el 
            {selectedParticipante?.hito_actual === 1 ? ' Anticipo de Producción' : ' Impuesto de Aduana'} de la importación.
            <br/><br/>
            Monto a pagar: <strong>${selectedParticipante?.monto}</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setOpenPayModal(false)} color="inherit">Cancelar</Button>
          <Button onClick={handlePay} variant="contained" disabled={loading}>
            {loading ? 'Procesando...' : 'Simular Pago Exitoso'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
