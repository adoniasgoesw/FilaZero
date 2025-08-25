// src/components/layout/Header.jsx
import React from 'react';
import Logo from './Logo.jsx';
import AcesseButton from '../buttons/AcessButton.jsx';

const Header = ({ onAcesseClick }) => {
  return (
    <header className="flex justify-between items-center p-4 bg-white shadow-md">
      <Logo />
      <AcesseButton onClick={onAcesseClick} />
    </header>
  );
};

export default Header;
