import React, { useState } from 'react';
import { UserCheck } from 'lucide-react';
import AddButton from '../buttons/AddButton';
import CancelButton from '../buttons/CancelButton';

const FormUsuarios = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    senha: '',
    cargo: ''
  });

  const cargos = [
    'Administrador',
    'Gerente', 
    'Caixa',
    'Atendente',
    'Cozinha',
    'Entregador'
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
    if (formData.nome.trim() && formData.cpf.trim() && formData.senha.trim() && formData.cargo) {
      onSubmit(formData);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
          <UserCheck className="w-5 h-5 text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Cadastrar Usuário</h2>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Nome completo do usuário"
          />
        </div>

        {/* CPF - Obrigatório */}
        <div>
          <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">
            CPF *
          </label>
          <input
            type="text"
            id="cpf"
            name="cpf"
            value={formData.cpf}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="000.000.000-00"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="usuario@email.com"
          />
        </div>

        {/* Senha - Obrigatório */}
        <div>
          <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
            Senha *
          </label>
          <input
            type="password"
            id="senha"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Senha do usuário"
          />
        </div>

        {/* Cargo - Obrigatório */}
        <div>
          <label htmlFor="cargo" className="block text-sm font-medium text-gray-700 mb-1">
            Cargo *
          </label>
          <select
            id="cargo"
            name="cargo"
            value={formData.cargo}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Selecione um cargo</option>
            {cargos.map((cargo) => (
              <option key={cargo} value={cargo}>{cargo}</option>
            ))}
          </select>
        </div>

        {/* Botões */}
        <div className="flex space-x-3 pt-4">
          <CancelButton
            onClick={onClose}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
          />
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-indigo-300 to-indigo-400 hover:from-indigo-400 hover:to-indigo-500 text-white h-12 px-4 rounded-xl font-medium transition-all duration-200"
          >
            Cadastrar
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormUsuarios;
