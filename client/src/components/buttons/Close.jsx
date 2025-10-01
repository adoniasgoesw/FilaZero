import React from 'react';
import { X } from 'lucide-react';

const CloseButton = ({ onClick, className = "", variant = "default" }) => {
  const getButtonClasses = () => {
    if (variant === "minimal") {
      return "w-8 h-8 text-gray-900 hover:text-gray-700 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-gray-100 border border-gray-900 hover:border-gray-700";
    }
    return "w-10 h-10 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md";
  };

  return (
    <button
      onClick={onClick}
      className={`${getButtonClasses()} ${className}`}
      title="Fechar"
    >
      <X size={variant === "minimal" ? 16 : 18} />
    </button>
  );
};

export default CloseButton;


