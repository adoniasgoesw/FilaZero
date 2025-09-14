import React from 'react';
import { Printer } from 'lucide-react';

const PrintButton = ({ onClick, className = '', disabled = false, title = 'Print' }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-10 h-10 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed ${className}`}
      title={title}
    >
      <Printer size={18} />
    </button>
  );
};

export default PrintButton;


