import React, { useState } from 'react';
import { Users } from 'lucide-react';
import AddButton from '../buttons/AddButton';
import CancelButton from '../buttons/CancelButton';

const FormClientes = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    nome: '',
    cpfCnpj: '',
    endereco: '',
    whatsapp: '',
    email: '',
    taxaEntrega: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.nome.trim()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
          <Users className="w-5 h-5 text-teal-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Cadastrar Cliente</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome - Obrigatório */}
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
            Nome *
          </label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Nome completo do cliente"
          />
        </div>

        {/* CPF/CNPJ */}
        <div>
          <label htmlFor="cpfCnpj" className="block text-sm font-medium text-gray-700 mb-1">
            CPF ou CNPJ
          </label>
          <input
            type="text"
            id="cpfCnpj"
            name="cpfCnpj"
            value={formData.cpfCnpj}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="000.000.000-00 ou 00.000.000/0000-00"
          />
        </div>

        {/* Endereço */}
        <div>
          <label htmlFor="endereco" className="block text-sm font-medium text-gray-700 mb-1">
            Endereço
          </label>
          <input
            type="text"
            id="endereco"
            name="endereco"
            value={formData.endereco}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Endereço completo"
          />
        </div>

        {/* WhatsApp */}
        <div>
          <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
            WhatsApp
          </label>
          <input
            type="text"
            id="whatsapp"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="(00) 00000-0000"
          />
        </div>

        {/* E-mail */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            E-mail
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="cliente@email.com"
          />
        </div>

        {/* Taxa de Entrega */}
        <div>
          <label htmlFor="taxaEntrega" className="block text-sm font-medium text-gray-700 mb-1">
            Taxa de Entrega
          </label>
          <input
            type="number"
            id="taxaEntrega"
            name="taxaEntrega"
            value={formData.taxaEntrega}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>

        {/* Botões */}
        <div className="flex space-x-3 pt-4">
          <CancelButton
            onClick={onClose}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
          />
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-teal-300 to-teal-400 hover:from-teal-400 hover:to-teal-500 text-white h-12 px-4 rounded-xl font-medium transition-all duration-200"
          >
            Cadastrar
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormClientes;
