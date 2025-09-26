import { useState } from 'react';

export const useFormValidation = () => {
  const [errors, setErrors] = useState({});
  const [showNotification, setShowNotification] = useState(false);

  const validateField = (name, value, rules = {}) => {
    const newErrors = { ...errors };
    
    // Remove erro anterior se existir
    if (newErrors[name]) {
      delete newErrors[name];
    }

    // Validações
    if (rules.required && (!value || value.toString().trim() === '')) {
      newErrors[name] = `${rules.label || name} é obrigatório`;
    } else if (rules.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      newErrors[name] = 'E-mail inválido';
    } else if (rules.minLength && value && value.length < rules.minLength) {
      newErrors[name] = `${rules.label || name} deve ter pelo menos ${rules.minLength} caracteres`;
    } else if (rules.maxLength && value && value.length > rules.maxLength) {
      newErrors[name] = `${rules.label || name} deve ter no máximo ${rules.maxLength} caracteres`;
    } else if (rules.pattern && value && !rules.pattern.test(value)) {
      newErrors[name] = rules.message || `${rules.label || name} inválido`;
    }

    setErrors(newErrors);
    return !newErrors[name];
  };

  const validateForm = (formData, validationRules) => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(field => {
      const rules = validationRules[field];
      const value = formData[field];
      
      if (rules.required && (!value || value.toString().trim() === '')) {
        newErrors[field] = `${rules.label || field} é obrigatório`;
        isValid = false;
      } else if (rules.email && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors[field] = 'E-mail inválido';
        isValid = false;
      } else if (rules.minLength && value && value.length < rules.minLength) {
        newErrors[field] = `${rules.label || field} deve ter pelo menos ${rules.minLength} caracteres`;
        isValid = false;
      } else if (rules.maxLength && value && value.length > rules.maxLength) {
        newErrors[field] = `${rules.label || field} deve ter no máximo ${rules.maxLength} caracteres`;
        isValid = false;
      } else if (rules.pattern && value && !rules.pattern.test(value)) {
        newErrors[field] = rules.message || `${rules.label || field} inválido`;
        isValid = false;
      } else if (rules.currency && value) {
        // Validação específica para valores monetários
        const numericValue = parseFloat(value.toString().replace(',', '.').replace(/[^\d.-]/g, ''));
        if (isNaN(numericValue) || numericValue <= 0) {
          newErrors[field] = `${rules.label || field} deve ser um valor válido`;
          isValid = false;
        }
      }
    });
    
    setErrors(newErrors);
    
    if (!isValid) {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
    }

    return isValid;
  };

  const clearError = (field) => {
    const newErrors = { ...errors };
    delete newErrors[field];
    setErrors(newErrors);
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  const getFieldError = (field) => {
    return errors[field] || null;
  };

  const hasErrors = Object.keys(errors).length > 0;

  return {
    errors,
    showNotification,
    validateField,
    validateForm,
    clearError,
    clearAllErrors,
    getFieldError,
    hasErrors,
    setShowNotification
  };
};




