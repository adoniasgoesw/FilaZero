// src/components/buttons/CloseButton.jsx
import React from 'react';
import { X } from 'lucide-react';

const CloseButton = ({ onClick }) => {
  return (
    <button 
      onClick={onClick} 
      className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 transition-colors"
    >
      <X className="w-5 h-5 text-gray-600" />
    </button>
  );
};

export default CloseButton;
