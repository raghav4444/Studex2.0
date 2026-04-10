import React from 'react';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import HowItWorksSection from './HowItWorksSection';
import TestimonialsSection from './TestimonialsSection';
import StatsSection from './StatsSection';
import AboutSection from './AboutSection';
import FAQSection from './FAQSection';
import CTASection from './CTASection';
import Footer from './Footer';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-[#0d1117]">
      <HeroSection onGetStarted={onGetStarted} />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <AboutSection />
      <FAQSection />
      <CTASection onGetStarted={onGetStarted} />
      <Footer />
    </div>
  );
};

export default LandingPage;