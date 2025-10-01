import React, { useState, useEffect } from 'react';
import BaseModal from '../components/modals/Base';
import FormLogin from '../components/forms/FormLogin';
import FormRegister from '../components/forms/FormRegister';
import { User, UserPlus } from 'lucide-react';
import HeroSection from '../components/sections/HeroSection';
import PricingSection from '../components/sections/PricingSection';
import ContactSection from '../components/sections/ContactSection';
import Footer from '../components/sections/Footer';
import Logo from '../assets/logo';

function Landing() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);

  const handleAccessClick = () => {
    setIsLoginMode(true);
    setIsModalOpen(true);
  };



  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const switchToRegister = () => {
    setIsLoginMode(false);
  };

  const switchToLogin = () => {
    setIsLoginMode(true);
  };

  useEffect(() => {
    const handleSwitchToRegister = () => switchToRegister();
    const handleSwitchToLogin = () => switchToLogin();
    const handleOpenRegisterModal = () => {
      switchToRegister();
      setIsModalOpen(true);
    };

    window.addEventListener('switchToRegister', handleSwitchToRegister);
    window.addEventListener('switchToLogin', handleSwitchToLogin);
    window.addEventListener('openRegisterModal', handleOpenRegisterModal);

    return () => {
      window.removeEventListener('switchToRegister', handleSwitchToRegister);
      window.removeEventListener('switchToLogin', handleSwitchToLogin);
      window.removeEventListener('openRegisterModal', handleOpenRegisterModal);
    };
  }, []);

  return (
    <main className="min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo 
                size="small" 
                className="bg-gray-900 hover:bg-gray-800 rounded-lg"
              />
              <span className="text-lg sm:text-2xl font-bold text-gray-900">FilaZero PDV</span>
            </div>
            <button
              onClick={handleAccessClick}
              className="px-4 sm:px-6 py-2 bg-gray-900 text-white text-sm sm:text-base rounded-lg hover:bg-gray-800 transition-colors"
            >
              Acessar Sistema
            </button>
          </div>
        </div>
      </div>

      <div className="pt-20">
        <div id="hero">
          <HeroSection />
        </div>
        <div id="pricing">
          <PricingSection />
        </div>
        <div id="contact">
          <ContactSection />
        </div>
      </div>

      {/* Footer com margem */}
      <div className="mt-16 sm:mt-20 md:mt-24">
        <Footer />
      </div>

      {/* Modal de Login/Registro */}
      <BaseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title=""
        icon={null}
        hideDefaultButtons={true}
        showButtons={false}
        headerContent={<div></div>}
        showBorder={false}
      >
        {isLoginMode ? <FormLogin /> : <FormRegister />}
      </BaseModal>
    </main>
  );
}

export default Landing;
