import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Paper, TextField, MenuItem, Button,
  Table, TableBody, TableCell, TableContainer, TableRow,
  Divider, Card, CardContent, InputAdornment, Stack, Switch, FormControlLabel
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SecurityIcon from '@mui/icons-material/Security';

// Bolivia Tariff / Gravamen Arancelario (GA) rates by typical categories
const CATEGORIES = [
  { id: 'general', name: 'Mercadería General (Accesorios, Herramientas)', ga: 10 },
  { id: 'electronics', name: 'Electrónicos (Celulares, Laptops, Tablets)', ga: 5 },
  { id: 'clothing', name: 'Ropa, Calzado y Textiles', ga: 40 },
  { id: 'cosmetics', name: 'Cosméticos y Cuidado Personal', ga: 20 },
  { id: 'machinery', name: 'Maquinaria Industrial y Repuestos', ga: 0 },
  { id: 'auto', name: 'Autopartes y Accesorios Vehiculares', ga: 15 }
];

const BOLIVIA_IVA = 14.94; // Effective VAT rate in Bolivia for imports (14.94%)
const SEGURIDAD_RATE = 1.5; // Insurance percentage (1.5% of CIF)

export default function CalculadoraImportacion() {
  // Inputs
  const [shippingMethod, setShippingMethod] = useState('air'); // 'air' or 'maritime'
  const [fobValue, setFobValue] = useState(150);
  const [weight, setWeight] = useState(5);
  const [length, setLength] = useState(30);
  const [width, setWidth] = useState(20);
  const [height, setHeight] = useState(15);
  const [category, setCategory] = useState('general');
  const [hasInsurance, setHasInsurance] = useState(true);

  // Outputs / Calculations
  const [results, setResults] = useState(null);

  const calculateCosts = () => {
    const fob = parseFloat(fobValue) || 0;
    const kg = parseFloat(weight) || 0;
    const l = parseFloat(length) || 0;
    const w = parseFloat(width) || 0;
    const h = parseFloat(height) || 0;

    // Volume calculations
    const volumeCbm = (l * w * h) / 1000000;

    // Shipping rates (Flete)
    // Aéreo: $8.5 USD por kg. Marítimo: $290 USD por CBM (mínimo 0.1 CBM)
    let shippingCost = 0;
    if (shippingMethod === 'air') {
      shippingCost = kg * 8.5;
    } else {
      const billableVolume = Math.max(volumeCbm, 0.1);
      shippingCost = billableVolume * 290;
    }

    // Insurance (Seguro)
    const insuranceCost = hasInsurance ? (fob + shippingCost) * (SEGURIDAD_RATE / 100) : 0;

    // CIF Value (FOB + Shipping + Insurance)
    const cif = fob + shippingCost + insuranceCost;

    // Customs Taxes (Bolivia)
    // GA (Gravamen Arancelario)
    const categoryObj = CATEGORIES.find(c => c.id === category);
    const gaRate = categoryObj ? categoryObj.ga : 10;
    const gaCost = cif * (gaRate / 100);

    // IVA (Impuesto al Valor Agregado) - Base imponible is CIF + GA
    const baseIva = cif + gaCost;
    const ivaCost = baseIva * (BOLIVIA_IVA / 100);

    const totalCustomsTaxes = gaCost + ivaCost;

    // ImportaColectiva Commission / Handling Fee
    // Collective shipping saves money: service commission is only 5% of FOB (min $10)
    // Solo shipping (non-cooperative) would be 12% of FOB (min $25)
    const serviceFeeCooperative = Math.max(fob * 0.05, 10);
    const serviceFeeSolo = Math.max(fob * 0.12, 25);

    // Total Cost
    const totalCooperative = cif + totalCustomsTaxes + serviceFeeCooperative;

    // Solo importing would also have higher freight costs (+35% due to lack of volume discount)
    const soloShippingCost = shippingCost * 1.35;
    const soloCif = fob + soloShippingCost + (hasInsurance ? (fob + soloShippingCost) * (SEGURIDAD_RATE / 100) : 0);
    const soloGaCost = soloCif * (gaRate / 100);
    const soloIvaCost = (soloCif + soloGaCost) * (BOLIVIA_IVA / 100);
    const totalSolo = soloCif + (soloGaCost + soloIvaCost) + serviceFeeSolo;

    const savings = totalSolo - totalCooperative;
    const savingsPercent = (savings / totalSolo) * 100;

    setResults({
      fob,
      volumeCbm,
      shippingCost,
      insuranceCost,
      cif,
      gaRate,
      gaCost,
      ivaCost,
      totalCustomsTaxes,
      serviceFee: serviceFeeCooperative,
      totalCost: totalCooperative,
      totalSolo,
      savings,
      savingsPercent
    });
  };

  useEffect(() => {
    calculateCosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shippingMethod, fobValue, weight, length, width, height, category, hasInsurance]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <CalculateIcon color="primary" sx={{ fontSize: 40 }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: '-0.03em' }}>
            Simulador de Costos Pro
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Estima el costo real de tu importación puerta a puerta en Bolivia con desglose de aranceles y flete.
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Form Column */}
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, height: '100%' }}>
            <Typography variant="h6" fontWeight={800} mb={3}>
              Parámetros de Importación
            </Typography>

            <Typography variant="subtitle2" fontWeight={700} mb={1.5} color="text.secondary">
              Método de Envío
            </Typography>
            <Grid container spacing={3} pb={10}>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant={shippingMethod === 'air' ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => setShippingMethod('air')}
                  startIcon={<FlightTakeoffIcon />}
                  sx={{ py: 1.5, borderRadius: 3, fontWeight: 700 }}
                >
                  Aéreo
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant={shippingMethod === 'maritime' ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => setShippingMethod('maritime')}
                  startIcon={<DirectionsBoatIcon />}
                  sx={{ py: 1.5, borderRadius: 3, fontWeight: 700 }}
                >
                  Marítimo
                </Button>
              </Grid>
            </Grid>

            <Stack spacing={2.5}>
              <TextField
                select
                label="Categoría del Producto (Arancel GA)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                fullWidth
                variant="outlined"
                slotProps={{
                  input: { sx: { borderRadius: 3, fontWeight: 600 } }
                }}
              >
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id} sx={{ fontWeight: 600 }}>
                    {cat.name} ({cat.ga}% GA)
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Valor de la Mercadería (FOB)"
                type="number"
                value={fobValue}
                onChange={(e) => setFobValue(Math.max(0, parseFloat(e.target.value) || 0))}
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    endAdornment: <InputAdornment position="end">USD</InputAdornment>,
                    sx: { borderRadius: 3, fontWeight: 600 }
                  }
                }}
              />

              <TextField
                label="Peso del Paquete"
                type="number"
                value={weight}
                onChange={(e) => setWeight(Math.max(0.1, parseFloat(e.target.value) || 0))}
                fullWidth
                slotProps={{
                  input: {
                    endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                    sx: { borderRadius: 3, fontWeight: 600 }
                  }
                }}
              />

              <Box>
                <Typography variant="subtitle2" fontWeight={700} mb={1} color="text.secondary">
                  Dimensiones del Paquete (para cálculo volumétrico)
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <TextField
                      label="Largo"
                      type="number"
                      value={length}
                      onChange={(e) => setLength(Math.max(1, parseFloat(e.target.value) || 0))}
                      slotProps={{ input: { endAdornment: <InputAdornment position="end">cm</InputAdornment>, sx: { borderRadius: 3, fontWeight: 600 } } }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Ancho"
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(Math.max(1, parseFloat(e.target.value) || 0))}
                      slotProps={{ input: { endAdornment: <InputAdornment position="end">cm</InputAdornment>, sx: { borderRadius: 3, fontWeight: 600 } } }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Alto"
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(Math.max(1, parseFloat(e.target.value) || 0))}
                      slotProps={{ input: { endAdornment: <InputAdornment position="end">cm</InputAdornment>, sx: { borderRadius: 3, fontWeight: 600 } } }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={hasInsurance}
                    onChange={(e) => setHasInsurance(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={700}>Añadir Seguro contra Pérdidas</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Cubre el 100% del valor en aduanas ante siniestros. (1.5% CIF)
                    </Typography>
                  </Box>
                }
              />
            </Stack>
          </Paper>
        </Grid>

        {/* Results Column */}
        <Grid item xs={12} md={7}>
          {results && (
            <Stack spacing={3} sx={{ height: '100%' }}>
              {/* Savings Card */}
              <Card sx={{
                bgcolor: 'success.light',
                color: 'success.dark',
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'success.main',
                boxShadow: '0 4px 20px rgba(76, 175, 80, 0.15)'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Ahorro Colectivo Estimado
                      </Typography>
                      <Typography variant="h3" fontWeight={900} sx={{ my: 0.5 }}>
                        ${results.savings.toFixed(2)} USD
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, opacity: 0.9 }}>
                        Ahorras un {results.savingsPercent.toFixed(1)}% comparado con importar de forma individual.
                      </Typography>
                    </Box>
                    <Box sx={{ bgcolor: 'white', p: 1.5, borderRadius: '50%', color: 'success.main', display: 'flex' }}>
                      <TrendingDownIcon sx={{ fontSize: 36 }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* Detailed Breakdown */}
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, flexGrow: 1 }}>
                <Typography variant="h6" fontWeight={800} mb={2}>
                  Desglose de Costos de Importación
                </Typography>

                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)', fontWeight: 600 }}>Valor del Producto (FOB)</TableCell>
                        <TableCell align="right" sx={{ py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)', fontWeight: 700 }}>${results.fob.toFixed(2)} USD</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)', fontWeight: 600 }}>
                          Flete Internacional ({shippingMethod === 'air' ? 'Aéreo' : 'Marítimo'})
                        </TableCell>
                        <TableCell align="right" sx={{ py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)', fontWeight: 700 }}>${results.shippingCost.toFixed(2)} USD</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)', fontWeight: 600 }}>Seguro Carga</TableCell>
                        <TableCell align="right" sx={{ py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)', fontWeight: 700 }}>${results.insuranceCost.toFixed(2)} USD</TableCell>
                      </TableRow>

                      <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                        <TableCell sx={{ py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)', fontWeight: 800 }}>Valor CIF (Frontera/Aduana)</TableCell>
                        <TableCell align="right" sx={{ py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)', fontWeight: 800 }}>${results.cif.toFixed(2)} USD</TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell sx={{ py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)', fontWeight: 600 }}>
                          Gravamen Arancelario (GA {results.gaRate}%)
                        </TableCell>
                        <TableCell align="right" sx={{ py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)', fontWeight: 700 }}>${results.gaCost.toFixed(2)} USD</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)', fontWeight: 600 }}>
                          Impuesto IVA (14.94% Base CIF+GA)
                        </TableCell>
                        <TableCell align="right" sx={{ py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)', fontWeight: 700 }}>${results.ivaCost.toFixed(2)} USD</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)', fontWeight: 600 }}>Comisión de Operación Colectiva (5%)</TableCell>
                        <TableCell align="right" sx={{ py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.06)', fontWeight: 700 }}>${results.serviceFee.toFixed(2)} USD</TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell sx={{ py: 2, borderBottom: 'none' }}>
                          <Typography variant="subtitle1" fontWeight={900} color="primary.main">
                            Total Importación Estimado
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Aproximadamente Bs. {(results.totalCost * 6.96).toLocaleString(undefined, { maximumFractionDigits: 2 })} (Tasa oficial 6.96)
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ py: 2, borderBottom: 'none' }}>
                          <Typography variant="h5" fontWeight={900} color="primary.main">
                            ${results.totalCost.toFixed(2)} USD
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.light', color: 'primary.main', borderRadius: 3, display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  <InfoOutlinedIcon sx={{ mt: 0.2 }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, lineHeight: 1.4 }}>
                    Nota: Los cálculos arancelarios presentados corresponden a las tasas vigentes de la Aduana Nacional de Bolivia. Los montos de transporte son aproximados y pueden variar de acuerdo a la cotización final de las navieras asociadas.
                  </Typography>
                </Box>
              </Paper>
            </Stack>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
