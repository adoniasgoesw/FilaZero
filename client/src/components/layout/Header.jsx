// src/components/layout/Header.jsx
import React from 'react';
import Logo from './Logo.jsx';
import AcesseButton from '../buttons/AcessButton.jsx';

const Header = ({ onAcesseClick }) => {
  return (
    <header className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-100 shadow-sm">
      <Logo />
      <AcesseButton onClick={onAcesseClick} />
    </header>
  );
};

export default Header;
