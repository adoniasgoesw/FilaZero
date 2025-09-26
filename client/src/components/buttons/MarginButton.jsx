import React from 'react';
import { Plus } from 'lucide-react';
import BaseSquareButton from './BaseSquareButton';

const MarginButton = ({ onClick, disabled = false, title = "Acréscimo" }) => {
  return (
    <BaseSquareButton
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="hover:bg-green-50 hover:border-green-300 hover:text-green-700"
    >
      <Plus size={20} />
    </BaseSquareButton>
  );
};

export default MarginButton;
