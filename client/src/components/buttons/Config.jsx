import React from 'react';
import { Settings } from 'lucide-react';

const ConfigButton = ({ onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`w-12 h-12 bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-200 hover:border-gray-300 hover:text-blue-600 transition-all duration-200 shadow-sm ${className}`}
      title="Configurações"
    >
      <Settings size={20} />
    </button>
  );
};

export default ConfigButton;
