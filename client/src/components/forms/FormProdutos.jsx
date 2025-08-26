import React, { useState } from 'react';
import { Package } from 'lucide-react';
import AddButton from '../buttons/AddButton';
import CancelButton from '../buttons/CancelButton';

const FormProdutos = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    nome: '',
    imagem: '',
    categoria: '',
    valorVenda: '',
    valorCusto: '',
    habilitarEstoque: false,
    quantidadeEstoque: '',
    habilitarTempoPreparo: false,
    tempoPreparo: ''
  });

  const categorias = [
    'Categoria 1',
    'Categoria 2',
    'Categoria 3'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.nome.trim() && formData.categoria && formData.valorVenda) {
      onSubmit(formData);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
          <Package className="w-5 h-5 text-purple-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Cadastrar Produto</h2>
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="Nome do produto"
          />
        </div>

        {/* Imagem */}
        <div>
          <label htmlFor="imagem" className="block text-sm font-medium text-gray-700 mb-1">
            Imagem
          </label>
          <div className="relative">
            <input
              type="file"
              id="imagem"
              name="imagem"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setFormData(prev => ({
                    ...prev,
                    imagem: file
                  }));
                }
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 overflow-hidden">
              {formData.imagem ? (
                <div className="w-full h-full relative">
                  {formData.imagem.type && formData.imagem.type.startsWith('image/') ? (
                    <img
                      src={URL.createObjectURL(formData.imagem)}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-xs text-purple-600 font-medium">Arquivo Selecionado</p>
                      <p className="text-xs text-gray-500 mt-1 truncate w-24">{formData.imagem.name}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-500">Clique para selecionar</p>
                  <p className="text-xs text-gray-400">ou arraste aqui</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Categoria - Obrigatório */}
        <div>
          <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
            Categoria *
          </label>
          <select
            id="categoria"
            name="categoria"
            value={formData.categoria}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">Selecione uma categoria</option>
            {categorias.map((categoria) => (
              <option key={categoria} value={categoria}>{categoria}</option>
            ))}
          </select>
        </div>

        {/* Valor de Venda - Obrigatório */}
        <div>
          <label htmlFor="valorVenda" className="block text-sm font-medium text-gray-700 mb-1">
            Valor de Venda *
          </label>
          <input
            type="number"
            id="valorVenda"
            name="valorVenda"
            value={formData.valorVenda}
            onChange={handleChange}
            required
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>

        {/* Valor de Custo */}
        <div>
          <label htmlFor="valorCusto" className="block text-sm font-medium text-gray-700 mb-1">
            Valor de Custo
          </label>
          <input
            type="number"
            id="valorCusto"
            name="valorCusto"
            value={formData.valorCusto}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="0.00"
          />
        </div>

        {/* Habilitar Estoque */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="habilitarEstoque"
            name="habilitarEstoque"
            checked={formData.habilitarEstoque}
            onChange={handleChange}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <label htmlFor="habilitarEstoque" className="text-sm font-medium text-gray-700">
            Habilitar Controle de Estoque
          </label>
        </div>

        {/* Quantidade de Estoque */}
        {formData.habilitarEstoque && (
          <div>
            <label htmlFor="quantidadeEstoque" className="block text-sm font-medium text-gray-700 mb-1">
              Quantidade em Estoque
            </label>
            <input
              type="number"
              id="quantidadeEstoque"
              name="quantidadeEstoque"
              value={formData.quantidadeEstoque}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
        )}

        {/* Habilitar Tempo de Preparo */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="habilitarTempoPreparo"
            name="habilitarTempoPreparo"
            checked={formData.habilitarTempoPreparo}
            onChange={handleChange}
            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <label htmlFor="habilitarTempoPreparo" className="text-sm font-medium text-gray-700">
            Habilitar Tempo de Preparo
          </label>
        </div>

        {/* Tempo de Preparo */}
        {formData.habilitarTempoPreparo && (
          <div>
            <label htmlFor="tempoPreparo" className="block text-sm font-medium text-gray-700 mb-1">
              Tempo de Preparo (minutos)
            </label>
            <input
              type="number"
              id="tempoPreparo"
              name="tempoPreparo"
              value={formData.tempoPreparo}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
        )}

        {/* Botões */}
        <div className="flex space-x-3 pt-4">
          <CancelButton
            onClick={onClose}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
          />
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-purple-300 to-purple-400 hover:from-purple-400 hover:to-purple-500 text-white h-12 px-4 rounded-xl font-medium transition-all duration-200"
          >
            Cadastrar
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormProdutos;
