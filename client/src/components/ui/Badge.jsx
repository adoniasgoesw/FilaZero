import React from 'react';

const Badge = ({ 
  children, 
  variant = "default", 
  className = "",
  ...props 
}) => {
  const variants = {
    default: "bg-gray-900 text-white",
    secondary: "bg-gray-100 text-gray-900",
    outline: "border border-gray-200 text-gray-900",
    destructive: "bg-red-600 text-white"
  };

  return (
    <span 
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
};

export { Badge };
export default Badge;
