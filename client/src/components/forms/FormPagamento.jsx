import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Smartphone, Banknote } from 'lucide-react';
import api from '../../services/api';
import FormContainer from './FormContainer';
import FormField from './FormField';
import FormInput from './FormInput';
import FormSelect from './FormSelect';
import FormGrid from './FormGrid';

const FormPagamento = ({ onSave, pagamentoData, onClose }) => {
  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    taxa: '',
    conta_bancaria: ''
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Carregar dados do pagamento quando o componente monta (para edição)
  useEffect(() => {
    if (pagamentoData) {
      setFormData({
        nome: pagamentoData.nome || '',
        tipo: pagamentoData.tipo || '',
        taxa: pagamentoData.taxa || '',
        conta_bancaria: pagamentoData.conta_bancaria || ''
      });
    }
  }, [pagamentoData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validarFormulario = () => {
    const newErrors = {};

    // Nome é obrigatório
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < 2) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Tipo é obrigatório
    if (!formData.tipo.trim()) {
      newErrors.tipo = 'Tipo é obrigatório';
    } else if (formData.tipo.trim().length < 2) {
      newErrors.tipo = 'Tipo deve ter pelo menos 2 caracteres';
    }

    // Validação de taxa se fornecida
    if (formData.taxa && formData.taxa !== '') {
      const taxa = parseFloat(formData.taxa);
      if (isNaN(taxa) || taxa < 0) {
        newErrors.taxa = 'Taxa deve ser um número válido maior ou igual a zero';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    // Disparar evento de sucesso do modal IMEDIATAMENTE
    window.dispatchEvent(new CustomEvent('modalSaveSuccess', { 
      detail: { 
        message: pagamentoData ? 'Pagamento atualizado com sucesso!' : 'Pagamento cadastrado com sucesso!',
        data: formData
      }
    }));
    
    // Disparar evento de atualização em tempo real
    window.dispatchEvent(new CustomEvent('pagamentoUpdated'));
    window.dispatchEvent(new CustomEvent('refreshPagamentos'));
    
    if (onClose) onClose();
    
    // Salvar no backend em background (sem bloquear a UI)
    try {
      const estabelecimentoId = Number(localStorage.getItem('estabelecimentoId')) || null;
      if (!estabelecimentoId) {
        console.error('Estabelecimento não definido. Faça login novamente.');
        return;
      }

      const dadosPagamento = {
        estabelecimento_id: estabelecimentoId,
        nome: formData.nome.trim(),
        tipo: formData.tipo.trim(),
        taxa: formData.taxa ? parseFloat(formData.taxa) : 0,
        conta_bancaria: formData.conta_bancaria.trim() || null
      };

      let res;
      if (pagamentoData) {
        // Editar pagamento
        res = await api.put(`/pagamentos/${pagamentoData.id}`, dadosPagamento);
      } else {
        // Cadastrar pagamento
        res = await api.post('/pagamentos', dadosPagamento);
      }

      if (res.success) {
        if (onSave) onSave(res.data);
        console.log('✅ Forma de pagamento salva com sucesso');
      } else {
        console.error('Erro ao salvar pagamento:', res.message);
      }
    } catch (err) {
      console.error('Erro ao salvar pagamento:', err);
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo.toLowerCase()) {
      case 'dinheiro':
        return <Banknote className="w-4 h-4" />;
      case 'pix':
        return <Smartphone className="w-4 h-4" />;
      case 'cartão':
      case 'cartao':
        return <CreditCard className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col modal-form bg-white">
      <FormContainer>
        {/* Nome */}
        <FormField 
          label="Nome" 
          required
          error={errors.nome}
          helpText="Nome que aparecerá na listagem de formas de pagamento"
        >
          <FormInput
            type="text"
            required
            value={formData.nome}
            onChange={(e) => handleInputChange('nome', e.target.value)}
            placeholder="Nome do pagamento"
            icon={DollarSign}
            error={!!errors.nome}
          />
        </FormField>

        {/* Tipo */}
        <FormField 
          label="Tipo" 
          required
          error={errors.tipo}
          helpText="Tipo de forma de pagamento"
        >
          <FormSelect
            value={formData.tipo}
            onChange={(e) => handleInputChange('tipo', e.target.value)}
            options={[
              { value: 'Dinheiro', label: 'Dinheiro' },
              { value: 'PIX', label: 'PIX' },
              { value: 'Cartão', label: 'Cartão' },
              { value: 'Transferência', label: 'Transferência' },
              { value: 'Outros', label: 'Outros' }
            ]}
            placeholder="Selecione o tipo"
            icon={CreditCard}
            error={!!errors.tipo}
            required
          />
        </FormField>

        {/* Taxa e Conta Bancária */}
        <FormGrid cols={2}>
          <FormField 
            label="Taxa (%)"
            error={errors.taxa}
            helpText="Taxa cobrada por esta forma de pagamento"
          >
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-sm">%</span>
              <FormInput
                type="number"
                step="0.01"
                min="0"
                value={formData.taxa}
                onChange={(e) => handleInputChange('taxa', e.target.value)}
                placeholder="0,00"
                error={!!errors.taxa}
                className="pl-8"
              />
            </div>
          </FormField>

          <FormField 
            label="Conta Bancária"
            helpText="Número da conta bancária (opcional)"
          >
            <FormInput
              type="text"
              value={formData.conta_bancaria}
              onChange={(e) => handleInputChange('conta_bancaria', e.target.value)}
              placeholder="Número da conta"
              icon={Banknote}
            />
          </FormField>
        </FormGrid>

        {/* Preview do ícone baseado no tipo */}
        {formData.tipo && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                {getTipoIcon(formData.tipo)}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">{formData.nome || 'Nome do pagamento'}</div>
                <div className="text-xs text-gray-500">{formData.tipo}</div>
                {formData.taxa && (
                  <div className="text-xs text-gray-500">Taxa: {formData.taxa}%</div>
                )}
              </div>
            </div>
          </div>
        )}
      </FormContainer>
    </form>
  );
};

export default FormPagamento;


















