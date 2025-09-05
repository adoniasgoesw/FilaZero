import React from 'react';
import { DollarSign } from 'lucide-react';
import BaseSquareButton from './BaseSquareButton';

const Surcharge = ({ onClick, className = '', disabled = false, title = 'Surcharge' }) => {
  return (
    <BaseSquareButton onClick={onClick} className={className} disabled={disabled} title={title}>
      <DollarSign className="w-5 h-5 text-yellow-500" />
    </BaseSquareButton>
  );
};

export default Surcharge;


