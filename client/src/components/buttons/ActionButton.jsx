import React from 'react';

const ActionButton = ({ 
  onClick, 
  children, 
  variant = 'primary',
  size = 'md',
  className = '',
  title = '',
  ...props 
}) => {
  const baseClasses = 'rounded-full text-white transition-colors flex items-center justify-center';
  
  const variantClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600',
    secondary: 'bg-gray-500 hover:bg-gray-600',
    danger: 'bg-red-500 hover:bg-red-600',
    success: 'bg-green-500 hover:bg-green-600',
    warning: 'bg-yellow-500 hover:bg-yellow-600'
  };

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      title={title}
      {...props}
    >
      {children}
    </button>
  );
};

export default ActionButton;
