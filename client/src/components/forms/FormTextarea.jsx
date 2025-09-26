import React from 'react';

const FormTextarea = ({ 
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error = false,
  icon: Icon,
  rows = 3,
  className = "",
  ...props 
}) => {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className={`
          w-full px-3 py-2.5 text-sm border rounded-lg 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
          transition-all duration-200 resize-none
          ${Icon ? 'pl-10' : 'pl-3'}
          ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
          ${className}
        `}
        {...props}
      />
    </div>
  );
};

export default FormTextarea;
