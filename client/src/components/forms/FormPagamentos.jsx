import React, { useState } from 'react';
import { CreditCard } from 'lucide-react';
import CancelButton from '../buttons/CancelButton';
import SaveButton from '../buttons/SaveButton';

const FormPagamentos = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    taxa: '',
    contaBancaria: ''
  });

  const tiposPagamento = [
    'Dinheiro',
    'Crédito',
    'Débito',
    'PIX'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.nome.trim() && formData.tipo) {
      onSubmit(formData);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header fixo - sempre visível */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-pink-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Cadastrar Forma de Pagamento</h2>
        </div>
      </div>

      {/* Formulário com scroll - ocupa o espaço restante */}
      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome */}
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
            Nome
          </label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="Nome da forma de pagamento"
          />
        </div>

        {/* Tipo - Obrigatório */}
        <div>
          <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo *
          </label>
          <select
            id="tipo"
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="">Selecione o tipo</option>
            {tiposPagamento.map((tipo) => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>

        {/* Taxa */}
        <div>
          <label htmlFor="taxa" className="block text-sm font-medium text-gray-700 mb-1">
            Taxa
          </label>
          <input
            type="number"
            id="taxa"
            name="taxa"
            value={formData.taxa}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>

        {/* Conta Bancária */}
        <div>
          <label htmlFor="contaBancaria" className="block text-sm font-medium text-gray-700 mb-1">
            Conta Bancária
          </label>
          <input
            type="text"
            id="contaBancaria"
            name="contaBancaria"
            value={formData.contaBancaria}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="Informações da conta bancária"
          />
        </div>

        {/* Espaçamento para os botões fixos */}
        <div className="h-20"></div>
      </form>
    </div>

    {/* Botões fixos na parte inferior */}
    <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4">
      <div className="flex space-x-3">
        <CancelButton
          onClick={onClose}
          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
        />
        <SaveButton
          onClick={handleSubmit}
          text="Salvar"
          className="flex-1"
        />
      </div>
    </div>
  </div>
);
};

export default FormPagamentos;
