import React, { useState } from 'react';
import { 
  Container, 
  Card, 
  Box, 
  Typography, 
  LinearProgress, 
  Stack, 
  Button, 
  alpha, 
  useTheme 
} from '@mui/material';
import Link from 'next/link';
import HelpOutlinedIcon from '@mui/icons-material/HelpOutlined';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { PrimaryButton } from '@/components/ui';

const QUESTIONS = [
  {
    title: "¿Cuánto capital planeas invertir en tu primera importación?",
    options: [
      { text: "Menos de $300 USD", score: 10 },
      { text: "Entre $300 y $1500 USD", score: 30 },
      { text: "Más de $1500 USD", score: 50 }
    ]
  },
  {
    title: "¿Cuál es tu meta comercial principal?",
    options: [
      { text: "Ahorrar en compras personales", score: 10 },
      { text: "Iniciar o abastecer un negocio online", score: 30 },
      { text: "Traer mercadería por contenedor", score: 50 }
    ]
  },
  {
    title: "¿Cuál es tu nivel de experiencia en trámites aduaneros?",
    options: [
      { text: "Cero experiencia, busco que se encarguen de todo", score: 10 },
      { text: "Conozco los términos básicos", score: 30 },
      { text: "He realizado importaciones individuales", score: 50 }
    ]
  }
];

export default function ImportSimulator() {
  const theme = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [scores, setScores] = useState([]);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (score) => {
    const nextScores = [...scores, score];
    setScores(nextScores);
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowResult(true);
    }
  };

  const getResult = () => {
    const total = scores.reduce((sum, s) => sum + s, 0);
    if (total <= 40) {
      return {
        title: "Importador Hormiga (Nivel 1)",
        xp: "100 XP Base",
        desc: "Ideal para iniciar sin riesgo. Te recomendamos participar en compras colectivas de tecnología pequeña o accesorios de alta demanda.",
        strategy: "Unete a ofertas grupales activas con montos mínimos de $50 USD."
      };
    } else if (total <= 100) {
      return {
        title: "Emprendedor Mayorista (Nivel 2)",
        xp: "250 XP Base",
        desc: "Buscas rentabilidad para tu tienda. Te recomendamos importaciones colectivas marítimas consolidadas para maximizar tu margen de ganancia.",
        strategy: "Crea simulaciones de costos para lotes de productos medianos."
      };
    } else {
      return {
        title: "Tiburón de Contenedores (Nivel 3)",
        xp: "500 XP Base",
        desc: "Tienes visión de escala. Te recomendamos programar una asesoría personalizada y unirte a la consolidación de contenedores completos.",
        strategy: "Reserva espacio de contenedor directo de fábrica con flete marítimo prioritario."
      };
    }
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setScores([]);
    setShowResult(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Card 
        sx={{ 
          borderRadius: 5, 
          overflow: 'hidden', 
          border: `1px dashed ${alpha(theme.palette.secondary.main, 0.4)}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.alt, 0.6)} 100%)`,
          boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
          p: { xs: 3, md: 5 }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
          <HelpOutlinedIcon color="secondary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: '-0.02em' }}>
            Simulador de Perfil de Importador
          </Typography>
        </Box>

        {!showResult ? (
          <Box>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                  PREGUNTA {currentStep + 1} DE {QUESTIONS.length}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'secondary.main' }}>
                  {Math.round(((currentStep) / QUESTIONS.length) * 100)}% COMPLETADO
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={((currentStep) / QUESTIONS.length) * 100} 
                color="secondary" 
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 800, mb: 4, color: 'text.primary', minHeight: 60 }}>
              {QUESTIONS[currentStep].title}
            </Typography>

            <Stack spacing={2}>
              {QUESTIONS[currentStep].options.map((option, idx) => (
                <Button
                  key={idx}
                  variant="outlined"
                  onClick={() => handleAnswer(option.score)}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: '2px solid',
                    borderColor: 'rgba(0, 0, 0, 0.08)',
                    color: 'text.primary',
                    fontWeight: 700,
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    fontSize: '1rem',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'secondary.main',
                      bgcolor: alpha(theme.palette.secondary.main, 0.05),
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Box sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.15), width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2, mr: 2, fontWeight: 900, color: 'secondary.dark' }}>
                    {String.fromCharCode(65 + idx)}
                  </Box>
                  {option.text}
                </Button>
              ))}
            </Stack>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Box sx={{ display: 'inline-flex', bgcolor: alpha(theme.palette.success.main, 0.1), color: 'success.main', p: 3, borderRadius: '50%', mb: 3 }}>
              <EmojiEventsIcon sx={{ fontSize: 50 }} />
            </Box>

            <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main', mb: 1 }}>
              {getResult().title}
            </Typography>
            
            <Box sx={{ display: 'inline-block', bgcolor: 'secondary.main', color: 'primary.main', px: 2, py: 0.5, borderRadius: 2, fontWeight: 800, fontSize: '0.85rem', mb: 3 }}>
              {getResult().xp} desbloqueados
            </Box>

            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto', mb: 4, fontSize: '1.1rem', lineHeight: 1.6 }}>
              {getResult().desc}
            </Typography>

            <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03), p: 3, borderRadius: 4, mb: 4, border: '1px solid rgba(0,0,0,0.05)' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main', mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Estrategia Recomendada:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {getResult().strategy}
              </Typography>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
              <PrimaryButton component={Link} href="/register" size="large" sx={{ px: 4 }}>
                Crear Cuenta y Reclamar XP
              </PrimaryButton>
              <Button variant="text" onClick={resetQuiz} sx={{ fontWeight: 700, color: 'text.secondary' }}>
                Volver a simular
              </Button>
            </Stack>
          </Box>
        )}
      </Card>
    </Container>
  );
}
