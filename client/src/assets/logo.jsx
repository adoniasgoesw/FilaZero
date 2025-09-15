import React from 'react';

const Logo = ({ className = "", size = "default" }) => {
  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "w-8 h-8 text-sm";
      case "large":
        return "w-16 h-16 text-xl";
      default:
        return "w-12 h-12 text-lg";
    }
  };

  return (
    <div className={`bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer ${getSizeClasses()} ${className}`} aria-label="FilaZero logo">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6"
        aria-hidden="true"
      >
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    </div>
  );
};

export default Logo;
