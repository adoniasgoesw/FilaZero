import React, { useState } from 'react';
import { Users } from 'lucide-react';
import ValidationNotification from '../elements/ValidationNotification';
import { useFormValidation } from '../../hooks/useFormValidation';


const FormClient = ({ onSave }) => {
  const [formData, setFormData] = useState({
    nome: '',
    cpfCnpj: '',
    endereco: '',
    whatsapp: '',
    email: '',
    taxaEntrega: ''
  });

  // Hook de validação
  const {
    errors,
    showNotification,
    validateForm,
    clearError,
    getFieldError,
    setShowNotification
  } = useFormValidation();

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationRules = {
      nome: { required: true, label: 'Nome' }
    };

    const isValid = validateForm(formData, validationRules);
    if (!isValid) {
      return;
    }

    try {
      if (onSave) {
        await Promise.resolve(onSave(formData));
      }
      window.dispatchEvent(new CustomEvent('modalSaveSuccess', { detail: formData }));
    } catch (err) {
      console.error('Erro ao salvar cliente:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col bg-white">
      {/* Conteúdo do formulário */}
      <div className="flex-1 p-2 sm:p-4 max-h-96 overflow-y-auto scrollbar-hide space-y-4 sm:space-y-6">
        {/* Nome - Obrigatório (largura total) */}
        <div className="col-span-2">
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
            Nome
          </label>
          <input
            type="text"
            value={formData.nome}
            onChange={(e) => {
              handleInputChange('nome', e.target.value);
              clearError('nome');
            }}
            className={`w-full px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              getFieldError('nome') ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Nome completo"
          />
          {getFieldError('nome') && (
            <p className="text-xs text-red-500 mt-1">{getFieldError('nome')}</p>
          )}
        </div>

        {/* Grid de 2 colunas para os outros campos */}
        <div className="grid grid-cols-2 gap-4">
          {/* CPF/CNPJ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CPF ou CNPJ
            </label>
            <input
              type="text"
              value={formData.cpfCnpj}
              onChange={(e) => handleInputChange('cpfCnpj', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
            />
          </div>

          {/* Endereço */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endereço
            </label>
            <input
              type="text"
              value={formData.endereco}
              onChange={(e) => handleInputChange('endereco', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Endereço completo"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp
            </label>
            <input
              type="text"
              value={formData.whatsapp}
              onChange={(e) => handleInputChange('whatsapp', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="(00) 00000-0000"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="email@exemplo.com"
            />
          </div>

          {/* Taxa de Entrega */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Taxa de Entrega
            </label>
            <input
              type="text"
              value={formData.taxaEntrega}
              onChange={(e) => handleInputChange('taxaEntrega', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="R$ 0,00"
            />
          </div>
        </div>
      </div>

      {/* Notificação de Validação */}
      <ValidationNotification
        isOpen={showNotification}
        onClose={() => setShowNotification(false)}
        errors={errors}
        title="Campos obrigatórios não preenchidos"
      />
    </form>
  );
};

export default FormClient;
