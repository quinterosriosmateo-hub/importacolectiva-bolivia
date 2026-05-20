import React from 'react';
import { Container, Grid, Box, Typography, Card, CardContent, alpha, useTheme } from '@mui/material';
import { SectionTitle } from '@/components/ui';

export default function XpRoadmap() {
  const theme = useTheme();

  const steps = [
    {
      level: "NIVEL 1",
      name: "Curioso del Comercio",
      xp: "0 - 99 XP",
      desc: "Acceso gratuito al simulador básico de costos e historial de ofertas nacionales.",
      benefit: "Comunidad libre"
    },
    {
      level: "NIVEL 2",
      name: "Importador Novato",
      xp: "100 - 499 XP",
      desc: "Consigue este nivel completando tu primera oferta grupal. Desbloquea chats de comunidad.",
      benefit: "Soporte comunitario"
    },
    {
      level: "NIVEL 3",
      name: "Importador Frecuente",
      xp: "500 - 1999 XP",
      desc: "Para usuarios activos con más de 5 importaciones completadas con éxito.",
      benefit: "-2% Desc. Logística + Soporte VIP"
    },
    {
      level: "NIVEL 4",
      name: "Tiburón de Importación",
      xp: "2000+ XP",
      desc: "Importador consolidado de contenedores completos y cargas complejas directas.",
      benefit: "Flete prioritario + Asesoría gratis"
    }
  ];

  return (
    <Box 
      sx={{ 
        bgcolor: alpha(theme.palette.primary.main, 0.02), 
        py: 10, 
        borderTop: '1px solid rgba(0,0,0,0.03)', 
        borderBottom: '1px solid rgba(0,0,0,0.03)' 
      }}
    >
      <Container maxWidth="lg">
        <SectionTitle>Camino del Importador (XP Road)</SectionTitle>
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ textAlign: 'center', mb: 6, mt: -4, maxWidth: 600, mx: 'auto' }}
        >
          Escala posiciones en Importacolectiva. A medida que importas y completas actividades, desbloqueas mejores beneficios logísticos.
        </Typography>

        <Grid container spacing={3}>
          {steps.map((step, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
              <Card 
                sx={{ 
                  height: '100%', 
                  borderRadius: 4, 
                  boxShadow: 'none', 
                  border: '1px solid rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
                    borderColor: 'secondary.main'
                  }
                }}
              >
                <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontWeight: 900, 
                        color: 'secondary.main', 
                        bgcolor: alpha(theme.palette.secondary.main, 0.1), 
                        px: 1.5, 
                        py: 0.5, 
                        borderRadius: 1.5 
                      }}
                    >
                      {step.level}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled' }}>
                      {step.xp}
                    </Typography>
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: 'primary.main' }}>
                    {step.name}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
                    {step.desc}
                  </Typography>

                  <Box sx={{ borderTop: '1px solid rgba(0,0,0,0.05)', pt: 2 }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block', 
                        color: 'text.disabled', 
                        fontWeight: 800, 
                        textTransform: 'uppercase', 
                        mb: 0.5 
                      }}
                    >
                      Beneficio Clave:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                      {step.benefit}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
