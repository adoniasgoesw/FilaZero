import React from 'react';
import Logo from '../../assets/logo';
import AccessButton from '../buttons/Access';

const Header = ({ onAccessClick }) => {
  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Logo size="large" />
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-800">FilaZero PDV </h1>
            <p className="text-sm text-gray-600">Sistema de Gestão para Restaurantes</p>
          </div>
        </div>
        
        {/* Botão Access */}
        <div className="flex items-center">
          <AccessButton onClick={onAccessClick} />
        </div>
      </div>
    </header>
  );
};

export default Header;
