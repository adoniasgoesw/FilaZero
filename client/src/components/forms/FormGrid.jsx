import React from 'react';

const FormGrid = ({ 
  children, 
  cols = 1, 
  gap = 4,
  className = "" 
}) => {
  const getGridCols = () => {
    const gridCols = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
    };
    return gridCols[cols] || gridCols[1];
  };

  const getGap = () => {
    const gaps = {
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      6: 'gap-6'
    };
    return gaps[gap] || gaps[4];
  };

  return (
    <div className={`grid ${getGridCols()} ${getGap()} ${className}`}>
      {children}
    </div>
  );
};

export default FormGrid;
