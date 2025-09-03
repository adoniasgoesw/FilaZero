import React, { useState, useEffect } from 'react';
import { Rocket } from 'lucide-react';
import Header from '../components/layout/Header';
import BaseModal from '../components/modals/Base';
import FormLogin from '../components/forms/FormLogin';
import FormRegister from '../components/forms/FormRegister';
import { User, UserPlus } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      {/* Header com Logo e Botão Access */}
      <Header onAccessClick={handleAccessClick} />
      
      {/* Conteúdo principal */}
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-6">FilaZero</h1>
          <p className="text-xl mb-8">Sistema de gerenciamento de filas e entregas</p>
          <div className="space-y-4">
            <p className="text-lg">Bem-vindo ao sistema</p>
            <p className="text-lg">Faça login para continuar</p>
          </div>
        </div>
      </div>

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
