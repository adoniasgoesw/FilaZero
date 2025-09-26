import React, { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';
import api from '../../services/api';

// Função para formatar valores em reais (padrão brasileiro)
const formatCurrency = (value) => {
  const numValue = Number(value) || 0;
  return numValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Função para converter string formatada para número
const parseCurrency = (value) => {
  if (typeof value === 'string') {
    // Remove pontos e substitui vírgula por ponto
    return Number(value.replace(/\./g, '').replace(',', '.')) || 0;
  }
  return Number(value) || 0;
};

const FormFecharCaixa = ({ onSave, caixaData }) => {
  const [formData, setFormData] = useState({
    valorFechamento: '',
    saldoTotal: '',
    diferenca: '',
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
  const [saving, setSaving] = useState(false);
  const [saldoTotal, setSaldoTotal] = useState(0);
  const [diferenca, setDiferenca] = useState(0);
  const [showContagem, setShowContagem] = useState(false);

  // Função para carregar dados do caixa
  const loadCaixaData = async () => {
    try {
      const estabelecimentoId = Number(localStorage.getItem('estabelecimentoId'));
      if (estabelecimentoId) {
        console.log('🔄 Atualizando dados do caixa em tempo real...');
        const res = await api.get(`/caixas/aberto/${estabelecimentoId}`);
        console.log('📊 Resposta da API:', res);
        if (res.success && res.data?.caixa) {
          console.log('📋 Dados do caixa atualizados:', res.data.caixa);
          const saldo = Number(res.data.caixa.saldo_total) || 0;
          console.log('💰 Saldo total atualizado:', saldo);
          setSaldoTotal(saldo);
          setFormData(prev => ({
            ...prev,
            saldoTotal: formatCurrency(saldo)
          }));
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados do caixa:', error);
    }
  };

  // Carregar dados do caixa quando o componente monta
  useEffect(() => {
    loadCaixaData();
  }, [caixaData]);

  // Atualizar saldo em tempo real quando houver movimentações
  useEffect(() => {
    const handleMovimentacaoChanged = () => {
      console.log('🔄 Evento movimentacaoChanged recebido - atualizando saldo do caixa');
      loadCaixaData();
    };

    window.addEventListener('movimentacaoChanged', handleMovimentacaoChanged);
    
    return () => {
      window.removeEventListener('movimentacaoChanged', handleMovimentacaoChanged);
    };
  }, []);

  // Calcular valor de fechamento automaticamente quando cédulas/moedas mudam
  useEffect(() => {
    if (showContagem) {
      let total = 0;
      
      // Soma das cédulas e moedas
      Object.entries(formData.cedulas).forEach(([valor, quantidade]) => {
        const qty = quantidade === '' ? 0 : (parseInt(quantidade) || 0);
        total += parseFloat(valor) * qty;
      });
      
      setFormData(prev => ({
        ...prev,
        valorFechamento: formatCurrency(total)
      }));
    }
  }, [formData.cedulas, showContagem]);

  // Calcular diferença quando valor de fechamento ou saldo total mudam
  useEffect(() => {
    const valorFechamento = parseCurrency(formData.valorFechamento);
    const diferencaCalculada = valorFechamento - saldoTotal;
    setDiferenca(diferencaCalculada);
    setFormData(prev => ({
      ...prev,
      diferenca: formatCurrency(diferencaCalculada)
    }));
  }, [formData.valorFechamento, saldoTotal]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
    const valorFechamento = parseCurrency(formData.valorFechamento);
    if (!formData.valorFechamento || valorFechamento <= 0) {
      alert('Valor de fechamento é obrigatório e deve ser maior que zero!');
      return;
    }
    try {
      const estabelecimentoId = Number(localStorage.getItem('estabelecimentoId')) || null;
      
      if (!estabelecimentoId) {
        alert('Estabelecimento não definido. Faça login novamente.');
        return;
      }
      
      // Verificar se o token existe
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Sessão expirada. Faça login novamente.');
        return;
      }
      
      const res = await api.post('/caixas/fechar', {
        estabelecimento_id: estabelecimentoId,
        valor_fechamento: valorFechamento
      });
      
      if (res.success) {
        if (onSave) onSave(res.data);
        window.dispatchEvent(new CustomEvent('modalSaveSuccess', { detail: res.data }));
      } else {
        alert(res.message || 'Erro ao fechar caixa');
      }
    } catch (err) {
      console.error('Erro ao fechar caixa:', err);
      alert('Erro ao fechar caixa');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col modal-form bg-white">
      {/* Conteúdo do formulário */}
      <div className="flex-1 p-2 sm:p-4 max-h-96 overflow-y-auto scrollbar-hide space-y-4 sm:space-y-6">
        {/* Valor de Fechamento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Valor de Fechamento <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.valorFechamento}
            onChange={(e) => {
              const rawValue = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
              const numericValue = rawValue ? (Number(rawValue) / 100).toFixed(2) : '';
              const formattedValue = numericValue ? formatCurrency(numericValue) : '';
              handleInputChange('valorFechamento', formattedValue);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="R$ 0,00"
          />
        </div>

        {/* Saldo Total e Diferença lado a lado */}
        <div className="grid grid-cols-2 gap-4">
          {/* Saldo Total */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Saldo Total
            </label>
            <input
              type="text"
              value={formData.saldoTotal ? `R$ ${formData.saldoTotal}` : 'R$ 0,00'}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
            />
          </div>

          {/* Diferença */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diferença
            </label>
            <input
              type="text"
              value={formData.diferenca ? `R$ ${formData.diferenca}` : 'R$ 0,00'}
              disabled
              className={`w-full px-3 py-2 border rounded-lg ${
                parseCurrency(formData.diferenca) >= 0 
                  ? 'border-green-300 bg-green-50 text-green-700' 
                  : 'border-red-300 bg-red-50 text-red-700'
              }`}
            />
          </div>
        </div>

        {/* Botão Contagem em Cédulas */}
        {!showContagem && (
          <div>
            <button
              type="button"
              onClick={() => setShowContagem(true)}
              className="w-full px-3 py-2 border-2 border-blue-500 text-blue-500 bg-white rounded-lg hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 font-medium"
            >
              + Contagem de Cédulas
            </button>
          </div>
        )}

        {/* Cédulas - só aparecem quando showContagem é true */}
        {showContagem && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Cédulas
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(formData.cedulas).map(([valor, quantidade]) => (
                <div key={valor} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 text-center">
                    R$ {valor}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={quantidade === '' ? '' : quantidade}
                    onChange={(e) => handleCedulaChange(valor, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </form>
  );
};

export default FormFecharCaixa;