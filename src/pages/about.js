import React from 'react';
import Head from 'next/head';
import { Box, Typography, Grid, Avatar, Divider, Container } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import SecurityIcon from '@mui/icons-material/Security';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PublicIcon from '@mui/icons-material/Public';
import StarsIcon from '@mui/icons-material/Stars';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { PremiumCard } from '@/components/ui';

export default function AboutPage() {
    return (
        <>
            <Head>
                <title>Sobre Nosotros - Importacolectiva Bolivia</title>
                <meta name="description" content="Conoce más sobre Importacolectiva Bolivia, tu socio estratégico para importaciones grupales desde China y el mundo." />
            </Head>

            <Box sx={{ py: { xs: 2, md: 4 } }}>
                {/* Section: Hero */}
                <Container maxWidth="lg">
                    <Box
                        sx={{
                            textAlign: 'center',
                            mb: 6,
                            p: { xs: 4, md: 8 },
                            borderRadius: 6,
                            background: 'linear-gradient(135deg, #08172D 0%, #0d2444 60%, #1a3a6b 100%)',
                            color: 'white'
                        }}
                    >
                        <Typography variant="overline" sx={{ color: '#45BD62', fontWeight: 800, letterSpacing: 2 }}>
                            Nuestra Historia
                        </Typography>
                        <Typography variant="h2" sx={{ fontWeight: 900, mt: 1, mb: 3, letterSpacing: '-0.03em', fontSize: { xs: '2.5rem', md: '3.75rem' } }}>
                            Importacolectiva Bolivia
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', maxWidth: 800, mx: 'auto', fontWeight: 400, lineHeight: 1.6 }}>
                            Nacimos con el objetivo de democratizar el comercio exterior en Bolivia.
                            Ayudamos a emprendedores y empresas a comprar directamente de fábrica en China,
                            compartiendo costos logísticos a través de nuestra plataforma de compras grupales.
                        </Typography>
                    </Box>

                    {/* Section: Mission & Vision */}
                    <Grid container spacing={4} sx={{ mb: 8 }}>
                        <Grid item xs={12} md={6}>
                            <PremiumCard sx={{ p: 4, height: '100%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Avatar sx={{ bgcolor: 'rgba(69,189,98,0.1)', color: 'success.main' }}>
                                        <TrendingUpIcon />
                                    </Avatar>
                                    <Typography variant="h5" fontWeight={800}>
                                        Nuestra Visión
                                    </Typography>
                                </Box>
                                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                    Ser el principal puente comercial entre los emprendedores bolivianos y los mejores proveedores
                                    del mundo. Queremos que importar sea un proceso transparente, seguro y accesible para todos,
                                    eliminando los intermediarios innecesarios.
                                </Typography>
                            </PremiumCard>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <PremiumCard sx={{ p: 4, height: '100%' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Avatar sx={{ bgcolor: 'rgba(59,130,246,0.1)', color: 'primary.main' }}>
                                        <StarsIcon />
                                    </Avatar>
                                    <Typography variant="h5" fontWeight={800}>
                                        Nuestros Valores
                                    </Typography>
                                </Box>
                                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                    Nos regimos por la <strong>transparencia</strong> en cada costo, la <strong>seguridad</strong>
                                    de los fondos de nuestros usuarios y la <strong>eficiencia</strong> en los tiempos de entrega.
                                    Cada importación es un compromiso con el crecimiento de tu negocio.
                                </Typography>
                            </PremiumCard>
                        </Grid>
                    </Grid>

                    <Divider sx={{ mb: 8 }} />

                    {/* Section: Differentiation */}
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Typography variant="h3" fontWeight={900} sx={{ letterSpacing: '-0.02em' }}>
                            ¿Por qué elegirnos?
                        </Typography>
                    </Box>

                    <Grid container spacing={4} sx={{ mb: 6 }}>
                        {[
                            {
                                icon: <GroupsIcon sx={{ fontSize: 32 }} />,
                                title: 'Compras Grupales',
                                desc: 'Optimizamos el espacio de carga uniendo pedidos. Pagas menos flete y accedes a precios mayoristas.',
                                color: '#45BD62'
                            },
                            {
                                icon: <SecurityIcon sx={{ fontSize: 32 }} />,
                                title: 'Seguridad Escrow',
                                desc: 'Tu inversión está protegida. Retenemos los fondos y solo pagamos al proveedor bajo cumplimiento.',
                                color: '#3b82f6'
                            },
                            {
                                icon: <PublicIcon sx={{ fontSize: 32 }} />,
                                title: 'Control de Calidad',
                                desc: 'Verificamos proveedores y mercancía en origen para asegurar que recibas lo que pediste.',
                                color: '#8b5cf6'
                            },
                            {
                                icon: <LocalShippingIcon sx={{ fontSize: 32 }} />,
                                title: 'Importación Directa',
                                desc: 'Gestionamos todo el despacho aduanero en Bolivia para que tú solo recojas tus productos.',
                                color: '#f59e0b'
                            }
                        ].map((item, index) => (
                            <Grid item xs={12} sm={6} md={3} key={index}>
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center', 
                                    p: 2
                                }}>
                                    <Avatar
                                        sx={{
                                            bgcolor: `${item.color}15`,
                                            color: item.color,
                                            width: 70,
                                            height: 70,
                                            mx: 'auto',
                                            mb: 2,
                                            boxShadow: `0 8px 16px ${item.color}20`
                                        }}
                                    >
                                        {item.icon}
                                    </Avatar>
                                    <Typography variant="h6" fontWeight={800} gutterBottom sx={{ fontSize: '1.1rem' }}>
                                        {item.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                        {item.desc}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Footer CTA */}
                    <PremiumCard
                        sx={{
                            mt: 10,
                            p: 6,
                            textAlign: 'center',
                            bgcolor: '#f8fafc',
                            border: '1px dashed',
                            borderColor: 'divider'
                        }}
                    >
                        <Typography variant="h5" fontWeight={800} mb={2}>
                            ¿Tienes alguna duda sobre cómo funcionamos?
                        </Typography>
                        <Typography variant="body1" color="text.secondary" mb={4} sx={{ maxWidth: 600, mx: 'auto' }}>
                            Nuestro equipo de expertos está listo para asesorarte en tu primera importación colectiva.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Typography
                                variant="body2"
                                fontWeight={700}
                                color="primary.main"
                                sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                            >
                                Cómo funciona
                            </Typography>
                            <Typography
                                variant="body2"
                                fontWeight={700}
                                color="primary.main"
                                sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                            >
                                Preguntas Frecuentes
                            </Typography>
                        </Box>
                    </PremiumCard>
                </Container>
            </Box>
        </>
    );
}