// src/components/layout/Logo.jsx
import React from 'react';

const Logo = () => {
  return (
    <div className="flex items-center justify-center">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 14" 
        fill="none" 
        stroke="#1A99BA" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="w-8 h-8"
      >
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    </div>
  );
};

export default Logo;
