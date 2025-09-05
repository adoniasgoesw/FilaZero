import React from 'react';
import { Info } from 'lucide-react';

const Information = ({ onClick, className = "", title = "Informações" }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-10 h-10 md:w-11 md:h-11 border border-orange-400 text-orange-500 hover:bg-orange-50 rounded-lg flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md ${className}`}
      title={title}
    >
      <Info size={18} />
    </button>
  );
};

export default Information;


