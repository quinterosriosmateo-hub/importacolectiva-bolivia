import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, useTheme, alpha } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const slides = [
  {
    title: 'Importaciones Grupales',
    subtitle: 'Ahorra hasta un 40% importando en colectivo',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200',
    color: '#08172d',
    buttonText: 'Ver Grupos'
  },
  {
    title: 'Nuevos Arribos',
    subtitle: 'La última tecnología de USA directo a tu puerta',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=1200',
    color: '#ff914d',
    buttonText: 'Explorar'
  },
  {
    title: 'Seguridad Total',
    subtitle: 'Tu carga asegurada y monitoreada 24/7',
    image: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaad5b?auto=format&fit=crop&q=80&w=1200',
    color: '#7ed957',
    buttonText: 'Saber Más'
  }
];

export default function PromotionalCarousel() {
  const [activeStep, setActiveStep] = useState(0);
  const theme = useTheme();

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => setActiveStep((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const handleBack = () => setActiveStep((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  return (
    <Box sx={{ 
      position: 'relative', 
      width: '100%', 
      height: { xs: 300, md: 450 }, 
      borderRadius: 4, 
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      mb: 4
    }}>
      {slides.map((slide, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: activeStep === index ? 1 : 0,
            transition: 'opacity 0.8s ease-in-out',
            display: 'flex',
            alignItems: 'center',
            backgroundImage: `linear-gradient(to right, ${alpha(slide.color, 0.9)} 0%, ${alpha(slide.color, 0.4)} 60%, transparent 100%), url(${slide.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <Box sx={{ p: { xs: 4, md: 8 }, maxWidth: 600, color: 'white' }}>
            <Typography variant="h2" fontWeight="900" sx={{ fontSize: { xs: '2rem', md: '3.5rem' }, mb: 2, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
              {slide.title}
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
              {slide.subtitle}
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              sx={{ 
                bgcolor: 'white', 
                color: slide.color, 
                fontWeight: 'bold',
                px: 4,
                '&:hover': { bgcolor: alpha('#fff', 0.9) }
              }}
            >
              {slide.buttonText}
            </Button>
          </Box>
        </Box>
      ))}

      {/* Controls */}
      <IconButton 
        onClick={handleBack}
        sx={{ 
          position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', 
          color: 'white', bgcolor: 'rgba(0,0,0,0.2)', '&:hover': { bgcolor: 'rgba(0,0,0,0.4)' } 
        }}
      >
        <ArrowBackIosNewIcon />
      </IconButton>
      <IconButton 
        onClick={handleNext}
        sx={{ 
          position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', 
          color: 'white', bgcolor: 'rgba(0,0,0,0.2)', '&:hover': { bgcolor: 'rgba(0,0,0,0.4)' } 
        }}
      >
        <ArrowForwardIosIcon />
      </IconButton>

      {/* Indicators */}
      <Box sx={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 1.5 }}>
        {slides.map((_, i) => (
          <Box 
            key={i}
            onClick={() => setActiveStep(i)}
            sx={{ 
              width: activeStep === i ? 32 : 12, 
              height: 6, 
              borderRadius: 3, 
              bgcolor: 'white', 
              opacity: activeStep === i ? 1 : 0.5,
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
