import React from 'react';
import { Package } from 'lucide-react';

const OpenButton = ({ onClick, className = "", children = "Abrir Caixa" }) => {
  return (
    <button
      onClick={onClick}
      className={`h-12 px-3 sm:px-4 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md ${className}`}
      title="Abrir Caixa"
    >
      <Package size={18} />
      <span className="hidden sm:inline">{children}</span>
    </button>
  );
};

export default OpenButton;
