import React from 'react';
import { Settings } from 'lucide-react';

const ConfigButton = ({ onClick, className = '' }) => {
  return (
    <button
      onClick={onClick}
      className={`w-12 h-12 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-xl flex items-center justify-center transition-all duration-200 ${className}`}
    >
      <Settings className="w-5 h-5" />
    </button>
  );
};

export default ConfigButton;
