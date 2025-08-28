import React from 'react';
import { Edit3 } from 'lucide-react';

const EditButton = ({ 
  onClick, 
  className = '', 
  text = 'Editar', 
  size = 'default',
  variant = 'primary'
}) => {
  const sizeClasses = {
    small: 'px-3 py-1.5 text-xs',
    default: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
    outline: 'border border-blue-500 text-blue-500 hover:bg-blue-50'
  };

  const baseClasses = `inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${sizeClasses[size] || sizeClasses.default}`;

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${className}`}
    >
      <Edit3 className="w-4 h-4" />
      <span>{text}</span>
    </button>
  );
};

export default EditButton;


