import React, { useState } from 'react';
import { 
  Box, Typography, Grid, Paper, Stepper, Step, StepLabel, 
  StepContent, Button, Tabs, Tab, Card, CardContent, Stack
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import HelpIcon from '@mui/icons-material/Help';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StorageIcon from '@mui/icons-material/Storage';
import TimelineIcon from '@mui/icons-material/Timeline';

export default function GuiaImportacion() {
  const [activeStep, setActiveStep] = useState(0);
  const [tabValue, setTabValue] = useState(0);

  const steps = [
    {
      label: 'Paso 1: Selección de Mercancía y Participación',
      description: 'Elige un grupo de compra colectiva activo en nuestra plataforma. Cada producto cuenta con un precio de liquidación por cupo que incluye la consolidación en origen (China/USA). Al unirte, reservas tu espacio abonando el anticipo requerido.',
    },
    {
      label: 'Paso 2: Consolidación y Envío Internacional',
      description: 'Una vez completado el cupo del contenedor o el peso mínimo de carga aérea, nuestro equipo en origen consolida las compras de todos los participantes bajo un solo importador. Esto reduce drásticamente el costo de flete unitario.',
    },
    {
      label: 'Paso 3: Tránsito Logístico',
      description: 'La carga es despachada en barco (vía Puerto de Arica, Chile para carga marítima con destino a Bolivia) o en avión. Podrás realizar el seguimiento del contenedor directamente en tu panel con actualizaciones en tiempo real.',
    },
    {
      label: 'Paso 4: Despacho Aduanero en Bolivia',
      description: 'Al llegar a aduana nacional (La Paz, Santa Cruz, Cochabamba u Oruro), gestionamos la declaración única de importación (DUI) y el pago de tributos arancelarios de manera consolidada, evitando trámites individuales complejos.',
    },
    {
      label: 'Paso 5: Entrega y Distribución Local',
      description: '¡Tu carga ya está en el país! Realizamos la desconsolidación y puedes pasar a recoger tus productos de nuestros almacenes centrales o solicitar el despacho hasta tu negocio en cualquier departamento de Bolivia.',
    },
  ];

  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);
  const handleReset = () => setActiveStep(0);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Title Header */}
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main', mb: 1.5, letterSpacing: '-0.04em' }}>
          Guía Completa de Importación
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto', fontWeight: 500 }}>
          Descubre el funcionamiento de la importación colectiva y cómo traemos tus mercancías desde origen hasta Bolivia sin complicaciones legales.
        </Typography>
      </Box>

      {/* Tabs Menu */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 5 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newVal) => setTabValue(newVal)} 
          centered
          sx={{
            '& .MuiTab-root': { fontWeight: 800, fontSize: '0.95rem', textTransform: 'none' }
          }}
        >
          <Tab icon={<TimelineIcon />} label="Proceso de Importación" iconPosition="start" />
          <Tab icon={<AssignmentIcon />} label="Requisitos y Documentos" iconPosition="start" />
          <Tab icon={<HelpIcon />} label="Preguntas Frecuentes" iconPosition="start" />
        </Tabs>
      </Box>

      {/* Tab 1: Proceso de Importación (Stepper) */}
      {tabValue === 0 && (
        <Grid container spacing={4} alignItems="flex-start">
          <Grid item xs={12} md={7}>
            <Paper variant="outlined" sx={{ p: 4, borderRadius: 4 }}>
              <Typography variant="h6" fontWeight={800} mb={3}>
                Paso a Paso Colectivo
              </Typography>
              <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((step, index) => (
                  <Step key={step.label}>
                    <StepLabel>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {step.label}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                        {step.description}
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <div>
                          <Button
                            variant="contained"
                            onClick={handleNext}
                            sx={{ mt: 1, mr: 1, borderRadius: 2, fontWeight: 700 }}
                          >
                            {index === steps.length - 1 ? 'Finalizar' : 'Continuar'}
                          </Button>
                          <Button
                            disabled={index === 0}
                            onClick={handleBack}
                            sx={{ mt: 1, mr: 1, borderRadius: 2, fontWeight: 700 }}
                          >
                            Atrás
                          </Button>
                        </div>
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
              {activeStep === steps.length && (
                <Paper square elevation={0} sx={{ p: 3, bgcolor: 'action.hover', borderRadius: 3, mt: 2 }}>
                  <Typography variant="body2" fontWeight={700} color="success.main" mb={1} display="flex" alignItems="center" gap={1}>
                    <CheckCircleIcon /> ¡Estás listo para empezar a importar!
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Ya entiendes todo el circuito logístico. Puedes explorar nuestras compras colectivas vigentes.
                  </Typography>
                  <Button onClick={handleReset} variant="outlined" sx={{ borderRadius: 2, fontWeight: 700 }}>
                    Reiniciar Guía
                  </Button>
                </Paper>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12} md={5}>
            <Card variant="outlined" sx={{ borderRadius: 4, border: '2px solid rgba(59,130,246,0.1)' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" fontWeight={800} mb={2}>
                  Ventajas del Modelo Consolidado
                </Typography>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                      1. Fletes Compartidos
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      Paga solo por el volumen o peso exacto de tu mercadería. No necesitas llenar un contenedor de 40 pies tú solo.
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                      2. Despacho sin burocracia
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      Nosotros nos encargamos del trámite aduanero, la DUI y la homologación. Te entregamos la mercadería nacionalizada lista para vender.
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                      3. Seguridad en tu Inversión
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      Todas nuestras cargas viajan 100% aseguradas. Ante pérdidas, decomisos o siniestros, se reintegra el total de tu capital invertido.
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 2: Requisitos y Documentos */}
      {tabValue === 1 && (
        <Paper variant="outlined" sx={{ p: 4, borderRadius: 4 }}>
          <Typography variant="h6" fontWeight={800} mb={3}>
            ¿Qué necesitas para importar colectivamente con nosotros?
          </Typography>
          <Grid container spacing={3}>
            {[
              {
                title: 'Cédula de Identidad',
                desc: 'Para el registro y la facturación nacional. Cualquier persona natural boliviana con CI vigente puede importar.'
              },
              {
                title: 'NIT / Régimen Tributario',
                desc: 'Opcional si deseas descargar crédito fiscal IVA. Te emitimos factura oficial de servicio y fletes nacionales.'
              },
              {
                title: 'Información Comercial del Lote',
                desc: 'Detalle de los productos, su descripción y uso (necesario para la clasificación arancelaria y homologaciones).'
              },
              {
                title: 'Pago de Cuota Inicial',
                desc: 'Normalmente un 50% al reservar el cupo de importación grupal para dar inicio a la compra y logística en origen.'
              }
            ].map((req, i) => (
              <Grid item xs={12} sm={6} key={i}>
                <Box sx={{ p: 3, border: '1px solid rgba(0,0,0,0.06)', borderRadius: 3, height: '100%' }}>
                  <Typography variant="subtitle1" fontWeight={800} color="primary.main" gutterBottom>
                    {req.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                    {req.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Tab 3: FAQ */}
      {tabValue === 2 && (
        <Paper variant="outlined" sx={{ p: 4, borderRadius: 4 }}>
          <Typography variant="h6" fontWeight={800} mb={3}>
            Preguntas Frecuentes (FAQ)
          </Typography>
          <Stack spacing={3}>
            {[
              {
                q: '¿Cuánto tiempo tarda en llegar la carga a Bolivia?',
                a: 'El envío aéreo tarda entre 10 y 15 días laborables desde la salida de nuestro almacén. El envío marítimo (vía Puerto de Arica hasta aduana interna boliviana) tiene un tiempo estimado de 45 a 60 días en total.'
              },
              {
                q: '¿Qué pasa si mi mercadería llega dañada o no llega?',
                a: 'Contamos con una póliza de seguro de carga internacional del 100%. Si hay daños graves verificados en el almacén de destino o extravío, se procede al reembolso del costo total del producto reportado.'
              },
              {
                q: '¿Puedo importar cualquier tipo de producto?',
                a: 'No importamos sustancias controladas, armas, explosivos, mercancías peligrosas o aquellas que requieran permisos de importación especiales muy restrictivos (como SENASAG para alimentos específicos o AGEMED para fármacos complejos sin registro sanitario).'
              },
              {
                q: '¿Tengo que hacer trámites de aduana personalmente?',
                a: 'No. El despacho consolidado lo realiza nuestra agencia despachante aliada en aduana. Tú solo recoges los productos nacionalizados en nuestros almacenes.'
              }
            ].map((faq, i) => (
              <Box key={i} sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 2.5 }}>
                <Typography variant="subtitle1" fontWeight={800} mb={1}>
                  {faq.q}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {faq.a}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
