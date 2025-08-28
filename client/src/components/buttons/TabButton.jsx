import React from 'react';

const TabButton = ({ 
  isActive, 
  onClick, 
  children, 
  activeColor = 'text-cyan-600', 
  inactiveColor = 'text-gray-600',
  hoverColor = 'hover:text-gray-800'
}) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
        isActive
          ? `bg-white ${activeColor} shadow-sm`
          : `${inactiveColor} ${hoverColor}`
      }`}
    >
      {children}
    </button>
  );
};

export default TabButton;
