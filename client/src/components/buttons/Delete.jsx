import React from 'react';
import { Trash2 as DeleteIcon } from 'lucide-react';

const DeleteButton = ({ onClick, className = '', disabled = false, children, size = 'sm', square = false, title = 'Delete', variant = 'filled' }) => {
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'px-4 py-2',
    lg: 'px-6 py-3'
  };

  const iconSizes = {
    sm: 'w-5 h-5',
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

  const filledClasses = `bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white`;
  const outlineClasses = `bg-transparent hover:bg-red-50 text-red-600 border-0`;
  const iconGrayClasses = `bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100`;
  const softClasses = `bg-red-50 hover:bg-red-100 text-red-600`;

  const variantClasses = 
    variant === 'outline' ? outlineClasses : 
    variant === 'icon-gray' ? iconGrayClasses : 
    variant === 'soft' ? softClasses : 
    filledClasses;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        inline-flex items-center justify-center
        ${variantClasses}
        font-medium rounded-full 
        transition-colors duration-200 
        focus:outline-none focus:ring-2 ${variant === 'icon-gray' ? 'focus:ring-gray-400' : 'focus:ring-red-500'} focus:ring-offset-2
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
