import React from 'react';

const SubmitButton = ({ 
  children, 
  isLoading = false, 
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props 
}) => {
  const baseClasses = 'w-full font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white',
    secondary: 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white',
    danger: 'bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white'
  };

  const sizeClasses = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6 text-base',
    lg: 'py-4 px-8 text-lg'
  };

  return (
    <button
      type="submit"
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {isLoading ? 'Processando...' : children}
    </button>
  );
};

export default SubmitButton;
