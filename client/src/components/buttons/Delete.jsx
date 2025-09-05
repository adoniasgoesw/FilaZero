import React from 'react';
import { Trash2 as DeleteIcon } from 'lucide-react';

const DeleteButton = ({ onClick, className = '', disabled = false, children, size = 'sm', square = false, title = 'Delete' }) => {
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

  if (square) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`
          inline-flex items-center justify-center select-none
          w-12 h-12 md:w-14 md:h-14 rounded-xl
          bg-red-600 hover:bg-red-700 disabled:bg-red-300
          text-white font-medium 
          transition-colors duration-200 
          focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
          disabled:cursor-not-allowed
          ${className}
        `}
      >
        <DeleteIcon className={'w-5 h-5'} />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        inline-flex items-center justify-center
        bg-red-600 hover:bg-red-700 disabled:bg-red-300
        text-white font-medium rounded-full 
        transition-colors duration-200 
        focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
        disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <DeleteIcon className={`${iconSizes[size]} ${children ? 'mr-2' : ''}`} />
      {children}
    </button>
  );
};

export default DeleteButton;
