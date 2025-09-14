import React, { useState, useEffect } from 'react';
import { Calculator, Plus } from 'lucide-react';
import api from '../../services/api';
import AddButton from '../buttons/Add';

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

  // Carregar dados do caixa quando o componente monta
  useEffect(() => {
    if (caixaData) {
      const saldo = caixaData.saldo_total || 0;
      setSaldoTotal(saldo);
      setFormData(prev => ({
        ...prev,
        saldoTotal: saldo.toFixed(2)
      }));
    }
  }, [caixaData]);

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
        valorFechamento: total.toFixed(2)
      }));
    }
  }, [formData.cedulas, showContagem]);

  // Calcular diferença quando valor de fechamento ou saldo total mudam
  useEffect(() => {
    const valorFechamento = parseFloat(formData.valorFechamento) || 0;
    const diferencaCalculada = valorFechamento - saldoTotal;
    setDiferenca(diferencaCalculada);
    setFormData(prev => ({
      ...prev,
      diferenca: diferencaCalculada.toFixed(2)
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
    if (!formData.valorFechamento || parseFloat(formData.valorFechamento) <= 0) {
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
        valor_fechamento: parseFloat(formData.valorFechamento)
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
            type="number"
            step="0.01"
            min="0"
            required
            value={formData.valorFechamento}
            onChange={(e) => handleInputChange('valorFechamento', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="R$ 0,00"
          />
        </div>

        {/* Botão Contagem em Cédulas */}
        {!showContagem && (
          <div className="flex justify-center">
            <AddButton
              onClick={() => setShowContagem(true)}
              className="w-full max-w-xs"
              title="Contagem em Cédulas"
            >
              <Plus className="w-5 h-5 mr-2" />
              + contagem em cédulas
            </AddButton>
          </div>
        )}

        {/* Valores calculados */}
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
                parseFloat(formData.diferenca) >= 0 
                  ? 'border-green-300 bg-green-50 text-green-700' 
                  : 'border-red-300 bg-red-50 text-red-700'
              }`}
            />
          </div>
        </div>

        {/* Cédulas e Moedas - só aparecem quando showContagem é true */}
        {showContagem && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Contagem em Cédulas e Moedas
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(formData.cedulas).map(([valor, quantidade]) => (
                <div key={valor} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    R$ {valor}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={quantidade === '' ? '' : quantidade}
                    onChange={(e) => handleCedulaChange(valor, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500">
                    Total: R$ {(parseFloat(valor) * (quantidade === '' ? 0 : (parseInt(quantidade) || 0))).toFixed(2)}
                  </p>
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