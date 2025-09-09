import React, { useState } from 'react';
import { CreditCard } from 'lucide-react';


const FormPayment = ({ onSave }) => {
  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    taxa: '',
    contaBancaria: ''
  });

  const tiposPagamento = ['Dinheiro', 'Crédito', 'Débito', 'PIX'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome.trim() || !formData.tipo) {
      alert('Nome e tipo são obrigatórios!');
      return;
    }
    try {
      if (onSave) {
        await Promise.resolve(onSave(formData));
      }
      // Notificar o modal para fechar
      window.dispatchEvent(new CustomEvent('modalSaveSuccess', { detail: formData }));
    } catch (err) {
      console.error('Erro ao salvar pagamento:', err);
      alert('Erro ao salvar pagamento.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col">
      {/* Conteúdo do formulário */}
      <div className="flex-1 space-y-6">
        {/* Grid de 2 colunas */}
        <div className="grid grid-cols-2 gap-4">
          {/* Nome - Obrigatório */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nome da forma de pagamento"
            />
          </div>

          {/* Tipo - Obrigatório */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={formData.tipo}
              onChange={(e) => handleInputChange('tipo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecione o tipo</option>
              {tiposPagamento.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          </div>

          {/* Taxa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Taxa
            </label>
            <input
              type="text"
              value={formData.taxa}
              onChange={(e) => handleInputChange('taxa', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="R$ 0,00 ou %"
            />
          </div>

          {/* Conta Bancária */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conta Bancária
            </label>
            <input
              type="text"
              value={formData.contaBancaria}
              onChange={(e) => handleInputChange('contaBancaria', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Dados da conta bancária"
            />
          </div>
        </div>
      </div>


    </form>
  );
};

export default FormPayment;
