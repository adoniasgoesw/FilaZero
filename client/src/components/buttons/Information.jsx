import React from 'react';
import { Info } from 'lucide-react';

const Information = ({ onClick, className = "", title = "Informações", variant = "default" }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "gray":
        return "text-gray-600 hover:text-gray-800 hover:bg-gray-100";
      case "blue":
        return "text-white bg-blue-600 hover:bg-blue-700 rounded-lg";
      case "no-border":
        return "text-gray-600 hover:text-gray-800 hover:bg-gray-100 border-0";
      default:
        return "text-white bg-blue-600 hover:bg-blue-700 rounded-lg";
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2.5 flex items-center justify-center transition-all duration-200 ${getVariantStyles()} ${className}`}
      title={title}
    >
      <Info className="w-5 h-5" />
    </button>
  );
};

export default Information;


