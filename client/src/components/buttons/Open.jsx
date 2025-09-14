import React from 'react';
import { Package } from 'lucide-react';

const OpenButton = ({ onClick, className = "", children = "Abrir Caixa", variant = 'open' }) => {
  const isClose = variant === 'close';
  const bg = isClose ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-500 hover:bg-blue-600';
  const title = isClose ? 'Fechar Caixa' : 'Abrir Caixa';
  const label = isClose ? 'Fechar Caixa' : children;
  return (
    <button
      onClick={onClick}
      className={`h-12 px-3 sm:px-4 ${bg} text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md ${className}`}
      title={title}
    >
      <Package size={18} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};

export default OpenButton;
