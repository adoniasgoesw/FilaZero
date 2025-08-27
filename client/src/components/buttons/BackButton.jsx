import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ onClick, className = '' }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1); // Navega para a página anterior
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center w-12 h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors duration-200 ${className}`}
    >
      <ArrowLeft className="w-5 h-5" />
    </button>
  );
};

export default BackButton;
