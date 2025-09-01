import React from 'react';
import { Edit as EditIcon } from 'lucide-react';

const EditButton = ({ onClick, className = '', disabled = false, children, size = 'md' }) => {
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'px-4 py-2',
    lg: 'px-6 py-3'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center
        bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300
        text-white font-medium rounded-lg 
        transition-colors duration-200 
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <EditIcon className={`${iconSizes[size]} ${children ? 'mr-2' : ''}`} />
      {children}
    </button>
  );
};

export default EditButton;
