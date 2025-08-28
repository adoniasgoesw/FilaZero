import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordToggleButton = ({ 
  isVisible, 
  onClick, 
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors ${className}`}
      title={isVisible ? 'Ocultar senha' : 'Mostrar senha'}
    >
      {isVisible ? <EyeOff className={sizeClasses[size]} /> : <Eye className={sizeClasses[size]} />}
    </button>
  );
};

export default PasswordToggleButton;
