import React, { useState, useEffect } from 'react';
import BaseModal from '../components/modals/Base';
import FormLogin from '../components/forms/FormLogin';
import FormRegister from '../components/forms/FormRegister';
import { User, UserPlus } from 'lucide-react';
import HeroSect from '../components/layout/HeroSect';

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

    window.addEventListener('switchToRegister', handleSwitchToRegister);
    window.addEventListener('switchToLogin', handleSwitchToLogin);

    return () => {
      window.removeEventListener('switchToRegister', handleSwitchToRegister);
      window.removeEventListener('switchToLogin', handleSwitchToLogin);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <HeroSect onPrimaryClick={handleAccessClick} />

      {/* Modal de Login/Registro */}
      <BaseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={isLoginMode ? "Login" : "Cadastro"}
        icon={isLoginMode ? User : UserPlus}
        iconBgColor="bg-blue-500"
        iconColor="text-white"
        hideDefaultButtons={true}
      >
        {isLoginMode ? <FormLogin /> : <FormRegister />}
      </BaseModal>
    </div>
  );
}

export default Landing;
