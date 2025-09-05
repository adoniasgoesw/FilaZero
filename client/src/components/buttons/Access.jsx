import React from 'react';
import { LogIn } from 'lucide-react';

const AccessButton = ({ onClick, className = "", children = "Acessar", variant = 'blue' }) => {
  const stylesByVariant = {
    blue: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    red: 'bg-red-500 hover:bg-red-600',
  };
  const base = `${stylesByVariant[variant] || stylesByVariant.blue} text-white font-semibold py-3 px-6 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105`;

  return (
    <button
      onClick={onClick}
      className={`${base} ${className}`}
    >
      <span>{children}</span>
      <LogIn size={20} className="transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300" />
    </button>
  );
};

export default AccessButton;
