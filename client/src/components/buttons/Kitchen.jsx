import React from 'react';
import { Utensils } from 'lucide-react';
import BaseSquareButton from './BaseSquareButton';

const KitchenButton = ({ onClick, className = '', disabled = false, title = 'Kitchen' }) => {
  return (
    <BaseSquareButton onClick={onClick} className={className} disabled={disabled} title={title}>
      <Utensils className="w-5 h-5 text-indigo-600" />
    </BaseSquareButton>
  );
};

export default KitchenButton;


