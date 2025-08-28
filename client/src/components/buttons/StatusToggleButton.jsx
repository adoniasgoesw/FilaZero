import React from 'react';
import { Power, PowerOff } from 'lucide-react';

const StatusToggleButton = ({ 
  isActive, 
  onClick, 
  size = 'sm',
  showText = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <button
      onClick={onClick}
      className={`${sizeClasses[size]} rounded-full text-white transition-colors flex items-center justify-center ${className} ${
        isActive
          ? 'bg-yellow-500 hover:bg-yellow-600'
          : 'bg-emerald-500 hover:bg-emerald-600'
      }`}
      title={isActive ? 'Desativar' : 'Ativar'}
    >
      {isActive ? <PowerOff className={iconSizes[size]} /> : <Power className={iconSizes[size]} />}
      {showText && (
        <span className="ml-2 text-xs font-medium">
          {isActive ? 'Desativar' : 'Ativar'}
        </span>
      )}
    </button>
  );
};

export default StatusToggleButton;
