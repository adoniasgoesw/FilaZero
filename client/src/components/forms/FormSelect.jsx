import React from 'react';

const FormSelect = ({ 
  value,
  onChange,
  options = [],
  placeholder = "Selecione uma opção",
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
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
      )}
      <select
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`
          w-full px-3 py-2.5 text-sm border rounded-lg 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
          transition-all duration-200 appearance-none cursor-pointer
          ${Icon ? 'pl-10' : 'pl-3'}
          ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
          ${className}
        `}
        {...props}
      >
        <option value="" className="text-gray-500">
          {placeholder}
        </option>
        {options.map((option) => (
          <option 
            key={option.value || option.id} 
            value={option.value || option.id}
            className="text-gray-700"
          >
            {option.label || option.nome || option.name}
          </option>
        ))}
      </select>
      
      {/* Ícone de dropdown customizado */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg 
          className="w-4 h-4 text-gray-400 transition-transform duration-200" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export default FormSelect;
