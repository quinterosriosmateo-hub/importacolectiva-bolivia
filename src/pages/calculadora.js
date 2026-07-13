import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Paper, TextField, MenuItem, Button,
  Table, TableBody, TableCell, TableContainer, TableRow,
  Divider, Card, CardContent, InputAdornment, Stack, Switch, FormControlLabel,
  Tooltip, Alert, AlertTitle, Slider, Chip, Select, FormControl, InputLabel
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SecurityIcon from '@mui/icons-material/Security';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Bolivia Tariff / Gravamen Arancelario (GA) rates by typical categories
const CATEGORIES = [
  { id: 'general', name: 'Mercadería General (Accesorios, Hogar, Herramientas)', ga: 10, warning: '' },
  { id: 'electronics', name: 'Tecnología (Laptops, Tablets, Celulares, Componentes)', ga: 5, warning: '' },
  { id: 'clothing', name: 'Ropa, Calzado y Textiles (Arancel Elevado)', ga: 40, warning: '⚠️ Arancel Elevado (40%): Aplicado en Bolivia para proteger la industria textil nacional. Puede incrementar significativamente el costo de importación.' },
  { id: 'cosmetics', name: 'Cosméticos y Cuidado Personal (Regulado)', ga: 20, warning: '🧴 Regulación de AGEMED: La importación de cosméticos y perfumes con fines comerciales requiere registro sanitario obligatorio en Bolivia.' },
  { id: 'toys', name: 'Juguetes y Artículos de Entretenimiento', ga: 20, warning: '' },
  { id: 'machinery', name: 'Maquinaria Industrial, Repuestos y Herramientas', ga: 0, warning: '⚙️ Fomento Industrial: Arancel preferencial del 0% para fomentar la producción, tecnología y manufactura local.' },
  { id: 'auto', name: 'Autopartes y Accesorios Vehiculares', ga: 15, warning: '' }
];

// Delivery locations in Bolivia and their logistical surcharge
const LOCATIONS = [
  { id: 'lp_ea', name: 'La Paz / El Alto (Base Central)', airSurcharge: 0, seaSurcharge: 0 },
  { id: 'scz', name: 'Santa Cruz (Hub Oriente)', airSurcharge: 1.5, seaSurcharge: 25 },
  { id: 'cbba', name: 'Cochabamba (Eje Central)', airSurcharge: 1.2, seaSurcharge: 20 },
  { id: 'or_pt_su', name: 'Oruro / Potosí / Sucre', airSurcharge: 1.8, seaSurcharge: 30 },
  { id: 'tj', name: 'Tarija (Sur)', airSurcharge: 2.2, seaSurcharge: 35 },
  { id: 'bn_pd', name: 'Beni / Pando (Norte / Amazonía)', airSurcharge: 3.5, seaSurcharge: 55 }
];

const BOLIVIA_IVA = 14.94; // Effective VAT rate in Bolivia for imports (14.94% because base for VAT is CIF + GA)
const SEGURIDAD_RATE = 1.5; // Insurance percentage (1.5% of CIF)

export default function CalculadoraImportacion() {
  // --- Inputs ---
  const [shippingMethod, setShippingMethod] = useState('air'); // 'air' or 'maritime'
  const [fobValue, setFobValue] = useState(350);
  const [weight, setWeight] = useState(8);
  const [length, setLength] = useState(40);
  const [width, setWidth] = useState(30);
  const [height, setHeight] = useState(25);
  const [category, setCategory] = useState('general');
  const [hasInsurance, setHasInsurance] = useState(true);
  const [deliveryLocation, setDeliveryLocation] = useState('lp_ea');
  
  // Financial Inputs (Bolivia context)
  const [exchangeRateType, setExchangeRateType] = useState('parallel'); // 'official' or 'parallel'
  const [parallelRate, setParallelRate] = useState(11.50); // Typical parallel market exchange rate in 2026
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'none', 'card', 'swift', 'custom'
  const [bankCommission, setBankCommission] = useState(15); // Percentage
  const [customsMode, setCustomsMode] = useState('auto'); // 'auto', 'menor', 'mayor'

  // --- Display Options ---
  const [displayCurrency, setDisplayCurrency] = useState('USD'); // 'USD' or 'BOB'

  // --- Mode: 'simple' shows only the essentials, 'advanced' unlocks every technical field ---
  const [mode, setMode] = useState('simple');

  // --- Saved Simulations State ---
  const [savedSimulations, setSavedSimulations] = useState([]);
  const [simName, setSimName] = useState('');

  // Load Saved Simulations on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('import_simulations');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Avoid triggering set-state-in-effect by scheduling the state update asynchronously
          setTimeout(() => {
            setSavedSimulations(parsed);
          }, 0);
        } catch (e) {
          console.error('Error loading simulations:', e);
        }
      }
    }
  }, []);

  // Handle payment method change (set both states inside event handler, avoiding useEffect)
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    if (method === 'none') {
      setBankCommission(0);
    } else if (method === 'card') {
      setBankCommission(15);
    } else if (method === 'swift') {
      setBankCommission(22);
    }
  };

  // --- Calculations (Computed directly on render to avoid cascading updates and satisfy React standards) ---
  const fob = parseFloat(fobValue) || 0;
  const kg = parseFloat(weight) || 0;
  const l = parseFloat(length) || 0;
  const w = parseFloat(width) || 0;
  const h = parseFloat(height) || 0;

  // 1. Volume Calculation
  const volumeCbm = (l * w * h) / 1000000;

  // 2. Shipping rates (Flete Internacional)
  let shippingBaseCoop = 0;
  let shippingBaseSolo = 0;
  if (shippingMethod === 'air') {
    shippingBaseCoop = kg * 8.5;
    shippingBaseSolo = kg * 8.5 * 1.35;
  } else {
    const billableVolume = Math.max(volumeCbm, 0.1);
    shippingBaseCoop = billableVolume * 290;
    shippingBaseSolo = billableVolume * 290 * 1.35;
  }

  // 3. Delivery location surcharge (Flete nacional interno en Bolivia)
  const locObj = LOCATIONS.find(loc => loc.id === deliveryLocation) || LOCATIONS[0];
  const airSurcharge = locObj.airSurcharge * kg;
  const seaSurcharge = locObj.seaSurcharge;
  
  const deliverySurchargeCoop = shippingMethod === 'air' ? airSurcharge : seaSurcharge;
  const deliverySurchargeSolo = shippingMethod === 'air' ? airSurcharge * 1.25 : seaSurcharge * 1.30;

  const shippingCostCoop = shippingBaseCoop + deliverySurchargeCoop;
  const shippingCostSolo = shippingBaseSolo + deliverySurchargeSolo;

  // 4. Insurance (Seguro de Pérdidas, 1.5% del valor CIF en aduanas)
  const insuranceCostCoop = hasInsurance ? (fob + shippingCostCoop) * (SEGURIDAD_RATE / 100) : 0;
  const insuranceCostSolo = hasInsurance ? (fob + shippingCostSolo) * (SEGURIDAD_RATE / 100) : 0;

  // 5. CIF Value (FOB + Shipping + Insurance) - Aduanas Base
  const cifCoop = fob + shippingCostCoop + insuranceCostCoop;
  const cifSolo = fob + shippingCostSolo + insuranceCostSolo;

  // 6. Customs Taxes (Bolivia)
  const categoryObj = CATEGORIES.find(c => c.id === category) || CATEGORIES[0];
  const gaRate = categoryObj.ga;

  // Gravamen Arancelario (GA)
  const gaCostCoopUSD = cifCoop * (gaRate / 100);
  const gaCostSoloUSD = cifSolo * (gaRate / 100);

  // IVA (14.94% Base CIF + GA)
  const ivaCostCoopUSD = (cifCoop + gaCostCoopUSD) * (BOLIVIA_IVA / 100);
  const ivaCostSoloUSD = (cifSolo + gaCostSoloUSD) * (BOLIVIA_IVA / 100);

  const taxesCoopUSD = gaCostCoopUSD + ivaCostCoopUSD;
  const taxesSoloUSD = gaCostSoloUSD + ivaCostSoloUSD;

  // Impuestos pagados en Bolivianos al Banco Unión al Tipo de Cambio Oficial (6.96)
  const taxesCoopBOB = taxesCoopUSD * 6.96;
  const taxesSoloBOB = taxesSoloUSD * 6.96;

  // Tipo de cambio de adquisición real (Oficial vs Paralelo)
  const acqRate = exchangeRateType === 'official' ? 6.96 : parseFloat(parallelRate) || 11.50;

  // Costo real en USD para pagar los impuestos de aduana (Tributos pagados en Bs. / Tipo de cambio adquisición)
  const taxesCoopRealUSD = taxesCoopBOB / acqRate;
  const taxesSoloRealUSD = taxesSoloBOB / acqRate;

  // 7. Bank Commission (Sobrecargo por escasez de dólares en Bolivia / Pago exterior)
  const bankCommPercent = parseFloat(bankCommission) || 0;
  const bankCommissionCoopUSD = (fob + shippingCostCoop) * (bankCommPercent / 100);
  const bankCommissionSoloUSD = (fob + shippingCostSolo) * (bankCommPercent / 100);

  // 8. Customs Brokerage & Port Fees (Despachante, ALBO, Sidunea)
  const isMayorCuantia = customsMode === 'mayor' || (customsMode === 'auto' && fob >= 2000);
  
  let customsBrokerageCoopUSD = 0;
  let customsBrokerageSoloUSD = 0;

  if (isMayorCuantia) {
    customsBrokerageCoopUSD = 50 + 20 + 5; // Despachante + Almacén + Tasas consolidada
    const despSolo = Math.max(cifSolo * 0.015, 150);
    const alboSolo = Math.max(cifSolo * 0.005, 50);
    customsBrokerageSoloUSD = despSolo + alboSolo + 15;
  } else {
    customsBrokerageCoopUSD = 0; 
    customsBrokerageSoloUSD = 10; 
  }

  // 9. ImportaColectiva Commission / Service Fee
  const serviceFeeCoopUSD = Math.max(fob * 0.05, 10);
  const serviceFeeSoloUSD = Math.max(fob * 0.12, 25);

  // 10. TOTAL COST CALCULATIONS (Costo Adquisición Total Real)
  const totalCoopUSD = fob + shippingCostCoop + insuranceCostCoop + bankCommissionCoopUSD + taxesCoopRealUSD + customsBrokerageCoopUSD + serviceFeeCoopUSD;
  const totalSoloUSD = fob + shippingCostSolo + insuranceCostSolo + bankCommissionSoloUSD + taxesSoloRealUSD + customsBrokerageSoloUSD + serviceFeeSoloUSD;

  // Costos Totales en Bolivianos (Efectivo)
  const totalCoopBOB = (fob + shippingCostCoop + insuranceCostCoop + bankCommissionCoopUSD + customsBrokerageCoopUSD + serviceFeeCoopUSD) * acqRate + taxesCoopBOB;
  const totalSoloBOB = (fob + shippingCostSolo + insuranceCostSolo + bankCommissionSoloUSD + customsBrokerageSoloUSD + serviceFeeSoloUSD) * acqRate + taxesSoloBOB;

  // 11. Savings
  const savingsUSD = totalSoloUSD - totalCoopUSD;
  const savingsBOB = totalSoloBOB - totalCoopBOB;
  const savingsPercent = Math.max(0, (savingsUSD / totalSoloUSD) * 100);

  // 12. Visual Cost Breakdown Percentages
  const fobCost = fob;
  const logisticsCost = shippingCostCoop + insuranceCostCoop;
  const taxesCost = taxesCoopRealUSD;
  const servicesCost = bankCommissionCoopUSD + customsBrokerageCoopUSD + serviceFeeCoopUSD;

  const totalCoopForDistribution = fobCost + logisticsCost + taxesCost + servicesCost;
  const fobPercent = totalCoopForDistribution > 0 ? (fobCost / totalCoopForDistribution) * 100 : 0;
  const logisticsPercent = totalCoopForDistribution > 0 ? (logisticsCost / totalCoopForDistribution) * 100 : 0;
  const taxesPercent = totalCoopForDistribution > 0 ? (taxesCost / totalCoopForDistribution) * 100 : 0;
  const commissionsPercent = totalCoopForDistribution > 0 ? (servicesCost / totalCoopForDistribution) * 100 : 0;

  // Handle Simulation Saving to LocalStorage
  const handleSaveSimulation = () => {
    if (!simName.trim()) return;
    const newSim = {
      id: Date.now(),
      name: simName.trim(),
      inputs: {
        shippingMethod,
        fobValue,
        weight,
        length,
        width,
        height,
        category,
        hasInsurance,
        deliveryLocation,
        exchangeRateType,
        parallelRate,
        paymentMethod,
        bankCommission,
        customsMode
      }
    };
    const updated = [...savedSimulations, newSim].slice(-5);
    setSavedSimulations(updated);
    localStorage.setItem('import_simulations', JSON.stringify(updated));
    setSimName('');
  };

  const handleLoadSimulation = (sim) => {
    const { inputs } = sim;
    if (inputs) {
      if (inputs.shippingMethod) setShippingMethod(inputs.shippingMethod);
      if (inputs.fobValue !== undefined) setFobValue(inputs.fobValue);
      if (inputs.weight !== undefined) setWeight(inputs.weight);
      if (inputs.length !== undefined) setLength(inputs.length);
      if (inputs.width !== undefined) setWidth(inputs.width);
      if (inputs.height !== undefined) setHeight(inputs.height);
      if (inputs.category) setCategory(inputs.category);
      if (inputs.hasInsurance !== undefined) setHasInsurance(inputs.hasInsurance);
      if (inputs.deliveryLocation) setDeliveryLocation(inputs.deliveryLocation);
      if (inputs.exchangeRateType) setExchangeRateType(inputs.exchangeRateType);
      if (inputs.parallelRate !== undefined) setParallelRate(inputs.parallelRate);
      if (inputs.paymentMethod) setPaymentMethod(inputs.paymentMethod);
      if (inputs.bankCommission !== undefined) setBankCommission(inputs.bankCommission);
      if (inputs.customsMode) setCustomsMode(inputs.customsMode);
    }
  };

  const handleDeleteSimulation = (id, e) => {
    e.stopPropagation();
    const updated = savedSimulations.filter(s => s.id !== id);
    setSavedSimulations(updated);
    localStorage.setItem('import_simulations', JSON.stringify(updated));
  };

  // Render display value helper
  const renderVal = (usdVal, bobVal, prefix = '', suffix = '') => {
    if (displayCurrency === 'USD') {
      return `${prefix}$${usdVal.toFixed(2)} USD${suffix}`;
    } else {
      return `${prefix}${bobVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.${suffix}`;
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1250, mx: 'auto', bgcolor: '#f8fafc', minHeight: '100vh', borderRadius: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ bgcolor: 'primary.main', p: 1, borderRadius: 3, display: 'flex', color: 'white' }}>
            <CalculateIcon sx={{ fontSize: 36 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: '-0.03em' }}>
              ¿Cuánto me cuesta traer esto a Bolivia?
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {mode === 'simple'
                ? 'Cuéntanos qué quieres importar y te decimos cuánto pagarás en total, sin sorpresas.'
                : 'Herramienta avanzada: tasa paralela, impuestos de aduana y comisiones de divisas configurables.'}
            </Typography>
          </Box>
        </Box>

        <Stack spacing={1} alignItems={{ xs: 'stretch', sm: 'flex-end' }}>
          {/* Simple / Advanced Toggle */}
          <Paper variant="outlined" sx={{ p: 0.5, borderRadius: 3, display: 'flex', gap: 0.5, bgcolor: '#ffffff' }}>
            <Tooltip title="Solo lo esencial: precio, peso, categoría y el resultado final claro.">
              <Button
                size="small"
                variant={mode === 'simple' ? 'contained' : 'text'}
                color="secondary"
                onClick={() => setMode('simple')}
                sx={{ px: 2, borderRadius: 2.5, fontWeight: 700 }}
              >
                🙂 Modo Simple
              </Button>
            </Tooltip>
            <Tooltip title="Desbloquea todos los detalles técnicos: tipo de cambio, comisiones bancarias, modalidad aduanera.">
              <Button
                size="small"
                variant={mode === 'advanced' ? 'contained' : 'text'}
                color="secondary"
                onClick={() => setMode('advanced')}
                sx={{ px: 2, borderRadius: 2.5, fontWeight: 700 }}
              >
                🛠️ Modo Avanzado
              </Button>
            </Tooltip>
          </Paper>

          {/* Currency Toggle */}
          <Paper variant="outlined" sx={{ p: 0.5, borderRadius: 3, display: 'flex', gap: 0.5, bgcolor: '#ffffff' }}>
            <Button
              size="small"
              variant={displayCurrency === 'USD' ? 'contained' : 'text'}
              color="primary"
              onClick={() => setDisplayCurrency('USD')}
              sx={{ px: 2, borderRadius: 2.5, fontWeight: 700 }}
            >
              Dólares (USD)
            </Button>
            <Button
              size="small"
              variant={displayCurrency === 'BOB' ? 'contained' : 'text'}
              color="primary"
              onClick={() => setDisplayCurrency('BOB')}
              sx={{ px: 2, borderRadius: 2.5, fontWeight: 700 }}
            >
              Bolivianos (BOB)
            </Button>
          </Paper>
        </Stack>
      </Box>

      <Grid container spacing={4}>
        {/* LEFT COLUMN: Inputs */}
        <Grid item xs={12} lg={5.5}>
          <Stack spacing={3}>
            {/* 1. CARGO DETAILS */}
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, bgcolor: '#ffffff', border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle1" fontWeight={800} color="primary.main" mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span style={{ fontSize: '1.25rem' }}>📦</span> ¿Qué vas a traer?
              </Typography>
              
              <Stack spacing={2.5}>
                <FormControl fullWidth>
                  <InputLabel id="category-label" sx={{ fontWeight: 600 }}>Tipo de producto</InputLabel>
                  <Select
                    labelId="category-label"
                    value={category}
                    label="Tipo de producto"
                    onChange={(e) => setCategory(e.target.value)}
                    sx={{ borderRadius: 3, fontWeight: 600 }}
                  >
                    {CATEGORIES.map((cat) => (
                      <MenuItem key={cat.id} value={cat.id} sx={{ fontWeight: 600 }}>
                        {cat.name}{mode === 'advanced' ? ` (${cat.ga}% impuesto)` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75, ml: 0.5 }}>
                    Elige la opción que más se parezca a tu producto. Cada categoría paga un impuesto de importación distinto.
                  </Typography>
                </FormControl>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="¿Cuánto cuesta el producto?"
                      type="number"
                      value={fobValue}
                      onChange={(e) => setFobValue(Math.max(0, parseFloat(e.target.value) || 0))}
                      fullWidth
                      helperText="El precio que pagas al vendedor, sin envío"
                      slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          endAdornment: <InputAdornment position="end">USD</InputAdornment>,
                          sx: { borderRadius: 3, fontWeight: 600 }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="¿Cuánto pesa?"
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(Math.max(0.1, parseFloat(e.target.value) || 0))}
                      fullWidth
                      helperText="Peso aproximado del paquete"
                      slotProps={{
                        input: {
                          endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                          sx: { borderRadius: 3, fontWeight: 600 }
                        }
                      }}
                    />
                  </Grid>
                </Grid>

                {(shippingMethod === 'maritime' || mode === 'advanced') && (
                  <Box>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1, textTransform: 'uppercase' }}>
                      Tamaño de la caja {shippingMethod === 'maritime' ? '(necesario para transporte marítimo)' : '(solo si usas barco)'}
                    </Typography>
                    <Grid container spacing={1.5}>
                      <Grid item xs={4}>
                        <TextField
                          label="Largo"
                          type="number"
                          size="small"
                          value={length}
                          onChange={(e) => setLength(Math.max(1, parseFloat(e.target.value) || 0))}
                          slotProps={{ input: { endAdornment: <InputAdornment position="end" style={{ fontSize: '10px' }}>cm</InputAdornment>, sx: { borderRadius: 2.5, fontWeight: 600 } } }}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          label="Ancho"
                          type="number"
                          size="small"
                          value={width}
                          onChange={(e) => setWidth(Math.max(1, parseFloat(e.target.value) || 0))}
                          slotProps={{ input: { endAdornment: <InputAdornment position="end" style={{ fontSize: '10px' }}>cm</InputAdornment>, sx: { borderRadius: 2.5, fontWeight: 600 } } }}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          label="Alto"
                          type="number"
                          size="small"
                          value={height}
                          onChange={(e) => setHeight(Math.max(1, parseFloat(e.target.value) || 0))}
                          slotProps={{ input: { endAdornment: <InputAdornment position="end" style={{ fontSize: '10px' }}>cm</InputAdornment>, sx: { borderRadius: 2.5, fontWeight: 600 } } }}
                        />
                      </Grid>
                    </Grid>
                    {mode === 'advanced' && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        Volumen calculado: <strong>{volumeCbm.toFixed(4)} CBM</strong> (m³). Se usa para calcular el flete marítimo.
                      </Typography>
                    )}
                  </Box>
                )}
              </Stack>
            </Paper>

            {/* 2. LOGISTICS AND SHIPPING */}
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, bgcolor: '#ffffff', border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle1" fontWeight={800} color="primary.main" mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span style={{ fontSize: '1.25rem' }}>✈️</span> ¿Cómo lo traes y a dónde?
              </Typography>

              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} mb={1} color="text.secondary">
                    ¿En avión o en barco?
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant={shippingMethod === 'air' ? 'contained' : 'outlined'}
                        color={shippingMethod === 'air' ? 'primary' : 'inherit'}
                        onClick={() => setShippingMethod('air')}
                        startIcon={<FlightTakeoffIcon />}
                        sx={{
                          py: 1.5,
                          borderRadius: 3,
                          fontWeight: 700,
                          borderColor: shippingMethod === 'air' ? 'primary.main' : '#cbd5e1',
                          '&:hover': { bgcolor: shippingMethod === 'air' ? 'primary.main' : '#f1f5f9' }
                        }}
                      >
                        Avión (Rápido)
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant={shippingMethod === 'maritime' ? 'contained' : 'outlined'}
                        color={shippingMethod === 'maritime' ? 'primary' : 'inherit'}
                        onClick={() => setShippingMethod('maritime')}
                        startIcon={<DirectionsBoatIcon />}
                        sx={{
                          py: 1.5,
                          borderRadius: 3,
                          fontWeight: 700,
                          borderColor: shippingMethod === 'maritime' ? 'primary.main' : '#cbd5e1',
                          '&:hover': { bgcolor: shippingMethod === 'maritime' ? 'primary.main' : '#f1f5f9' }
                        }}
                      >
                        Barco (Más barato, más lento)
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                <FormControl fullWidth>
                  <InputLabel id="location-label" sx={{ fontWeight: 600 }}>¿A dónde te lo entregan?</InputLabel>
                  <Select
                    labelId="location-label"
                    value={deliveryLocation}
                    label="¿A dónde te lo entregan?"
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    sx={{ borderRadius: 3, fontWeight: 600 }}
                  >
                    {LOCATIONS.map((loc) => (
                      <MenuItem key={loc.id} value={loc.id} sx={{ fontWeight: 600 }}>
                        {loc.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {mode === 'advanced' && (
                  <FormControl fullWidth>
                    <InputLabel id="customs-mode-label" sx={{ fontWeight: 600 }}>Modalidad Aduanera</InputLabel>
                    <Select
                      labelId="customs-mode-label"
                      value={customsMode}
                      label="Modalidad Aduanera"
                      onChange={(e) => setCustomsMode(e.target.value)}
                      sx={{ borderRadius: 3, fontWeight: 600 }}
                    >
                      <MenuItem value="auto" sx={{ fontWeight: 600 }}>Determinar Automáticamente (Recomendado)</MenuItem>
                      <MenuItem value="menor" sx={{ fontWeight: 600 }}>Despacho Menor Cuantía (FOB &lt; $2,000)</MenuItem>
                      <MenuItem value="mayor" sx={{ fontWeight: 600 }}>Despacho Mayor Cuantía (Sujeto a Despachante)</MenuItem>
                    </Select>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75, ml: 0.5 }}>
                      En Modo Simple lo calculamos automáticamente por ti, según el valor de tu compra.
                    </Typography>
                  </FormControl>
                )}

                <FormControlLabel
                  control={
                    <Switch
                      checked={hasInsurance}
                      onChange={(e) => setHasInsurance(e.target.checked)}
                      color="secondary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={700}>Agregar seguro contra pérdidas o daños</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Cuesta un poco más, pero si algo se pierde o se rompe en el camino, te devuelven el valor completo.
                      </Typography>
                    </Box>
                  }
                />
              </Stack>
            </Paper>

            {/* 3. FINANCIAL CONTEXT BOLIVIA */}
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, bgcolor: '#ffffff', border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle1" fontWeight={800} color="primary.main" mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span style={{ fontSize: '1.25rem' }}>🇧🇴</span> Dólares y bancos en Bolivia
              </Typography>

              {mode === 'simple' ? (
                <Alert severity="info" variant="outlined" sx={{ borderRadius: 3 }}>
                  <Typography variant="body2" fontWeight={500}>
                    Estamos usando valores típicos de hoy en Bolivia: el dólar al tipo de cambio real
                    (aprox. <strong>{parallelRate.toFixed(2)} Bs. por USD</strong>) y una comisión de tarjeta de
                    aproximadamente <strong>{bankCommission}%</strong> al pagar en el exterior. Si quieres ajustar
                    estos números a tu caso, cambia a <strong>Modo Avanzado</strong> arriba.
                  </Typography>
                </Alert>
              ) : (
              <Stack spacing={2.5}>
                {/* Exchange Rate */}
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} mb={1} color="text.secondary">
                    Tipo de Cambio de Adquisición de USD
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        size="small"
                        variant={exchangeRateType === 'official' ? 'contained' : 'outlined'}
                        onClick={() => setExchangeRateType('official')}
                        sx={{ py: 1, borderRadius: 2.5, fontWeight: 600 }}
                      >
                        Oficial (6.96 Bs.)
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        size="small"
                        variant={exchangeRateType === 'parallel' ? 'contained' : 'outlined'}
                        onClick={() => setExchangeRateType('parallel')}
                        sx={{ py: 1, borderRadius: 2.5, fontWeight: 600 }}
                      >
                        Mercado Real/Paralelo
                      </Button>
                    </Grid>
                  </Grid>

                  {exchangeRateType === 'parallel' && (
                    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" fontWeight={700}>Tasa de Cambio en Mercado Real:</Typography>
                        <Typography variant="caption" fontWeight={800} color="primary.main">{parallelRate.toFixed(2)} Bs./USD</Typography>
                      </Box>
                      <Slider
                        value={parallelRate}
                        min={6.96}
                        max={15.00}
                        step={0.1}
                        onChange={(e, val) => setParallelRate(val)}
                        color="primary"
                        valueLabelDisplay="auto"
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        Ajusta este valor según la cotización real para comprar dólares o pagar saldos bancarios en Bolivia hoy.
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Bank Commissions */}
                <Box>
                  <FormControl fullWidth sx={{ mb: 1 }}>
                    <InputLabel id="payment-method-label" sx={{ fontWeight: 600 }}>Método de Pago Exterior / Tarjeta</InputLabel>
                    <Select
                      labelId="payment-method-label"
                      value={paymentMethod}
                      label="Método de Pago Exterior / Tarjeta"
                      onChange={(e) => handlePaymentMethodChange(e.target.value)}
                      sx={{ borderRadius: 3, fontWeight: 600 }}
                    >
                      <MenuItem value="none" sx={{ fontWeight: 600 }}>Efectivo USD / Giro Privado (0% comisión)</MenuItem>
                      <MenuItem value="card" sx={{ fontWeight: 600 }}>Tarjeta de Crédito/Débito Nacional (~15% de recargo)</MenuItem>
                      <MenuItem value="swift" sx={{ fontWeight: 600 }}>Transferencia SWIFT / Cuenta Exterior (~22% de comisión)</MenuItem>
                      <MenuItem value="custom" sx={{ fontWeight: 600 }}>Comisión Personalizada</MenuItem>
                    </Select>
                  </FormControl>

                  {paymentMethod === 'custom' && (
                    <Box sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 3, border: '1px solid #e2e8f0', mt: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" fontWeight={700}>Comisión de Pago Exterior:</Typography>
                        <Typography variant="caption" fontWeight={800} color="primary.main">{bankCommission}%</Typography>
                      </Box>
                      <Slider
                        value={bankCommission}
                        min={0}
                        max={35}
                        step={1}
                        onChange={(e, val) => setBankCommission(val)}
                        color="primary"
                        valueLabelDisplay="auto"
                      />
                    </Box>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Debido a la escasez de dólares, las entidades financieras bolivianas aplican comisiones a los pagos internacionales.
                  </Typography>
                </Box>
              </Stack>
              )}
            </Paper>

            {/* 4. SAVE SIMULATION PANEL (solo en Modo Avanzado) */}
            {mode === 'advanced' && (
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, bgcolor: '#ffffff', border: '1px solid #e2e8f0' }}>
              <Typography variant="subtitle2" fontWeight={800} color="primary.main" mb={1.5} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SaveIcon sx={{ fontSize: 20 }} /> Guardar Simulación Actual
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  label="Nombre de Simulación"
                  size="small"
                  fullWidth
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  placeholder="Ej: Celulares - Aéreo"
                  slotProps={{ input: { sx: { borderRadius: 2.5 } } }}
                />
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleSaveSimulation}
                  disabled={!simName.trim()}
                  sx={{ borderRadius: 2.5, px: 3, fontWeight: 700 }}
                >
                  Guardar
                </Button>
              </Box>

              {savedSimulations.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Simulaciones Guardadas (máx. 5):
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {savedSimulations.map((sim) => (
                      <Chip
                        key={sim.id}
                        label={sim.name}
                        onClick={() => handleLoadSimulation(sim)}
                        onDelete={(e) => handleDeleteSimulation(sim.id, e)}
                        deleteIcon={<DeleteIcon style={{ color: '#ef4444' }} />}
                        variant="outlined"
                        sx={{
                          fontWeight: 600,
                          borderRadius: 2,
                          borderColor: '#cbd5e1',
                          '&:hover': { bgcolor: '#f1f5f9', borderColor: 'primary.main' }
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
            )}
          </Stack>
        </Grid>

        {/* RIGHT COLUMN: Results */}
        <Grid item xs={12} lg={6.5}>
          <Stack spacing={3} sx={{ position: 'sticky', top: 24 }}>
            {/* Savings Dashboard Card */}
            <Card sx={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: 'white',
              borderRadius: 5,
              boxShadow: '0 12px 30px rgba(8, 23, 45, 0.15)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background glow graphic */}
              <Box sx={{
                position: 'absolute',
                top: '-40%',
                right: '-10%',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(126,217,87,0.3) 0%, rgba(0,0,0,0) 70%)',
                pointerEvents: 'none'
              }} />
              
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                  <Box>
                    <Chip
                      label="Beneficio ImportaColectiva"
                      color="success"
                      size="small"
                      sx={{ fontWeight: 800, mb: 1.5, textTransform: 'uppercase', borderRadius: 1.5 }}
                    />
                    <Typography variant="subtitle2" sx={{ opacity: 0.8, fontWeight: 700, letterSpacing: '0.05em' }}>
                      TE AHORRAS
                    </Typography>
                    <Typography variant="h2" fontWeight={900} sx={{ my: 0.5, color: '#7ed957', letterSpacing: '-0.02em' }}>
                      {renderVal(savingsUSD, savingsBOB)}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, opacity: 0.9 }}>
                      Eso es <strong>{savingsPercent.toFixed(1)}% menos</strong> que si lo importaras tú solo, sin compartir gastos con otras personas.
                    </Typography>
                  </Box>
                  <Box sx={{ bgcolor: 'rgba(126,217,87,0.15)', p: 2, borderRadius: '50%', color: '#7ed957', display: 'flex', border: '1px solid rgba(126,217,87,0.3)' }}>
                    <TrendingDownIcon sx={{ fontSize: 44 }} />
                  </Box>
                </Box>

                <Divider sx={{ my: 2.5, borderColor: 'rgba(255,255,255,0.1)' }} />

                {/* Comparative visual bar chart */}
                <Box>
                  <Typography variant="caption" fontWeight={700} sx={{ opacity: 0.8, display: 'block', mb: 1, textTransform: 'uppercase' }}>
                    Comparativa de Costo Total Adquisición
                  </Typography>
                  
                  {/* Coop Bar */}
                  <Box sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" fontWeight={800} color="#7ed957">Importando junto a otras personas</Typography>
                      <Typography variant="caption" fontWeight={800} color="#7ed957">
                        {renderVal(totalCoopUSD, totalCoopBOB)}
                      </Typography>
                    </Box>
                    <Box sx={{ width: '100%', height: 10, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 5, overflow: 'hidden' }}>
                      <Box sx={{
                        width: `${(totalCoopUSD / Math.max(totalCoopUSD, totalSoloUSD)) * 100}%`,
                        height: '100%',
                        bgcolor: '#7ed957',
                        borderRadius: 5,
                        transition: 'width 0.5s ease-in-out'
                      }} />
                    </Box>
                  </Box>

                  {/* Solo Bar */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" fontWeight={800} sx={{ opacity: 0.7 }}>Importando tú solo</Typography>
                      <Typography variant="caption" fontWeight={800} sx={{ opacity: 0.7 }}>
                        {renderVal(totalSoloUSD, totalSoloBOB)}
                      </Typography>
                    </Box>
                    <Box sx={{ width: '100%', height: 10, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 5, overflow: 'hidden' }}>
                      <Box sx={{
                        width: `${(totalSoloUSD / Math.max(totalCoopUSD, totalSoloUSD)) * 100}%`,
                        height: '100%',
                        bgcolor: '#94a3b8',
                        borderRadius: 5,
                        transition: 'width 0.5s ease-in-out'
                      }} />
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Warnings and Alerts Section */}
            {categoryObj.warning && (
              <Alert severity="warning" variant="outlined" sx={{ borderRadius: 3, border: '1px solid #e6c750', bgcolor: '#fffdf5' }}>
                <AlertTitle sx={{ fontWeight: 800 }}>Regulaciones y Aranceles en Bolivia</AlertTitle>
                <Typography variant="body2" fontWeight={500} color="text.primary">
                  {categoryObj.warning}
                </Typography>
              </Alert>
            )}

            {isMayorCuantia && (
              <Alert severity="info" variant="outlined" sx={{ borderRadius: 3, border: '1px solid #007bb2', bgcolor: '#f0f9ff' }}>
                <AlertTitle sx={{ fontWeight: 800 }}>Trámite de Mayor Cuantía Activado</AlertTitle>
                <Typography variant="body2" fontWeight={500} color="text.primary">
                  ⚠️ Al superar el umbral de <strong>$2,000 USD FOB</strong>, la Aduana de Bolivia exige obligatoriamente un Despachante de Aduana y almacenaje fiscal ALBO. 
                  En Importación Colectiva, <strong>compartes estos gastos a escala</strong>, reduciéndolos de cientos de dólares a montos fijos mínimos.
                </Typography>
              </Alert>
            )}

            {/* Cost Breakdown with beautiful Split progress bar */}
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, bgcolor: '#ffffff', border: '1px solid #e2e8f0' }}>
              <Typography variant="h6" fontWeight={800} color="primary.main" mb={1}>
                ¿En qué se va tu dinero?
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Así se reparte el costo total cuando importas junto a otras personas.
              </Typography>

              {/* The Split Bar */}
              <Box sx={{
                width: '100%',
                height: 28,
                borderRadius: 3,
                overflow: 'hidden',
                display: 'flex',
                my: 2,
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
              }}>
                {fobPercent > 0 && (
                  <Tooltip title={`Valor Mercadería (FOB): ${fobPercent.toFixed(1)}%`}>
                    <Box sx={{ width: `${fobPercent}%`, bgcolor: 'primary.light', transition: 'width 0.5s ease-in-out' }} />
                  </Tooltip>
                )}
                {logisticsPercent > 0 && (
                  <Tooltip title={`Flete y Logística: ${logisticsPercent.toFixed(1)}%`}>
                    <Box sx={{ width: `${logisticsPercent}%`, bgcolor: 'secondary.main', transition: 'width 0.5s ease-in-out' }} />
                  </Tooltip>
                )}
                {taxesPercent > 0 && (
                  <Tooltip title={`Tributos de Aduana (GA+IVA): ${taxesPercent.toFixed(1)}%`}>
                    <Box sx={{ width: `${taxesPercent}%`, bgcolor: 'error.main', transition: 'width 0.5s ease-in-out' }} />
                  </Tooltip>
                )}
                {commissionsPercent > 0 && (
                  <Tooltip title={`Comisión Bancaria y Operación: ${commissionsPercent.toFixed(1)}%`}>
                    <Box sx={{ width: `${commissionsPercent}%`, bgcolor: 'info.main', transition: 'width 0.5s ease-in-out' }} />
                  </Tooltip>
                )}
              </Box>

              {/* Legend */}
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'primary.light' }} />
                    <Box>
                      <Typography variant="caption" fontWeight={700} sx={{ display: 'block' }}>Producto (FOB)</Typography>
                      <Typography variant="body2" fontWeight={800}>{fobPercent.toFixed(1)}%</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'secondary.main' }} />
                    <Box>
                      <Typography variant="caption" fontWeight={700} sx={{ display: 'block' }}>Logística y Seguro</Typography>
                      <Typography variant="body2" fontWeight={800}>{logisticsPercent.toFixed(1)}%</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'error.main' }} />
                    <Box>
                      <Typography variant="caption" fontWeight={700} sx={{ display: 'block' }}>Tributos Aduana</Typography>
                      <Typography variant="body2" fontWeight={800}>{taxesPercent.toFixed(1)}%</Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'info.main' }} />
                    <Box>
                      <Typography variant="caption" fontWeight={700} sx={{ display: 'block' }}>Gestión / Banco</Typography>
                      <Typography variant="body2" fontWeight={800}>{commissionsPercent.toFixed(1)}%</Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Detailed Costs Breakdown Table */}
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, bgcolor: '#ffffff', border: '1px solid #e2e8f0' }}>
              <Typography variant="h6" fontWeight={800} color="primary.main" mb={2}>
                {mode === 'simple' ? 'Resumen de tu costo total' : 'Desglose de Costos Detallado'}
              </Typography>

              {mode === 'simple' && (
                <TableContainer sx={{ mb: 1 }}>
                  <Table size="small">
                    <TableBody>
                      <TableRow sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                        <TableCell sx={{ py: 1.5, borderBottom: '1px solid #f1f5f9', fontWeight: 600 }}>
                          Producto
                        </TableCell>
                        <TableCell align="right" sx={{ py: 1.5, borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#475569' }}>
                          {renderVal(fobCost, fobCost * acqRate)}
                        </TableCell>
                      </TableRow>
                      <TableRow sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                        <TableCell sx={{ py: 1.5, borderBottom: '1px solid #f1f5f9', fontWeight: 600 }}>
                          Envío y seguro
                        </TableCell>
                        <TableCell align="right" sx={{ py: 1.5, borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#475569' }}>
                          {renderVal(logisticsCost, logisticsCost * acqRate)}
                        </TableCell>
                      </TableRow>
                      <TableRow sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                        <TableCell sx={{ py: 1.5, borderBottom: '1px solid #f1f5f9', fontWeight: 600 }}>
                          Impuestos de aduana
                        </TableCell>
                        <TableCell align="right" sx={{ py: 1.5, borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#e11d48' }}>
                          {renderVal(taxesCost, taxesCost * acqRate)}
                        </TableCell>
                      </TableRow>
                      <TableRow sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                        <TableCell sx={{ py: 1.5, borderBottom: '1px solid #f1f5f9', fontWeight: 600 }}>
                          Comisiones y gestión
                        </TableCell>
                        <TableCell align="right" sx={{ py: 1.5, borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#475569' }}>
                          {renderVal(servicesCost, servicesCost * acqRate)}
                        </TableCell>
                      </TableRow>
                      <TableRow sx={{ bgcolor: 'rgba(126, 217, 87, 0.08)' }}>
                        <TableCell sx={{ py: 2, borderBottom: 'none' }}>
                          <Typography variant="subtitle1" fontWeight={900} color="primary.main">
                            Total a pagar
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ py: 2, borderBottom: 'none' }}>
                          <Typography variant="h5" fontWeight={900} color="success.dark">
                            {renderVal(totalCoopUSD, totalCoopBOB)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {mode === 'advanced' && (
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {/* FOB */}
                    <TableRow sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                      <TableCell sx={{ py: 1.5, borderBottom: '1px solid #f1f5f9', fontWeight: 600 }}>
                        Valor del Producto (FOB)
                        <Tooltip title="Precio neto de la mercadería en puerto de origen, sin flete ni seguro.">
                          <InfoOutlinedIcon sx={{ fontSize: 13, ml: 0.5, color: 'text.secondary', verticalAlign: 'middle' }} />
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.5, borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#475569' }}>
                        {renderVal(fob, fob * acqRate)}
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.5, borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#475569' }}>
                        {renderVal(fob, fob * acqRate)}
                      </TableCell>
                    </TableRow>

                    {/* Freight & local shipping */}
                    <TableRow sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                      <TableCell sx={{ py: 1.5, borderBottom: '1px solid #f1f5f9', fontWeight: 600 }}>
                        Flete Internacional + Local ({shippingMethod === 'air' ? 'Aéreo' : 'Marítimo'})
                        <Tooltip title="Flete de carga internacional consolidado más el recargo terrestre interno según departamento elegido en Bolivia.">
                          <InfoOutlinedIcon sx={{ fontSize: 13, ml: 0.5, color: 'text.secondary', verticalAlign: 'middle' }} />
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.5, borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: 'success.main' }}>
                        {renderVal(shippingCostCoop, shippingCostCoop * acqRate)}
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.5, borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: 'text.primary' }}>
                        {renderVal(shippingCostSolo, shippingCostSolo * acqRate)}
                      </TableCell>
                    </TableRow>

                    {/* Insurance */}
                    <TableRow sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                      <TableCell sx={{ py: 1.5, borderBottom: '1px solid #f1f5f9', fontWeight: 600 }}>
                        Seguro de Carga (1.5% CIF)
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.5, borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#475569' }}>
                        {renderVal(insuranceCostCoop, insuranceCostCoop * acqRate)}
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.5, borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#475569' }}>
                        {renderVal(insuranceCostSolo, insuranceCostSolo * acqRate)}
                      </TableCell>
                    </TableRow>

                    {/* CIF Value */}
                    <TableRow sx={{ bgcolor: 'rgba(224, 229, 235, 0.2)' }}>
                      <TableCell sx={{ py: 1.5, borderBottom: '1px solid #e2e8f0', fontWeight: 800 }}>
                        Valor CIF Aduana (Frontera)
                        <Tooltip title="FOB + Flete + Seguro. Es la base imponible sobre la cual la Aduana Nacional calcula los tributos en Bolivia.">
                          <InfoOutlinedIcon sx={{ fontSize: 13, ml: 0.5, color: 'text.secondary', verticalAlign: 'middle' }} />
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.5, borderBottom: '1px solid #e2e8f0', fontWeight: 800 }}>
                        {renderVal(cifCoop, cifCoop * acqRate)}
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.5, borderBottom: '1px solid #e2e8f0', fontWeight: 800 }}>
                        {renderVal(cifSolo, cifSolo * acqRate)}
                      </TableCell>
                    </TableRow>

                    {/* Customs GA */}
                    <TableRow sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                      <TableCell sx={{ py: 1.5, borderBottom: '1px solid #f1f5f9', fontWeight: 600 }}>
                        Gravamen Arancelario (GA {gaRate}%)
                        <Tooltip title="Impuesto aplicado al valor de aduanas CIF según la categoría del producto.">
                          <InfoOutlinedIcon sx={{ fontSize: 13, ml: 0.5, color: 'text.secondary', verticalAlign: 'middle' }} />
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.5, borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#e11d48' }}>
                        {renderVal(gaCostCoopUSD, gaCostCoopUSD * 6.96)}
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.5, borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#e11d48' }}>
                        {renderVal(gaCostSoloUSD, gaCostSoloUSD * 6.96)}
                      </TableCell>
                    </TableRow>

                    {/* Customs IVA */}
                    <TableRow sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                      <TableCell sx={{ py: 1.5, borderBottom: '1px solid #f1f5f9', fontWeight: 600 }}>
                        Impuesto IVA Importación (14.94%)
                        <Tooltip title="La tasa efectiva del IVA para importación en Bolivia es 14.94% (se calcula sobre la base de CIF + GA).">
                          <InfoOutlinedIcon sx={{ fontSize: 13, ml: 0.5, color: 'text.secondary', verticalAlign: 'middle' }} />
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.5, borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#e11d48' }}>
                        {renderVal(ivaCostCoopUSD, ivaCostCoopUSD * 6.96)}
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.5, borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#e11d48' }}>
                        {renderVal(ivaCostSoloUSD, ivaCostSoloUSD * 6.96)}
                      </TableCell>
                    </TableRow>

                    {/* Bank Outflow Commission */}
                    <TableRow sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                      <TableCell sx={{ py: 1.5, borderBottom: '1px solid #f1f5f9', fontWeight: 600 }}>
                        Comisión Bancaria / Divisas ({bankCommission}%)
                        <Tooltip title="Recargo cobrado por bancos bolivianos para la compra o uso de dólares en el exterior debido a la escasez de divisas.">
                          <InfoOutlinedIcon sx={{ fontSize: 13, ml: 0.5, color: 'text.secondary', verticalAlign: 'middle' }} />
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.5, borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#475569' }}>
                        {renderVal(bankCommissionCoopUSD, bankCommissionCoopUSD * acqRate)}
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.5, borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#475569' }}>
                        {renderVal(bankCommissionSoloUSD, bankCommissionSoloUSD * acqRate)}
                      </TableCell>
                    </TableRow>

                    {/* Despachante and DAB fees */}
                    <TableRow sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                      <TableCell sx={{ py: 1.5, borderBottom: '1px solid #f1f5f9', fontWeight: 600 }}>
                        Despacho de Aduana, ALBO y Tasas
                        <Tooltip title="Honorarios del Agente Despachante de Aduana, manipuleo portuario DAB/ALBO y tasas informáticas Sidunea. Prorrateados en Colectivo.">
                          <InfoOutlinedIcon sx={{ fontSize: 13, ml: 0.5, color: 'text.secondary', verticalAlign: 'middle' }} />
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.5, borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: 'success.main' }}>
                        {renderVal(customsBrokerageCoopUSD, customsBrokerageCoopUSD * acqRate)}
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.5, borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: 'text.primary' }}>
                        {renderVal(customsBrokerageSoloUSD, customsBrokerageSoloUSD * acqRate)}
                      </TableCell>
                    </TableRow>

                    {/* Service fee */}
                    <TableRow sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                      <TableCell sx={{ py: 1.5, borderBottom: '1px solid #f1f5f9', fontWeight: 600 }}>
                        Comisión por Servicio de Gestión
                        <Tooltip title="Comisión operativa del operador de importación. Colectivo: 5% del FOB. Individual: 12% del FOB.">
                          <InfoOutlinedIcon sx={{ fontSize: 13, ml: 0.5, color: 'text.secondary', verticalAlign: 'middle' }} />
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.5, borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: 'success.main' }}>
                        {renderVal(serviceFeeCoopUSD, serviceFeeCoopUSD * acqRate)}
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.5, borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: 'text.primary' }}>
                        {renderVal(serviceFeeSoloUSD, serviceFeeSoloUSD * acqRate)}
                      </TableCell>
                    </TableRow>

                    {/* Grand Total */}
                    <TableRow sx={{ bgcolor: 'rgba(126, 217, 87, 0.08)' }}>
                      <TableCell sx={{ py: 2, borderBottom: 'none' }}>
                        <Typography variant="subtitle1" fontWeight={900} color="primary.main">
                          Total Adquisición DDP (Puerta)
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          Simulación en base a {exchangeRateType === 'official' ? 'Tasa Oficial (6.96)' : `Tasa Mercado Real (${acqRate} Bs./USD)`}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ py: 2, borderBottom: 'none' }}>
                        <Typography variant="h5" fontWeight={900} color="success.dark">
                          {renderVal(totalCoopUSD, totalCoopBOB)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ py: 2, borderBottom: 'none' }}>
                        <Typography variant="h5" fontWeight={900} color="text.secondary" sx={{ textDecoration: 'line-through', opacity: 0.8 }}>
                          {renderVal(totalSoloUSD, totalSoloBOB)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              )}

              <Box sx={{ mt: 3, p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 3, display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <InfoOutlinedIcon sx={{ mt: 0.2, color: 'primary.main' }} />
                <Typography variant="caption" sx={{ fontWeight: 600, lineHeight: 1.4, color: 'text.secondary' }}>
                  {mode === 'simple' ? (
                    <><strong>¿Por qué el precio en Bolivianos puede variar?</strong> Los impuestos de aduana se pagan en Bolivianos al tipo de cambio oficial, pero comprar el producto y pagar el envío requiere dólares reales, que en Bolivia cuestan un poco más conseguir. Por eso combinamos ambos para darte el costo real y completo, sin sorpresas.</>
                  ) : (
                    <><strong>Nota Metodológica Boliviana:</strong> La Aduana Nacional de Bolivia exige el pago de impuestos (GA, IVA) directamente en Bolivianos (Bs.) calculados al tipo de cambio oficial de 6.96 Bs./USD. Sin embargo, para la compra de la mercadería (FOB) y fletes de transportistas internacionales, el importador requiere dólares estadounidenses reales, los cuales son adquiridos habitualmente en el mercado paralelo o con comisiones bancarias elevadas. Nuestra calculadora integra estos dos sistemas de forma exacta para darte el costo real definitivo de importación.</>
                  )}
                </Typography>
              </Box>
            </Paper>

            {/* Call to action button */}
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                fullWidth
                startIcon={<CheckCircleIcon />}
                sx={{
                  py: 2,
                  borderRadius: 4,
                  fontWeight: 800,
                  fontSize: '1rem',
                  boxShadow: '0 8px 24px rgba(255, 145, 77, 0.25)',
                  '&:hover': {
                    boxShadow: '0 12px 28px rgba(255, 145, 77, 0.4)',
                  }
                }}
              >
                Iniciar esta Importación Colectiva Ahora
              </Button>
            </Box>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}