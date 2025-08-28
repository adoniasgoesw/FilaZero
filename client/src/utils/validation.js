// Sistema de validação centralizado
export const validationRules = {
  // Validação de CPF
  cpf: {
    required: true,
    pattern: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    message: 'CPF deve estar no formato 000.000.000-00'
  },

  // Validação de email
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Email deve ser válido'
  },

  // Validação de nome
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    message: 'Nome deve ter entre 2 e 100 caracteres'
  },

  // Validação de preço
  price: {
    required: true,
    min: 0,
    pattern: /^\d+(\.\d{1,2})?$/,
    message: 'Preço deve ser um número válido'
  },

  // Validação de quantidade
  quantity: {
    required: true,
    min: 0,
    pattern: /^\d+$/,
    message: 'Quantidade deve ser um número inteiro positivo'
  }
};

// Função para validar um campo
export const validateField = (value, rules) => {
  if (rules.required && (!value || value.toString().trim() === '')) {
    return 'Este campo é obrigatório';
  }

  if (rules.minLength && value && value.length < rules.minLength) {
    return `Mínimo de ${rules.minLength} caracteres`;
  }

  if (rules.maxLength && value && value.length > rules.maxLength) {
    return `Máximo de ${rules.maxLength} caracteres`;
  }

  if (rules.min !== undefined && value !== '' && parseFloat(value) < rules.min) {
    return `Valor mínimo é ${rules.min}`;
  }

  if (rules.pattern && value && !rules.pattern.test(value)) {
    return rules.message || 'Formato inválido';
  }

  return null; // Sem erro
};

// Função para validar um formulário completo
export const validateForm = (formData, validationSchema) => {
  const errors = {};

  Object.keys(validationSchema).forEach(fieldName => {
    const fieldRules = validationSchema[fieldName];
    const fieldValue = formData[fieldName];
    
    const error = validateField(fieldValue, fieldRules);
    if (error) {
      errors[fieldName] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Função para formatar CPF
export const formatCPF = (value) => {
  const v = value.replace(/\D/g, '');
  return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

// Função para limpar CPF
export const cleanCPF = (value) => {
  return value.replace(/\D/g, '');
};

export default {
  validationRules,
  validateField,
  validateForm,
  formatCPF,
  cleanCPF
};
