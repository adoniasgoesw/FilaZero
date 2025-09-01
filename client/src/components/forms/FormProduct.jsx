import React, { useState } from 'react';
import { Package, Image as ImageIcon, Upload } from 'lucide-react';
import CancelButton from '../buttons/Cancel';
import SaveButton from '../buttons/Save';

const FormProduct = ({ onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    nome: '',
    imagem: '',
    categoria: '',
    valorVenda: '',
    valorCusto: '',
    codigoPdv: '',
    estoqueEnabled: false,
    estoque: '',
    tempoPreparoEnabled: false,
    tempoPreparo: ''
  });

  const [imagePreview, setImagePreview] = useState(null);

  const categorias = ['Bebidas', 'Lanches', 'Pizzas', 'Sobremesas', 'Outros'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        imagem: file
      }));
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCheckboxChange = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome.trim() || !formData.categoria || !formData.valorVenda) {
      alert('Nome, categoria e valor de venda são obrigatórios!');
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col">
      {/* Conteúdo do formulário */}
      <div className="flex-1 space-y-6">
        {/* Nome e Categoria (esquerda) + Imagem (direita) */}
        <div className="grid grid-cols-2 gap-6">
          {/* Coluna esquerda: Nome e Categoria */}
          <div className="space-y-4">
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
                placeholder="Nome do produto"
              />
            </div>

            {/* Categoria - Obrigatório */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.categoria}
                onChange={(e) => handleInputChange('categoria', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Coluna direita: Imagem */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagem <span className="text-red-500">*</span>
            </label>
            
            {/* Input de imagem personalizado */}
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="imageInput"
              />
              
              <label
                htmlFor="imageInput"
                className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group overflow-hidden"
              >
                {imagePreview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={imagePreview}
                      alt="Preview do produto"
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay com ícone de upload no hover */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-gray-500 group-hover:text-blue-500 transition-colors duration-200 p-2 text-center">
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <span className="text-xs font-medium">Selecionar imagem</span>
                    <span className="text-xs text-gray-400">PNG, JPG</span>
                  </div>
                )}
              </label>
              
              {/* Texto de ajuda abaixo da imagem */}
              <p className="text-xs text-gray-500 mt-2 text-center">
                Clique para alterar a imagem
              </p>
            </div>
          </div>
        </div>

        {/* Grid de 2 colunas para os outros campos */}
        <div className="grid grid-cols-2 gap-4">
          {/* Valor de Venda - Obrigatório */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor de Venda <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.valorVenda}
              onChange={(e) => handleInputChange('valorVenda', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="R$ 0,00"
            />
          </div>

          {/* Valor de Custo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor de Custo
            </label>
            <input
              type="text"
              value={formData.valorCusto}
              onChange={(e) => handleInputChange('valorCusto', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="R$ 0,00"
            />
          </div>

          {/* Código PDV */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código PDV
            </label>
            <input
              type="text"
              value={formData.codigoPdv}
              onChange={(e) => handleInputChange('codigoPdv', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Código do produto"
            />
          </div>
        </div>

        {/* Estoque - Opcional (largura total) */}
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="estoqueEnabled"
              checked={formData.estoqueEnabled}
              onChange={() => handleCheckboxChange('estoqueEnabled')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="estoqueEnabled" className="ml-2 text-sm font-medium text-gray-700">
              Habilitar Controle de Estoque
            </label>
          </div>
          
          {formData.estoqueEnabled && (
            <div className="ml-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade em Estoque
              </label>
              <input
                type="number"
                min="0"
                value={formData.estoque}
                onChange={(e) => handleInputChange('estoque', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0"
              />
            </div>
          )}
        </div>

        {/* Tempo de Preparo - Opcional (largura total) */}
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="tempoPreparoEnabled"
              checked={formData.tempoPreparoEnabled}
              onChange={() => handleCheckboxChange('tempoPreparoEnabled')}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="tempoPreparoEnabled" className="ml-2 text-sm font-medium text-gray-700">
              Habilitar Tempo de Preparo
            </label>
          </div>
          
          {formData.tempoPreparoEnabled && (
            <div className="ml-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tempo de Preparo (em minutos)
              </label>
              <input
                type="number"
                min="1"
                value={formData.tempoPreparo}
                onChange={(e) => handleInputChange('tempoPreparo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="30"
              />
            </div>
          )}
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

export default FormProduct;
