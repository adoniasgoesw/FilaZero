import React from 'react';
import { Printer } from 'lucide-react';
import BaseSquareButton from './BaseSquareButton';

const PrintButton = ({ onClick, className = '', disabled = false, title = 'Print' }) => {
  return (
    <BaseSquareButton onClick={onClick} className={className} disabled={disabled} title={title}>
      <Printer className="w-5 h-5 text-gray-700" />
    </BaseSquareButton>
  );
};

export default PrintButton;


