import React, { useState } from 'react';
import api from '../../services/api';
import ValidationNotification from '../elements/ValidationNotification';
import { useFormValidation } from '../../hooks/useFormValidation';

const FormComplementos = ({ complemento = null, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nome: '',
    valorVenda: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Hook de validação
  const {
    errors,
    showNotification,
    validateForm,
    clearError,
    getFieldError,
    setShowNotification
  } = useFormValidation();

  // Detectar se é modo de edição
  const isEditMode = !!complemento;

  // Preencher formulário com dados do complemento (modo edição)
  React.useEffect(() => {
    if (complemento) {
      setFormData({
        nome: complemento.nome || '',
        valorVenda: complemento.valor_venda || ''
      });
    }
  }, [complemento]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validações
    const validationRules = {
      nome: { required: true, label: 'Nome do complemento' },
      valorVenda: { required: true, label: 'Valor de venda' }
    };

    const isValid = validateForm(formData, validationRules);
    if (!isValid) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Criar dados para envio
      const dataToSend = {
        nome: formData.nome.trim(),
        valor_venda: formData.valorVenda
      };

      if (isEditMode) {
        // Modo de edição
        const response = await api.put(`/complementos/${complemento.id}`, dataToSend);
        
        if (response.success) {
          console.log('✅ Complemento editado com sucesso');
          // Notificar modal para fechar
          window.dispatchEvent(new CustomEvent('modalSaveSuccess', { detail: response.data }));
        }
      } else {
        // Modo de criação
        const estabelecimentoId = localStorage.getItem('estabelecimentoId');
        if (!estabelecimentoId) {
          throw new Error('Estabelecimento não identificado!');
        }
        
        const response = await api.post('/complementos', {
          ...dataToSend,
          estabelecimento_id: estabelecimentoId
        });
        
        if (response.success) {
          console.log('✅ Complemento criado com sucesso');
          // Notificar modal para fechar
          window.dispatchEvent(new CustomEvent('modalSaveSuccess', { detail: response.data }));
        }
      }
    } catch (error) {
      const errorMessage = isEditMode ? 'Erro ao atualizar complemento: ' : 'Erro ao cadastrar complemento: ';
      setError(errorMessage + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col modal-form bg-white">
      {/* Conteúdo do formulário */}
      <div className="flex-1 p-2 sm:p-4 max-h-96 overflow-y-auto scrollbar-hide space-y-4 sm:space-y-6">
        {/* Nome - Obrigatório */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Complemento
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
            placeholder="Ex: Refrigerante, Batata Frita"
          />
          {getFieldError('nome') && (
            <p className="text-xs text-red-500 mt-1">{getFieldError('nome')}</p>
          )}
        </div>

        {/* Valor de Venda - Obrigatório */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Valor de Venda
          </label>
          <input
            type="text"
            value={formData.valorVenda}
            onChange={(e) => {
              handleInputChange('valorVenda', e.target.value);
              clearError('valorVenda');
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              getFieldError('valorVenda') ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="R$ 0,00"
          />
          {getFieldError('valorVenda') && (
            <p className="text-xs text-red-500 mt-1">{getFieldError('valorVenda')}</p>
          )}
        </div>
        
        {/* Mensagem de erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-xs font-bold">!</span>
                </div>
              </div>
              <p className="text-sm text-red-700 leading-relaxed">{error}</p>
            </div>
          </div>
        )}
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

export default FormComplementos;
