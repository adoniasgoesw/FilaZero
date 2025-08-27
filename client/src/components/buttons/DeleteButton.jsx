import React from 'react';

const DeleteButton = ({ onClick, children, className = '', ...props }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-red-500 hover:bg-red-600 text-white ${className}`}
      {...props}
    >
      {children || 'Excluir'}
    </button>
  );
};

export default DeleteButton;
