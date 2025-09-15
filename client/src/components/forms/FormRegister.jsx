import React, { useState } from 'react';
import api from '../../services/api';
import { User, Building, Lock, ArrowRight, ArrowLeft, Check } from 'lucide-react';

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isStep1Valid = () => {
    return (
      formData.name.trim() &&
      formData.email.trim() &&
      formData.whatsapp.trim()
    );
  };

  const isStep2Valid = () => {
    return (
      formData.establishmentName.trim() &&
      formData.establishmentSector.trim()
    );
  };

  const isStrongPassword = (pwd) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])(?=.{8,})/.test(String(pwd || ''));

  const isStep3Valid = () => {
    return (
      formData.cpf.trim() &&
      formData.password.trim() &&
      formData.confirmPassword.trim() &&
      formData.password === formData.confirmPassword &&
      isStrongPassword(formData.password)
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
        window.dispatchEvent(new CustomEvent('switchToLogin'));
      }
    } catch (err) {
      // Exibir uma notificação simples
      alert('Falha ao registrar: ' + (err?.message || 'Erro desconhecido'));
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
    <div className="space-y-6">
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
             className="block w-full pl-10 pr-3 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
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
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
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
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={false}
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
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
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
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
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
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
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Barra de Progresso */}
      <div className="mb-6">
        {/* Barra de etapas centralizada */}
        <div className="flex items-center justify-center space-x-2 mb-6">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step < currentStep 
                  ? 'bg-green-500 text-white' 
                  : step === currentStep 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-500'
              }`}>
                {step < currentStep ? <Check size={16} /> : step}
              </div>
              {step < 3 && (
                <div className={`w-12 h-1 mx-2 ${
                  step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        
        {/* Título da etapa atual - menor e centralizado */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800">{getStepTitle()}</h3>
          <p className="text-sm text-gray-600 mt-1">{getStepDescription()}</p>
        </div>
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
            className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            <span className="text-sm sm:text-base">Próximo</span>
            <ArrowRight size={18} className="sm:w-5 sm:h-5" />
          </button>
        ) : (
          <button
            type="submit"
            className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors duration-200"
          >
            <Check size={18} className="sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Finalizar Cadastro</span>
          </button>
        )}
      </div>

      {/* Link para login */}
      <div className="text-center pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Já possui uma conta?{' '}
          <button
            type="button"
            className="text-blue-600 hover:text-blue-500 font-medium"
            onClick={() => window.dispatchEvent(new CustomEvent('switchToLogin'))}
          >
            Acessar conta
          </button>
        </p>
      </div>
    </form>
  );
}

export default FormRegister;