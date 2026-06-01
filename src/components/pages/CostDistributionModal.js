import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, TextField, Button, Divider, Chip,
  Alert, CircularProgress, MenuItem, Select, FormControl,
  InputLabel, Stepper, Step, StepLabel, InputAdornment
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import GavelIcon from '@mui/icons-material/Gavel';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useApiService } from '@/hooks/useApiService';

const DIVISION_TYPES = [
  { value: 'equitativa', label: 'División Equitativa', desc: 'Mismo costo para todos los participantes' },
  { value: 'proporcional', label: 'División Proporcional', desc: 'Según el monto invertido por cada participante' },
];

export default function CostDistributionModal({
  open, onClose, compraGrupalId, participantesCount, onSuccess
}) {
  const { postApiService } = useApiService();
  const [step, setStep] = useState(0);
  const [costoLogistico, setCostoLogistico] = useState('');
  const [costoAduana, setCostoAduana] = useState('');
  const [tipoDivision, setTipoDivision] = useState('equitativa');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  const totalExtra = parseFloat(costoLogistico || 0) + parseFloat(costoAduana || 0);
  const porParticipante = participantesCount > 0 ? totalExtra / participantesCount : 0;

  const handleCalcular = () => {
    if (totalExtra <= 0) return;
    setStep(1);
  };

  const handleConfirmar = async () => {
    setLoading(true);
    const result = await postApiService(
      `/api/compras-grupales/${compraGrupalId}/distribuir-costos`,
      { costo_logistico: costoLogistico, costo_aduana: costoAduana, tipo_division: tipoDivision },
      { successMessage: '¡Costos distribuidos exitosamente!' }
    );
    setLoading(false);
    if (result) {
      setResultado(result);
      setStep(2);
      if (onSuccess) onSuccess(result);
    }
  };

  const handleClose = () => {
    setStep(0);
    setCostoLogistico('');
    setCostoAduana('');
    setTipoDivision('equitativa');
    setResultado(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 4, overflow: 'hidden' }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: 'white', py: 3, px: 4
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CalculateIcon sx={{ color: '#45BD62' }} />
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Distribución de Costos Adicionales
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
              Logística · Aduana · Almacenaje
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        {/* Stepper */}
        <Stepper activeStep={step} sx={{ mb: 4 }}>
          <Step><StepLabel>Ingresar Costos</StepLabel></Step>
          <Step><StepLabel>Confirmar</StepLabel></Step>
          <Step><StepLabel>Listo</StepLabel></Step>
        </Stepper>

        {/* Step 0 — Ingresar costos */}
        {step === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Estos costos se sumarán al monto de cada participante.{' '}
              <strong>{participantesCount} participantes</strong> pagarán el costo adicional.
            </Alert>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Costo Logístico"
                value={costoLogistico}
                onChange={(e) => setCostoLogistico(e.target.value)}
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LocalShippingIcon sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment>,
                  endAdornment: <InputAdornment position="end">USD</InputAdornment>
                }}
                helperText="Flete, transporte, agente"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                label="Costo Aduana"
                value={costoAduana}
                onChange={(e) => setCostoAduana(e.target.value)}
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start"><GavelIcon sx={{ fontSize: 18, color: 'text.disabled' }} /></InputAdornment>,
                  endAdornment: <InputAdornment position="end">USD</InputAdornment>
                }}
                helperText="Aranceles, DAI, IVA importación"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Box>

            <FormControl fullWidth>
              <InputLabel>Tipo de División</InputLabel>
              <Select
                value={tipoDivision}
                onChange={(e) => setTipoDivision(e.target.value)}
                label="Tipo de División"
                sx={{ borderRadius: 2 }}
              >
                {DIVISION_TYPES.map(t => (
                  <MenuItem key={t.value} value={t.value}>
                    <Box>
                      <Typography variant="body2" fontWeight={700}>{t.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{t.desc}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {totalExtra > 0 && (
              <Box sx={{ bgcolor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 3, p: 3 }}>
                <Typography variant="subtitle2" fontWeight={800} color="success.dark" gutterBottom>
                  Vista Previa del Cálculo
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Total a distribuir:</Typography>
                  <Typography variant="body2" fontWeight={700}>${totalExtra.toLocaleString()} USD</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <GroupIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">Participantes:</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={700}>{participantesCount}</Typography>
                </Box>
                <Divider sx={{ my: 1.5 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2" fontWeight={800}>Por participante:</Typography>
                  <Typography variant="subtitle2" fontWeight={900} color="success.main">
                    ${porParticipante.toFixed(2)} USD
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        )}

        {/* Step 1 — Confirmar */}
        {step === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              <strong>Esta acción es irreversible.</strong> Se notificará a cada participante con el ajuste de su monto.
            </Alert>

            <Box sx={{ bgcolor: '#f8fafc', borderRadius: 3, p: 3, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" fontWeight={800} gutterBottom color="#0f172a">
                Resumen Final
              </Typography>
              {[
                { label: 'Costo Logístico', value: `$${parseFloat(costoLogistico || 0).toFixed(2)} USD` },
                { label: 'Costo Aduana', value: `$${parseFloat(costoAduana || 0).toFixed(2)} USD` },
                { label: 'Total Extra', value: `$${totalExtra.toFixed(2)} USD` },
                { label: 'División', value: DIVISION_TYPES.find(t => t.value === tipoDivision)?.label },
                { label: 'Participantes', value: participantesCount },
              ].map(row => (
                <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px dashed', borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary">{row.label}</Typography>
                  <Typography variant="body2" fontWeight={700}>{row.value}</Typography>
                </Box>
              ))}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
                <Typography variant="subtitle1" fontWeight={800}>Ajuste por participante</Typography>
                <Chip label={`+$${porParticipante.toFixed(2)} USD`} color="warning" size="small" sx={{ fontWeight: 800 }} />
              </Box>
            </Box>
          </Box>
        )}

        {/* Step 2 — Éxito */}
        {step === 2 && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" fontWeight={800} gutterBottom>
              ¡Costos Distribuidos!
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Se han actualizado los montos de los {resultado?.distribuido || participantesCount} participantes.
              Cada uno tiene un ajuste de{' '}
              <strong>${resultado?.costoPorParticipante?.toFixed(2) || porParticipante.toFixed(2)} USD</strong>.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 4, py: 3, borderTop: '1px solid', borderColor: 'divider', gap: 1 }}>
        {step === 0 && (
          <>
            <Button onClick={handleClose} sx={{ borderRadius: 2 }}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={handleCalcular}
              disabled={totalExtra <= 0 || !participantesCount}
              sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}
            >
              Calcular Distribución
            </Button>
          </>
        )}
        {step === 1 && (
          <>
            <Button onClick={() => setStep(0)} sx={{ borderRadius: 2 }}>Atrás</Button>
            <Button
              variant="contained"
              color="warning"
              onClick={handleConfirmar}
              disabled={loading}
              sx={{ borderRadius: 2, fontWeight: 800, px: 3 }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Confirmar y Distribuir'}
            </Button>
          </>
        )}
        {step === 2 && (
          <Button variant="contained" onClick={handleClose} fullWidth sx={{ borderRadius: 2, fontWeight: 700 }}>
            Cerrar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
