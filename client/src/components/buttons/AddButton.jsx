import React from 'react';
import { Plus } from 'lucide-react';

const AddButton = ({ onClick, className = '', children, text }) => {
  return (
    <button
      onClick={onClick}
      className={`h-12 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl flex items-center gap-2 transition-all duration-200 font-medium ${className}`}
    >
      <Plus className="w-4 h-4" />
      <span className="hidden sm:inline">{text || children || 'Adicionar'}</span>
    </button>
  );
};

export default AddButton;
