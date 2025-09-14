import React, { useState } from 'react';
import { User } from 'lucide-react';
import ValidationNotification from '../elements/ValidationNotification';
import { useFormValidation } from '../../hooks/useFormValidation';


const FormUser = ({ onSave }) => {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    senha: '',
    cargo: ''
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

  const cargos = [
    'Administrador',
    'Garçom',
    'Atendente',
    'Caixa',
    'Entregador',
    'Cozinheiro',
    'Empacotador',
    'Gerente'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationRules = {
      nome: { required: true, label: 'Nome' },
      cpf: { required: true, label: 'CPF' },
      senha: { required: true, label: 'Senha' },
      cargo: { required: true, label: 'Cargo' }
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
      console.error('Erro ao salvar usuário:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col bg-white">
      {/* Conteúdo do formulário */}
      <div className="flex-1 p-2 sm:p-4 max-h-96 overflow-y-auto scrollbar-hide space-y-4 sm:space-y-6">
        {/* Grid de 2 colunas */}
        <div className="grid grid-cols-2 gap-4">
          {/* Nome - Obrigatório */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome
            </label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => {
                handleInputChange('nome', e.target.value);
                clearError('nome');
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                getFieldError('nome') ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nome completo"
            />
            {getFieldError('nome') && (
              <p className="text-xs text-red-500 mt-1">{getFieldError('nome')}</p>
            )}
          </div>

          {/* CPF - Obrigatório */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CPF
            </label>
            <input
              type="text"
              value={formData.cpf}
              onChange={(e) => {
                handleInputChange('cpf', e.target.value);
                clearError('cpf');
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                getFieldError('cpf') ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="000.000.000-00"
            />
            {getFieldError('cpf') && (
              <p className="text-xs text-red-500 mt-1">{getFieldError('cpf')}</p>
            )}
          </div>

          {/* Email - Opcional */}
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

          {/* Cargo - Obrigatório */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cargo
            </label>
            <select
              value={formData.cargo}
              onChange={(e) => {
                handleInputChange('cargo', e.target.value);
                clearError('cargo');
              }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                getFieldError('cargo') ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Selecione o cargo</option>
              {cargos.map(cargo => (
                <option key={cargo} value={cargo}>{cargo}</option>
              ))}
            </select>
            {getFieldError('cargo') && (
              <p className="text-xs text-red-500 mt-1">{getFieldError('cargo')}</p>
            )}
          </div>
        </div>

        {/* Senha - Obrigatório (largura total) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Senha
          </label>
          <input
            type="password"
            value={formData.senha}
            onChange={(e) => {
              handleInputChange('senha', e.target.value);
              clearError('senha');
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              getFieldError('senha') ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Senha de acesso"
          />
          {getFieldError('senha') && (
            <p className="text-xs text-red-500 mt-1">{getFieldError('senha')}</p>
          )}
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

export default FormUser;
