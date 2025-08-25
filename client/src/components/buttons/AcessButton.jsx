// src/components/buttons/AcesseButton.jsx
import React from 'react';

const AcesseButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
    >
      Acesse o Sistema
    </button>
  );
};

export default AcesseButton;
