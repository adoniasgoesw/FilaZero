import React from 'react';
import { Save } from 'lucide-react';

const SaveButton = ({ onClick, className = "", children = "Salvar", disabled = false, type = "button" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full px-8 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed ${className}`}
      title="Salvar"
    >
      <Save size={16} />
      {children}
    </button>
  );
};

export default SaveButton;
