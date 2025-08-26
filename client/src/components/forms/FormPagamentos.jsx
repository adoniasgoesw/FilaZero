import React, { useState } from 'react';
import { CreditCard } from 'lucide-react';
import AddButton from '../buttons/AddButton';
import CancelButton from '../buttons/CancelButton';

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
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-pink-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Cadastrar Forma de Pagamento</h2>
      </div>
      
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

        {/* Botões */}
        <div className="flex space-x-3 pt-4">
          <CancelButton
            onClick={onClose}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
          />
          <AddButton
            type="submit"
            text="Cadastrar Pagamento"
            className="flex-1 bg-gradient-to-r from-pink-300 to-pink-400 hover:from-pink-400 hover:to-pink-500 text-white"
          />
        </div>
      </form>
    </div>
  );
};

export default FormPagamentos;
