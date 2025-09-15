import React from 'react';
import { Info } from 'lucide-react';

const Information = ({ onClick, className = "", title = "Informações" }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-7 h-7 md:w-8 md:h-8 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full flex items-center justify-center transition-all duration-200 ${className}`}
      title={title}
    >
      <Info className="w-4 h-4" />
    </button>
  );
};

export default Information;


