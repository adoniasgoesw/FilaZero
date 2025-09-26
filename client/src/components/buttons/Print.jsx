import React from 'react';
import { Printer } from 'lucide-react';

const PrintButton = ({ onClick, className = '', disabled = false, title = 'Print', variant = 'default' }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "square":
        return "w-12 h-12 md:w-14 md:h-14 bg-white hover:bg-gray-50 text-gray-700 rounded-xl border border-gray-200 shadow-sm hover:shadow-md";
      case "round-gray":
        return "w-10 h-10 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full shadow-sm hover:shadow-md";
      default:
        return "w-12 h-12 md:w-14 md:h-14 bg-white hover:bg-gray-50 text-gray-700 rounded-xl border border-gray-200 shadow-sm hover:shadow-md";
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${getVariantStyles()} flex items-center justify-center transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed ${className}`}
      title={title}
    >
      <Printer size={18} />
    </button>
  );
};

export default PrintButton;