import React from 'react';

const FormInput = ({ 
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error = false,
  icon: Icon,
  className = "",
  ...props 
}) => {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`
          w-full py-2.5 text-sm border rounded-lg 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
          transition-all duration-200
          ${Icon ? 'pl-10 pr-3' : className.includes('pl-') ? className : 'px-3'}
          ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
        `}
        {...props}
      />
    </div>
  );
};

export default FormInput;
