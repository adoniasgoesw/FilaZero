import React from 'react';

const Counter = ({ value }) => {
  if (!value || value <= 0) return null;
  return (
    <span className="absolute top-1 right-1 inline-flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full bg-blue-600 text-white text-[11px] font-semibold shadow">
      {value}
    </span>
  );
};

export default Counter;


