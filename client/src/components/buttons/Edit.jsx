import React from 'react';
import { Edit as EditIcon } from 'lucide-react';

const EditButton = ({ onClick, className = '', disabled = false, children, size = 'md', variant = 'filled' }) => {
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

  const filledClasses = 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white focus:ring-blue-500';
  const softClasses = 'bg-blue-50 hover:bg-blue-100 text-blue-600 focus:ring-blue-300';
  const variantClasses = variant === 'soft' ? softClasses : filledClasses;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center
        font-medium rounded-full 
        transition-colors duration-200 
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:cursor-not-allowed
        ${variantClasses}
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
