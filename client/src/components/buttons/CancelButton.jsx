import React from 'react';

const CancelButton = ({ onClick, children, className = '', ...props }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`}
      {...props}
    >
      {children || 'Cancelar'}
    </button>
  );
};

export default CancelButton;
