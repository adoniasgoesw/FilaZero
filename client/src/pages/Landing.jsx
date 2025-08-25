// src/pages/LandingPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import Header from '../components/layout/Header.jsx';
import BaseModal from '../components/modals/Base.jsx';
import LoginForm from '../components/forms/LoginForm.jsx';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  
  // Estado para controlar o modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Redirecionar usuários já logados para Home
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, loading, navigate]);

  return (
    <div className="w-full h-screen bg-gray-50">
      {/* Header com logo e botão */}
      <Header onAcesseClick={openModal} />

      {/* Modal Base com LoginForm */}
      <BaseModal isOpen={isModalOpen} onClose={closeModal}>
        <LoginForm />
      </BaseModal>
    </div>
  );
};

export default LandingPage;
