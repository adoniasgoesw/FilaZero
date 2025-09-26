import React from 'react';
// Minimal toggle switch styled for enable/disable with no inner icons

const StatusButton = ({ onClick, className = '', disabled = false, isActive = false, size = 'md', title = 'Editar status' }) => {
  const trackSizes = {
    xs: 'w-8 h-4',
    sm: 'w-9 h-4',
    md: 'w-10 h-5'
  };

  const knobSizes = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4'
  };

  const knobTranslate = {
    xs: isActive ? 'translate-x-4' : 'translate-x-1',
    sm: isActive ? 'translate-x-5' : 'translate-x-1',
    md: isActive ? 'translate-x-6' : 'translate-x-1'
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={isActive}
      title={title}
      className={`
        relative inline-flex items-center rounded-full transition-colors duration-200
        focus:outline-none focus:ring-0 focus-visible:ring-0
        disabled:cursor-not-allowed
        ${isActive ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-500 hover:bg-orange-600'}
        ${trackSizes[size]}
        ${className}
      `}
    >
      <span
        className={`absolute left-0 top-0 m-0.5 rounded-full bg-white shadow-sm transform transition-transform duration-200
          ${knobSizes[size]} ${knobTranslate[size]}
        `}
      />
    </button>
  );
};

export default StatusButton;
