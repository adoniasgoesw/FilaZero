import React, { useState } from 'react';
import { Package, DollarSign } from 'lucide-react';
import api from '../../services/api';
import ValidationNotification from '../elements/ValidationNotification';
import { useFormValidation } from '../../hooks/useFormValidation';
import FormContainer from './FormContainer';
import FormField from './FormField';
import FormInput from './FormInput';

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
          // Disparar eventos de atualização em tempo real
          window.dispatchEvent(new CustomEvent('complementoUpdated'));
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
          // Disparar eventos de atualização em tempo real
          window.dispatchEvent(new CustomEvent('complementoUpdated'));
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
      <FormContainer>
        {/* Nome - Obrigatório */}
        <FormField 
          label="Nome do Complemento" 
          required
          error={getFieldError('nome')}
          helpText="Nome que aparecerá na listagem de complementos"
        >
          <FormInput
            type="text"
            value={formData.nome}
            onChange={(e) => {
              handleInputChange('nome', e.target.value);
              clearError('nome');
            }}
            placeholder="Ex: Refrigerante, Batata Frita"
            icon={Package}
            error={!!getFieldError('nome')}
          />
        </FormField>

        {/* Valor de Venda - Obrigatório */}
        <FormField 
          label="Valor de Venda" 
          required
          error={getFieldError('valorVenda')}
          helpText="Preço de venda do complemento"
        >
          <FormInput
            type="text"
            value={formData.valorVenda}
            onChange={(e) => {
              handleInputChange('valorVenda', e.target.value);
              clearError('valorVenda');
            }}
            placeholder="R$ 0,00"
            icon={DollarSign}
            error={!!getFieldError('valorVenda')}
          />
        </FormField>
        
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
      </FormContainer>

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
