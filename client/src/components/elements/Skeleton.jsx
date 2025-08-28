import React from 'react';

// Componente de Skeleton Loading para melhorar UX
const Skeleton = ({ 
  type = 'text', 
  lines = 1, 
  className = '',
  height = 'h-4',
  width = 'w-full'
}) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';
  
  if (type === 'text') {
    return (
      <div className={`${baseClasses} ${height} ${width} ${className}`} />
    );
  }
  
  if (type === 'paragraph') {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={`${baseClasses} ${height} ${index === lines - 1 ? 'w-3/4' : 'w-full'} ${className}`}
          />
        ))}
      </div>
    );
  }
  
  if (type === 'card') {
    return (
      <div className={`${baseClasses} ${className}`}>
        <div className="p-4 space-y-3">
          <div className={`${baseClasses} h-4 w-3/4`} />
          <div className={`${baseClasses} h-4 w-1/2`} />
          <div className={`${baseClasses} h-4 w-2/3`} />
        </div>
      </div>
    );
  }
  
  if (type === 'table') {
    return (
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="flex space-x-4">
            <div className={`${baseClasses} h-4 w-1/4`} />
            <div className={`${baseClasses} h-4 w-1/3`} />
            <div className={`${baseClasses} h-4 w-1/4`} />
            <div className={`${baseClasses} h-4 w-1/6`} />
          </div>
        ))}
      </div>
    );
  }
  
  if (type === 'image') {
    return (
      <div className={`${baseClasses} ${height} ${width} ${className}`} />
    );
  }
  
  return (
    <div className={`${baseClasses} ${height} ${width} ${className}`} />
  );
};

export default Skeleton;
