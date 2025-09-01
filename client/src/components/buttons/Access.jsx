import React from 'react';
import { LogIn } from 'lucide-react';

const AccessButton = ({ onClick, className = "", children = "Acessar" }) => {
  return (
    <button
      onClick={onClick}
      className={`bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 ${className}`}
    >
      <span>{children}</span>
      <LogIn size={20} className="transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300" />
    </button>
  );
};

export default AccessButton;
