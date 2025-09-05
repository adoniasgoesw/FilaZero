import React from 'react';

const BaseSquareButton = ({
  onClick,
  className = '',
  disabled = false,
  title,
  children,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        inline-flex items-center justify-center select-none
        w-12 h-12 md:w-14 md:h-14
        rounded-xl border border-gray-200 bg-white text-gray-700
        shadow-sm hover:shadow transition-shadow
        hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default BaseSquareButton;


