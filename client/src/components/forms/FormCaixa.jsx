import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign } from 'lucide-react';
import api from '../../services/api';
import FormContainer from './FormContainer';
import FormField from './FormField';
import FormInput from './FormInput';
import FormGrid from './FormGrid';

const FormCaixa = ({ onSave }) => {
  const [formData, setFormData] = useState({
    valorAbertura: '',
    cedulas: {
      '2': 0,
      '5': 0,
      '10': 0,
      '20': 0,
      '50': 0,
      '100': 0,
      '200': 0,
      '1': 0,
      '0.50': 0,
      '0.25': 0,
      '0.10': 0,
      '0.01': 0
    }
  });
  const [showContagem, setShowContagem] = useState(false);

  // Função para formatar moeda brasileira
  const formatCurrency = (value) => {
    if (!value) return '';
    const num = Number(value) || 0;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(num);
  };

  // Função para converter valor formatado para número
  const parseCurrency = (value) => {
    if (!value) return '';
    // Remove R$, espaços, pontos (separadores de milhares) e substitui vírgula por ponto
    const cleanValue = value.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
    return cleanValue;
  };

  // Função para formatar valor durante a digitação (mais permissiva)
  const formatCurrencyInput = (value) => {
    if (!value) return '';
    // Remove caracteres não numéricos exceto vírgula e ponto
    const cleanValue = value.replace(/[^\d,.]/g, '');
    
    // Se tem vírgula, trata como decimal brasileiro
    if (cleanValue.includes(',')) {
      const parts = cleanValue.split(',');
      if (parts.length === 2) {
        // Formato: 123,45
        const integer = parts[0].replace(/\./g, '');
        const decimal = parts[1].substring(0, 2); // Máximo 2 casas decimais
        return `R$ ${integer},${decimal}`;
      }
    }
    
    // Se tem ponto, trata como decimal americano
    if (cleanValue.includes('.') && !cleanValue.includes(',')) {
      const parts = cleanValue.split('.');
      if (parts.length === 2) {
        const integer = parts[0];
        const decimal = parts[1].substring(0, 2);
        return `R$ ${integer},${decimal}`;
      }
    }
    
    // Apenas números inteiros
    const integer = cleanValue.replace(/[^\d]/g, '');
    if (integer) {
      return `R$ ${integer}`;
    }
    
    return value;
  };

  // Calcular valor de abertura automaticamente quando cédulas/moedas mudam
  useEffect(() => {
    if (showContagem) {
      let total = 0;
      
      console.log('🧮 Calculando valor de abertura...');
      console.log('📊 Cédulas atuais:', formData.cedulas);
      
      // Soma das cédulas e moedas
      Object.entries(formData.cedulas).forEach(([valor, quantidade]) => {
        const qty = quantidade === '' ? 0 : (parseInt(quantidade) || 0);
        const valorNumerico = parseFloat(valor);
        const subtotal = valorNumerico * qty;
        
        console.log(`💰 R$ ${valor} x ${qty} = R$ ${subtotal.toFixed(2)}`);
        total += subtotal;
      });
      
      console.log('💵 Total calculado:', total);
      console.log('💵 Total formatado:', formatCurrency(total));
      
      setFormData(prev => ({
        ...prev,
        valorAbertura: formatCurrency(total)
      }));
    }
  }, [formData.cedulas, showContagem]);

  const handleInputChange = (field, value) => {
    if (field === 'valorAbertura') {
      // Formatar valor durante a digitação de forma mais permissiva
      const formattedValue = formatCurrencyInput(value);
      setFormData(prev => ({
        ...prev,
        [field]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleInputBlur = (field, value) => {
    if (field === 'valorAbertura') {
      // Formatar valor quando o usuário sair do campo
      const numericValue = parseCurrency(value);
      if (numericValue !== '' && !isNaN(numericValue) && parseFloat(numericValue) > 0) {
        setFormData(prev => ({
          ...prev,
          [field]: formatCurrency(numericValue)
        }));
      }
    }
  };

  const handleCedulaChange = (valor, quantidade) => {
    // Permitir string vazia para facilitar a digitação
    const value = quantidade === '' ? '' : (parseInt(quantidade) || 0);
    setFormData(prev => ({
      ...prev,
      cedulas: {
        ...prev.cedulas,
        [valor]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('💾 Submetendo caixa...');
    console.log('📝 Valor de abertura (formato):', formData.valorAbertura);
    
    // Converter valor formatado para número
    const valorNumerico = parseCurrency(formData.valorAbertura);
    
    console.log('🔢 Valor numérico convertido:', valorNumerico);
    console.log('🔢 Valor como float:', parseFloat(valorNumerico));
    console.log('🔍 Teste de conversão:');
    console.log('  - R$ 1.000,00 ->', parseCurrency('R$ 1.000,00'));
    console.log('  - R$ 2.500,00 ->', parseCurrency('R$ 2.500,00'));
    console.log('  - R$ 12.750,00 ->', parseCurrency('R$ 12.750,00'));
    
    if (!valorNumerico || parseFloat(valorNumerico) <= 0) {
      alert('Valor de abertura é obrigatório e deve ser maior que zero!');
      return;
    }
    
    try {
      const estabelecimentoId = Number(localStorage.getItem('estabelecimentoId')) || null;
      if (!estabelecimentoId) {
        alert('Estabelecimento não definido. Faça login novamente.');
        return;
      }
      const userId = Number(localStorage.getItem('userId')) || null;
      if (!userId) {
        alert('Usuário não identificado. Faça login novamente.');
        return;
      }
      
      const valorFinal = parseFloat(valorNumerico);
      console.log('🚀 Enviando para API - valor_abertura:', valorFinal);
      
      const res = await api.post('/caixas', {
        estabelecimento_id: estabelecimentoId,
        valor_abertura: valorFinal
      });
      
      if (res.success) {
        if (onSave) onSave(res.data);
        window.dispatchEvent(new CustomEvent('modalSaveSuccess', { detail: res.data }));
      } else {
        alert(res.message || 'Erro ao abrir caixa');
      }
    } catch (err) {
      console.error('Erro ao abrir caixa:', err);
      alert('Erro ao abrir caixa');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col modal-form bg-white">
      <FormContainer>
        {/* Valor de Abertura */}
        <FormField 
          label="Valor de Abertura" 
          required
          helpText="Valor inicial disponível no caixa"
        >
          <FormInput
            type="text"
            required
            value={formData.valorAbertura}
            onChange={(e) => handleInputChange('valorAbertura', e.target.value)}
            onBlur={(e) => handleInputBlur('valorAbertura', e.target.value)}
            placeholder="R$ 0,00"
            icon={DollarSign}
          />
        </FormField>

        {/* Botão Contagem em Cédulas */}
        {!showContagem && (
          <div>
            <button
              type="button"
              onClick={() => setShowContagem(true)}
              className="w-full px-4 py-3 border-2 border-blue-500 text-blue-500 bg-white rounded-lg hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 font-medium flex items-center justify-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              + Contagem de Cédulas
            </button>
          </div>
        )}

        {/* Cédulas - só aparecem quando showContagem é true */}
        {showContagem && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Cédulas e Moedas
            </h3>
            
            <FormGrid cols={4}>
              {Object.entries(formData.cedulas).map(([valor, quantidade]) => (
                <FormField 
                  key={valor} 
                  label={`R$ ${valor}`}
                  className="text-center"
                >
                  <FormInput
                    type="number"
                    min="0"
                    value={quantidade === '' ? '' : quantidade}
                    onChange={(e) => handleCedulaChange(valor, e.target.value)}
                    placeholder="0"
                    className="text-center"
                  />
                </FormField>
              ))}
            </FormGrid>
          </div>
        )}
      </FormContainer>
    </form>
  );
};

export default FormCaixa;

