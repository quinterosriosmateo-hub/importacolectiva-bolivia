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
        <Grid container spacing={3}>
          {compras.map((p) => {
            const cg = p.compra_grupal;
            const needsPayment = p.estado_pago === 'Pendiente';
            
            return (
              <Grid item xs={12} key={p.id}>
                <Paper sx={{ p: 3, borderRadius: 3, borderLeft: needsPayment ? '6px solid #f44336' : '6px solid #4caf50' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box 
                          component="img"
                          src={cg.imagen_url || 'https://via.placeholder.com/100'}
                          sx={{ width: 80, height: 80, borderRadius: 2, objectFit: 'cover' }}
                        />
                        <Box>
                          <Typography variant="h6" fontWeight="bold">{cg.titulo}</Typography>
                          <Chip size="small" label={`Estado Contenedor: ${cg.estado}`} sx={{ mt: 0.5 }} />
                        </Box>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                      <Typography variant="body2" color="text.secondary">Mi Inversión / Cupos</Typography>
                      <Typography variant="h6">${p.monto}</Typography>
                    </Grid>

                    <Grid item xs={12} md={3} sx={{ textAlign: { md: 'right' } }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Hito {p.hito_actual}: {p.hito_actual === 1 ? 'Anticipo' : 'Aduana'}
                      </Typography>
                      
                      {needsPayment ? (
                        <Button 
                          variant="contained" 
                          color="error" 
                          startIcon={<MonetizationOnIcon />}
                          onClick={() => handleOpenPay(p)}
                        >
                          Pagar Pendiente
                        </Button>
                      ) : (
                        <Chip label="Pago al Día" color="success" />
                      )}
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
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
