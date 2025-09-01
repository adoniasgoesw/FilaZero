import React from 'react';
import { Edit as EditIcon } from 'lucide-react';

const EditButton = ({ onClick, className = '', disabled = false, children }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center px-4 py-2 
        bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300
        text-white font-medium rounded-lg 
        transition-colors duration-200 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:cursor-not-allowed
        ${className}
      `}
    >
      <EditIcon className="w-4 h-4 mr-2" />
      {children || 'Editar'}
    </button>
  );
};

export default EditButton;
