import React from 'react';
import { Grid, Box, Typography, Card, LinearProgress } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SavingsIcon from '@mui/icons-material/Savings';
import GroupIcon from '@mui/icons-material/Group';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { PremiumCard } from '@/components/ui';

export default function ImporterStats({ user }) {
  if (!user) return null;

  return (
    <Grid container spacing={3} sx={{ mb: 6 }}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card 
          sx={{ 
            p: 3, 
            borderRadius: 4, 
            border: '1px solid rgba(0,0,0,0.06)', 
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', 
            color: 'white' 
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Box>
              <Typography 
                variant="caption" 
                sx={{ opacity: 0.8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}
              >
                Rango de Socio
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>Nivel 2: Novato</Typography>
            </Box>
            <EmojiEventsIcon sx={{ color: '#FFD700', fontSize: 32 }} />
          </Box>
          <Typography variant="caption" sx={{ display: 'block', mb: 1, opacity: 0.9 }}>
            250 / 500 XP para Nivel 3
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={50} 
            color="secondary" 
            sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.2)' }} 
          />
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <PremiumCard sx={{ p: 3, height: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ fontWeight: 800, textTransform: 'uppercase' }}
              >
                Ahorro Estimado
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: 'success.main', mt: 0.5 }}>
                $210 USD
              </Typography>
              <Typography variant="caption" color="text.disabled">Bs. 1.460 aproximado</Typography>
            </Box>
            <Box sx={{ bgcolor: 'success.light', p: 1.5, borderRadius: 3, color: 'success.main', display: 'flex' }}>
              <SavingsIcon sx={{ fontSize: 24 }} />
            </Box>
          </Box>
        </PremiumCard>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <PremiumCard sx={{ p: 3, height: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ fontWeight: 800, textTransform: 'uppercase' }}
              >
                Mis Compras Colectivas
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', mt: 0.5 }}>
                2 Grupos
              </Typography>
              <Typography variant="caption" color="text.disabled">1 Marítimo | 1 Aéreo</Typography>
            </Box>
            <Box sx={{ bgcolor: 'primary.light', p: 1.5, borderRadius: 3, color: 'primary.main', display: 'flex' }}>
              <GroupIcon sx={{ fontSize: 24 }} />
            </Box>
          </Box>
        </PremiumCard>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <PremiumCard sx={{ p: 3, height: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ fontWeight: 800, textTransform: 'uppercase' }}
              >
                Mi Reputación
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: 'secondary.main', mt: 0.5 }}>
                100%
              </Typography>
              <Typography variant="caption" color="text.disabled">Socio verificado y activo</Typography>
            </Box>
            <Box sx={{ bgcolor: 'secondary.light', p: 1.5, borderRadius: 3, color: 'secondary.main', display: 'flex' }}>
              <CheckCircleIcon sx={{ fontSize: 24 }} />
            </Box>
          </Box>
        </PremiumCard>
      </Grid>
    </Grid>
  );
}
