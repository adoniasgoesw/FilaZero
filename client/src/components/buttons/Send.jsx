import React from 'react';
import { Send } from 'lucide-react';

const SendButton = ({ 
  children = null, 
  onClick, 
  disabled = false, 
  className = "", 
  ...props 
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center p-2 
        bg-gray-900 text-white rounded-lg 
        hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed 
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2
        ${className}
      `}
      {...props}
    >
      <Send className="w-5 h-5" />
      {children}
    </button>
  );
};

export default SendButton;
