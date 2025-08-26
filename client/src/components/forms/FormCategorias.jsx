import React, { useState, useEffect } from 'react';
import { Tag } from 'lucide-react';
import api from '../../services/api';

const FormCategorias = ({ onClose, onSubmit, categoriaParaEditar = null, isEditing = false }) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    cor: '#e5e7eb',
    icone: '',
    status: true
  });

  // Preencher formulário quando for edição
  useEffect(() => {
    if (isEditing && categoriaParaEditar) {
      setFormData({
        nome: categoriaParaEditar.nome || '',
        descricao: categoriaParaEditar.descricao || '',
        cor: categoriaParaEditar.cor || '#e5e7eb',
        icone: categoriaParaEditar.icone || '',
        status: categoriaParaEditar.status !== undefined ? categoriaParaEditar.status : true
      });
    }
  }, [isEditing, categoriaParaEditar]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      return;
    }

    try {
      // Pegar o estabelecimento ID do localStorage
      const estabelecimento = JSON.parse(localStorage.getItem('filaZero_establishment'));
      if (!estabelecimento || !estabelecimento.id) {
        return;
      }

      // Preparar dados para envio
      const dadosParaEnviar = {
        estabelecimento_id: estabelecimento.id,
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim() || null,
        cor: formData.cor,
        icone: formData.icone.trim() || null,
        status: formData.status
      };

      let response;
      
      if (isEditing && categoriaParaEditar) {
        // Atualizar categoria existente
        response = await api.put(`/categorias/${categoriaParaEditar.id}`, dadosParaEnviar);
      } else {
        // Criar nova categoria
        response = await api.post('/categorias', dadosParaEnviar);
      }

      if (response.data.success) {
        onSubmit(response.data.data);
      } else {
        onSubmit(null);
      }
    } catch (error) {
      console.error('Erro ao processar categoria:', error);
      onSubmit(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
          <Tag className="w-5 h-5 text-cyan-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">
          {isEditing ? 'Alterar Categoria' : 'Cadastrar Categoria'}
        </h2>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="Nome da categoria"
          />
        </div>

        {/* Descrição */}
        <div>
          <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            id="descricao"
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="Descrição da categoria (opcional)"
          />
        </div>

        {/* Cor */}
        <div>
          <label htmlFor="cor" className="block text-sm font-medium text-gray-700 mb-1">
            Cor
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              id="cor"
              name="cor"
              value={formData.cor}
              onChange={handleChange}
              className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={formData.cor}
              onChange={handleChange}
              name="cor"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="#e5e7eb"
            />
          </div>
        </div>

        {/* Ícone */}
        <div>
          <label htmlFor="icone" className="block text-sm font-medium text-gray-700 mb-1">
            Ícone
          </label>
          <input
            type="text"
            id="icone"
            name="icone"
            value={formData.icone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="Nome do ícone (opcional)"
          />
        </div>

        {/* Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="status"
            name="status"
            checked={formData.status}
            onChange={handleChange}
            className="w-4 h-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
          />
          <label htmlFor="status" className="ml-2 block text-sm text-gray-700">
            Categoria ativa
          </label>
        </div>

        {/* Botões */}
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors"
          >
            {isEditing ? 'Atualizar' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormCategorias;
