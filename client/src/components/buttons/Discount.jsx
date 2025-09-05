import React from 'react';
import { Percent } from 'lucide-react';
import BaseSquareButton from './BaseSquareButton';

const Discount = ({ onClick, className = '', disabled = false, title = 'Discount' }) => {
  return (
    <BaseSquareButton onClick={onClick} className={className} disabled={disabled} title={title}>
      <Percent className="w-5 h-5 text-green-600" />
    </BaseSquareButton>
  );
};

export default Discount;


