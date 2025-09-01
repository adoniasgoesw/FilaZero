import React, { useState } from 'react';
import { Users } from 'lucide-react';
import CancelButton from '../buttons/Cancel';
import SaveButton from '../buttons/Save';

const FormClient = ({ onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    nome: '',
    cpfCnpj: '',
    endereco: '',
    whatsapp: '',
    email: '',
    taxaEntrega: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      alert('Nome é obrigatório!');
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col">
      {/* Conteúdo do formulário */}
      <div className="flex-1 space-y-6">
        {/* Nome - Obrigatório (largura total) */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.nome}
            onChange={(e) => handleInputChange('nome', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Nome completo"
          />
        </div>

        {/* Grid de 2 colunas para os outros campos */}
        <div className="grid grid-cols-2 gap-4">
          {/* CPF/CNPJ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CPF ou CNPJ
            </label>
            <input
              type="text"
              value={formData.cpfCnpj}
              onChange={(e) => handleInputChange('cpfCnpj', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
            />
          </div>

          {/* Endereço */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Endereço
            </label>
            <input
              type="text"
              value={formData.endereco}
              onChange={(e) => handleInputChange('endereco', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Endereço completo"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp
            </label>
            <input
              type="text"
              value={formData.whatsapp}
              onChange={(e) => handleInputChange('whatsapp', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="(00) 00000-0000"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="email@exemplo.com"
            />
          </div>

          {/* Taxa de Entrega */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Taxa de Entrega
            </label>
            <input
              type="text"
              value={formData.taxaEntrega}
              onChange={(e) => handleInputChange('taxaEntrega', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="R$ 0,00"
            />
          </div>
        </div>
      </div>

      {/* Footer com botões */}
      <div className="border-t border-gray-200 pt-4 mt-6">
        <div className="grid grid-cols-2 gap-4">
          <CancelButton onClick={onCancel} />
          <SaveButton onClick={() => {}} type="submit" />
        </div>
      </div>
    </form>
  );
};

export default FormClient;
