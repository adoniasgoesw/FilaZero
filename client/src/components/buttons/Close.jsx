import React from 'react';
import { X } from 'lucide-react';

const CloseButton = ({ onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`w-10 h-10 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md ${className}`}
      title="Fechar"
    >
      <X size={18} />
    </button>
  );
};

export default CloseButton;


