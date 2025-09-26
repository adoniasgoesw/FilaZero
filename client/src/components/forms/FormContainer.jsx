import React from 'react';

const FormContainer = ({ children, className = "" }) => {
  return (
    <div className={`p-4 sm:p-6 space-y-4 sm:space-y-6 ${className}`}>
      {children}
    </div>
  );
};

export default FormContainer;
