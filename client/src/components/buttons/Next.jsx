import React from 'react';
import { ArrowRight } from 'lucide-react';

const NextButton = ({ onClick, className = "" }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`w-12 h-12 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md ${className}`}
      title="Próximo"
    >
      <ArrowRight size={20} />
    </button>
  );
};

export default NextButton;