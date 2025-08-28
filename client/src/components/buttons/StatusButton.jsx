import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const StatusButton = ({ 
  isActive = false, 
  onClick, 
  className = '', 
  activeText = 'Ativo', 
  inactiveText = 'Inativo',
  size = 'default'
}) => {
  const sizeClasses = {
    small: 'px-3 py-1.5 text-xs',
    default: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base'
  };

  const baseClasses = `inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${sizeClasses[size] || sizeClasses.default}`;
  
  const activeClasses = isActive 
    ? 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500' 
    : 'bg-gray-300 hover:bg-gray-400 text-gray-700 focus:ring-gray-500';

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${activeClasses} ${className}`}
    >
      {isActive ? (
        <CheckCircle className="w-4 h-4" />
      ) : (
        <XCircle className="w-4 h-4" />
      )}
      <span>{isActive ? activeText : inactiveText}</span>
    </button>
  );
};

export default StatusButton;

