import React from 'react';
import { ArrowUpDown } from 'lucide-react';

const ReorderButton = ({ onClick, className = "", disabled = false, isActive = false }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md ${
        isActive 
          ? 'bg-blue-500 hover:bg-blue-600 text-white' 
          : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
      } ${className}`}
      title={isActive ? "Finalizar reordenação" : "Reordenar itens"}
    >
      <ArrowUpDown size={20} />
    </button>
  );
};

export default ReorderButton;