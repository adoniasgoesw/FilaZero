import React from 'react';
import { Power } from 'lucide-react';

const StatusButton = ({ onClick, className = '', disabled = false, isActive = false, size = 'md' }) => {
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
        transition-colors duration-200 
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:cursor-not-allowed
        rounded-full
        ${isActive 
          ? 'bg-orange-500 text-white hover:bg-orange-600' 
          : 'bg-green-600 text-white hover:bg-green-700'
        }
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <Power className={iconSizes[size]} />
    </button>
  );
};

export default StatusButton;
