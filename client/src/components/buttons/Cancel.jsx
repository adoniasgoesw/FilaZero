import React from 'react';
import { X } from 'lucide-react';

const CancelButton = ({ onClick, className = "", children = "Cancelar", disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full px-8 py-3 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed ${className}`}
      title="Cancelar"
    >
      <X size={16} />
      {children}
    </button>
  );
};

export default CancelButton;
