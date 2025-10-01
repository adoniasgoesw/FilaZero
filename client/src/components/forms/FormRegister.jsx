import React, { useState } from 'react';
import api from '../../services/api';
import { User, Building, Lock, ArrowRight, ArrowLeft } from 'lucide-react';
import CelebrationSuccess from '../elements/CelebrationSuccess';
import CloseButton from '../buttons/Close';

// Funções de validação de CPF e CNPJ
const validateCPF = (cpf) => {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(10))) return false;
  
  return true;
};

const validateCNPJ = (cnpj) => {
  // Remove caracteres não numéricos
  cnpj = cnpj.replace(/[^\d]/g, '');
  
  // Verifica se tem 14 dígitos
  if (cnpj.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  let weight = 2;
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(cnpj.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  let remainder = sum % 11;
  let firstDigit = remainder < 2 ? 0 : 11 - remainder;
  if (firstDigit !== parseInt(cnpj.charAt(12))) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  weight = 2;
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(cnpj.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  remainder = sum % 11;
  let secondDigit = remainder < 2 ? 0 : 11 - remainder;
  if (secondDigit !== parseInt(cnpj.charAt(13))) return false;
  
  return true;
};

function FormRegister() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Etapa 1: Dados do usuário
    name: '',
    email: '',
    whatsapp: '',
    
    // Etapa 2: Dados do estabelecimento
    establishmentName: '',
    establishmentSector: '',
    cnpj: '',
    
    // Etapa 3: Dados de acesso
    cpf: '',
    password: '',
    confirmPassword: ''
  });

  const [validationErrors, setValidationErrors] = useState({
    cpf: '',
    cnpj: '',
    email: ''
  });

  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    symbol: false
  });

  const [passwordMatch, setPasswordMatch] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleCelebrationComplete = async () => {
    setShowCelebration(false);
    
    // Fazer login automático após a celebração
    try {
      console.log('Iniciando login automático...');
      console.log('CPF:', formData.cpf);
      console.log('Senha:', formData.password);
      
      const loginPayload = {
        cpf: formData.cpf,
        senha: formData.password
      };
      
      console.log('Payload de login:', loginPayload);
      
      const loginResponse = await api.post('/login', loginPayload);
      
      console.log('Resposta do login:', loginResponse);
      
      if (loginResponse.data && loginResponse.data.success) {
        // Salvar token e dados do usuário
        localStorage.setItem('token', loginResponse.data.token);
        localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
        
        console.log('Login automático bem-sucedido! Redirecionando...');
        
        // Redirecionar para a página home
        window.location.href = '/home';
      } else {
        console.log('Login automático falhou, mostrando formulário de login');
        // Se o login automático falhar, mostrar formulário de login
        window.dispatchEvent(new CustomEvent('switchToLogin'));
      }
    } catch (error) {
      console.error('Erro no login automático:', error);
      console.log('Erro completo:', error.response?.data);
      // Se houver erro, mostrar formulário de login
      window.dispatchEvent(new CustomEvent('switchToLogin'));
    }
  };

  const sectors = [
    'Pizzaria',
    'Hamburgueria',
    'Lanchonete',
    'Churrascaria',
    'Restaurante',
    'Café',
    'Sorveteria',
    'Padaria',
    'Açougue',
    'Mercearia',
    'Farmácia',
    'Outros'
  ];

  // Função para formatar CPF
  const formatCPF = (value) => {
    const numbers = value.replace(/[^\d]/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Função para formatar CNPJ
  const formatCNPJ = (value) => {
    const numbers = value.replace(/[^\d]/g, '');
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  // Função para formatar WhatsApp
  const formatWhatsApp = (value) => {
    const numbers = value.replace(/[^\d]/g, '');
    
    // Limitar a 11 dígitos
    const limitedNumbers = numbers.slice(0, 11);
    
    if (limitedNumbers.length <= 2) {
      return limitedNumbers;
    } else if (limitedNumbers.length <= 7) {
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`;
    } else {
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7)}`;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Formatar CPF, CNPJ e WhatsApp
    if (name === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (name === 'cnpj') {
      formattedValue = formatCNPJ(value);
    } else if (name === 'whatsapp') {
      formattedValue = formatWhatsApp(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Validação de senha em tempo real
    if (name === 'password') {
      validatePassword(formattedValue);
      // Verificar se as senhas coincidem quando a senha principal muda
      if (formData.confirmPassword) {
        checkPasswordMatch(formattedValue, formData.confirmPassword);
      }
    } else if (name === 'confirmPassword') {
      // Verificar se as senhas coincidem quando a confirmação muda
      checkPasswordMatch(formData.password, formattedValue);
    }

    // Validação em tempo real para CPF e CNPJ
    if (name === 'cpf') {
      const cpfValue = value.replace(/[^\d]/g, '');
      if (cpfValue.length === 11) {
        if (!validateCPF(cpfValue)) {
          setValidationErrors(prev => ({ ...prev, cpf: 'CPF inválido' }));
        } else {
          setValidationErrors(prev => ({ ...prev, cpf: '' }));
        }
      } else if (cpfValue.length > 0) {
        setValidationErrors(prev => ({ ...prev, cpf: 'CPF deve ter 11 dígitos' }));
      } else {
        setValidationErrors(prev => ({ ...prev, cpf: '' }));
      }
    }

    if (name === 'cnpj') {
      const cnpjValue = value.replace(/[^\d]/g, '');
      if (cnpjValue.length === 14) {
        if (!validateCNPJ(cnpjValue)) {
          setValidationErrors(prev => ({ ...prev, cnpj: 'CNPJ inválido' }));
        } else {
          setValidationErrors(prev => ({ ...prev, cnpj: '' }));
        }
      } else if (cnpjValue.length > 0) {
        setValidationErrors(prev => ({ ...prev, cnpj: 'CNPJ deve ter 14 dígitos' }));
      } else {
        setValidationErrors(prev => ({ ...prev, cnpj: '' }));
      }
    }
  };

  const isStep1Valid = () => {
    return (
      formData.name.trim() &&
      formData.email.trim() &&
      formData.whatsapp.trim()
    );
  };

  const isStep2Valid = () => {
    const cnpjValid = !formData.cnpj || validateCNPJ(formData.cnpj);
    return (
      formData.establishmentName.trim() &&
      formData.establishmentSector.trim() &&
      cnpjValid
    );
  };


  // Função para validar senha em tempo real
  const validatePassword = (password) => {
    const validation = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      symbol: /[^A-Za-z0-9]/.test(password)
    };
    
    setPasswordValidation(validation);
    return Object.values(validation).every(Boolean);
  };

  // Função para verificar se as senhas coincidem
  const checkPasswordMatch = (password, confirmPassword) => {
    const match = password === confirmPassword && password.length > 0;
    setPasswordMatch(match);
    return match;
  };

  const isStep3Valid = () => {
    return (
      formData.cpf.trim() &&
      formData.password.trim() &&
      formData.confirmPassword.trim() &&
      passwordMatch &&
      Object.values(passwordValidation).every(Boolean) &&
      validateCPF(formData.cpf)
    );
  };

  const nextStep = () => {
    if (currentStep < 3) {
      if ((currentStep === 1 && !isStep1Valid()) || (currentStep === 2 && !isStep2Valid())) return;
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isStep1Valid() || !isStep2Valid() || !isStep3Valid()) return;
    
    try {
      // Limpar erros anteriores
      setValidationErrors({
        cpf: '',
        cnpj: '',
        email: ''
      });
      
      const payload = {
        nome_completo: formData.name,
        email: formData.email,
        whatsapp: formData.whatsapp,
        estabelecimento_nome: formData.establishmentName,
        estabelecimento_setor: formData.establishmentSector,
        cnpj: formData.cnpj || '',
        cpf: formData.cpf,
        senha: formData.password
      };
      
      const res = await api.post('/register', payload);
      if (res.success) {
        setShowCelebration(true);
      }
    } catch (err) {
      console.error('Erro no cadastro:', err);
      
      if (err.response?.data?.message) {
        const errorMessage = err.response.data.message.toLowerCase();
        
        // Verificar se é erro de duplicata e exibir no campo correto
        if (errorMessage.includes('cpf') && (errorMessage.includes('já') || errorMessage.includes('existe'))) {
          setValidationErrors(prev => ({ ...prev, cpf: 'CPF já está em uso' }));
        } else if (errorMessage.includes('email') && (errorMessage.includes('já') || errorMessage.includes('existe'))) {
          setValidationErrors(prev => ({ ...prev, email: 'E-mail já existe' }));
        } else if (errorMessage.includes('cnpj') && (errorMessage.includes('já') || errorMessage.includes('existe'))) {
          setValidationErrors(prev => ({ ...prev, cnpj: 'CNPJ já está em uso' }));
        } else {
          // Para outros erros, mostrar alerta
          alert('Falha ao registrar: ' + err.response.data.message);
        }
      } else {
        alert('Falha ao registrar: ' + (err?.message || 'Erro desconhecido'));
      }
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Dados do Usuário';
      case 2:
        return 'Dados do Estabelecimento';
      case 3:
        return 'Dados de Acesso';
      default:
        return '';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return 'Informe seus dados pessoais';
      case 2:
        return 'Informe os dados do seu estabelecimento';
      case 3:
        return 'Crie suas credenciais de acesso';
      default:
        return '';
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      {/* Nome */}
      <div className="space-y-2">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nome Completo
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
                     <input
             type="text"
             id="name"
             name="name"
             value={formData.name}
             onChange={handleInputChange}
             placeholder="Digite seu nome completo"
             className="block w-full pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm sm:text-base"
             required
           />
        </div>
      </div>

      {/* E-mail */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          E-mail
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="seu@email.com"
            className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
              validationErrors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            required
          />
        </div>
        {validationErrors.email && (
          <p className="text-sm text-red-600">{validationErrors.email}</p>
        )}
      </div>

      {/* WhatsApp */}
      <div className="space-y-2">
        <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">
          WhatsApp
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="tel"
            id="whatsapp"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleInputChange}
            placeholder="(11) 99999-9999"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      {/* Nome do Estabelecimento */}
      <div className="space-y-2">
        <label htmlFor="establishmentName" className="block text-sm font-medium text-gray-700">
          Nome do Estabelecimento
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Building className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="establishmentName"
            name="establishmentName"
            value={formData.establishmentName}
            onChange={handleInputChange}
            placeholder="Nome do seu estabelecimento"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Setor do Estabelecimento */}
      <div className="space-y-2">
        <label htmlFor="establishmentSector" className="block text-sm font-medium text-gray-700">
          Setor do Estabelecimento
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Building className="h-5 w-5 text-gray-400" />
          </div>
          <select
            id="establishmentSector"
            name="establishmentSector"
            value={formData.establishmentSector}
            onChange={handleInputChange}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            required
          >
            <option value="">Selecione um setor</option>
            {sectors.map((sector) => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CNPJ */}
      <div className="space-y-2">
        <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700">
          CNPJ
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Building className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="cnpj"
            name="cnpj"
            value={formData.cnpj}
            onChange={handleInputChange}
            placeholder="00.000.000/0000-00"
            className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
              validationErrors.cnpj ? 'border-red-300' : 'border-gray-300'
            }`}
            required={false}
          />
        </div>
        {validationErrors.cnpj && (
          <p className="text-sm text-red-600">{validationErrors.cnpj}</p>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      {/* CPF */}
      <div className="space-y-2">
        <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">
          CPF
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="cpf"
            name="cpf"
            value={formData.cpf}
            onChange={handleInputChange}
            placeholder="000.000.000-00"
            className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
              validationErrors.cpf ? 'border-red-300' : 'border-gray-300'
            }`}
            required
          />
        </div>
        {validationErrors.cpf && (
          <p className="text-sm text-red-600">{validationErrors.cpf}</p>
        )}
      </div>

      {/* Senha */}
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Senha
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Digite sua senha"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            required
          />
        </div>
        
        {/* Indicadores de validação da senha */}
        <div className="space-y-1 mt-2">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${passwordValidation.length ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className={`text-xs ${passwordValidation.length ? 'text-green-600' : 'text-gray-500'}`}>
              Pelo menos 8 caracteres
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${passwordValidation.uppercase ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className={`text-xs ${passwordValidation.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
              Uma letra maiúscula
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${passwordValidation.lowercase ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className={`text-xs ${passwordValidation.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
              Uma letra minúscula
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${passwordValidation.number ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className={`text-xs ${passwordValidation.number ? 'text-green-600' : 'text-gray-500'}`}>
              Um número
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${passwordValidation.symbol ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className={`text-xs ${passwordValidation.symbol ? 'text-green-600' : 'text-gray-500'}`}>
              Um símbolo
            </span>
          </div>
        </div>
      </div>

      {/* Confirmar Senha */}
      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirmar Senha
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirme sua senha"
            className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
              formData.confirmPassword && !passwordMatch ? 'border-red-300' : 
              formData.confirmPassword && passwordMatch ? 'border-green-300' : 
              'border-gray-300'
            }`}
            required
          />
        </div>
        {formData.confirmPassword && !passwordMatch && (
          <p className="text-sm text-red-600">As senhas não coincidem</p>
        )}
        {formData.confirmPassword && passwordMatch && (
          <p className="text-sm text-green-600">As senhas coincidem</p>
        )}
      </div>
    </div>
  );

  // Se estiver mostrando a celebração, renderizar apenas ela
  if (showCelebration) {
    return <CelebrationSuccess onComplete={handleCelebrationComplete} />;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header do formulário */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg text-[24px] sm:text-3xl md:text-3xl font-bold text-gray-900 mb-0">Criar Conta</h1>
              <p className="text-gray-400 text-xs sm:text-sm font-light">Preencha os dados para criar sua conta</p>
            </div>
            <CloseButton onClick={() => {
              console.log('Close button clicked in FormRegister');
              // Disparar evento para fechar o modal com animação
              window.dispatchEvent(new CustomEvent('closeModal'));
            }} variant="minimal" />
          </div>
        </div>

      {/* Barra de Progresso Simples */}
      <div className="px-6 pb-4">
        <div className="mb-4">
          {/* Barra de progresso */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-gray-900 to-gray-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Conteúdo do formulário */}
      <div className="flex-1 px-6 pb-6">
    <form onSubmit={handleSubmit} className="space-y-4">
        {/* Título da etapa atual */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{getStepTitle()}</h3>
          <p className="text-sm text-gray-500 mt-1">{getStepDescription()}</p>
        </div>

      {/* Conteúdo da etapa atual */}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}

      {/* Botões de navegação */}
      <div className="flex items-center justify-between gap-4 pt-4">
        <button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors duration-200 ${
            currentStep === 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">Anterior</span>
        </button>

        {currentStep < 3 ? (
          <button
            type="button"
            onClick={nextStep}
              className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200"
          >
            <span className="text-sm sm:text-base">Próximo</span>
            <ArrowRight size={18} className="sm:w-5 sm:h-5" />
          </button>
        ) : (
          <button
            type="submit"
              className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200"
          >
            <span className="text-sm sm:text-base">Registrar</span>
          </button>
        )}
      </div>

      {/* Link para login */}
      <div className="text-center pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          Já possui uma conta?{' '}
          <button
            type="button"
              className="text-gray-900 hover:text-gray-700 font-bold"
            onClick={() => window.dispatchEvent(new CustomEvent('switchToLogin'))}
          >
            Login
          </button>
        </p>
      </div>
      </form>
      </div>
    </div>
  );
}

export default FormRegister;