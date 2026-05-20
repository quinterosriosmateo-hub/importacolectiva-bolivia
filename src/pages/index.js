import React from 'react';
import { Box } from '@mui/material';
import HeroSection from '@/components/pages/home/HeroSection';
import FeaturesGrid from '@/components/pages/home/FeaturesGrid';
import ImportSimulator from '@/components/pages/home/ImportSimulator';
import XpRoadmap from '@/components/pages/home/XpRoadmap';
import CtaSection from '@/components/pages/home/CtaSection';

export default function Home() {
  return (
    <Box>
      <HeroSection />
      <FeaturesGrid />
      <ImportSimulator />
      <XpRoadmap />
      <CtaSection />
    </Box>
  );
}
