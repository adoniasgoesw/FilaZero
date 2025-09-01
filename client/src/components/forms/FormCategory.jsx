import React, { useState } from 'react';
import { Tag, Image as ImageIcon, Upload, X } from 'lucide-react';
import CancelButton from '../buttons/Cancel';
import SaveButton from '../buttons/Save';
import api from '../../services/api';

const FormCategory = ({ onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    nome: '',
    imagem: null
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione apenas arquivos de imagem.');
        return;
      }

      // Validar tamanho (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('A imagem deve ter no máximo 5MB.');
        return;
      }

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
      
      // Limpar erro se existir
      setError('');
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      imagem: null
    }));
    setImagePreview(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validações
    if (!formData.nome.trim()) {
      setError('Nome é obrigatório!');
      return;
    }

    if (!formData.imagem) {
      setError('Imagem é obrigatória!');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Obter ID do estabelecimento do localStorage
      const estabelecimentoId = localStorage.getItem('estabelecimentoId');
      
      if (!estabelecimentoId) {
        throw new Error('Estabelecimento não identificado!');
      }

      // Criar FormData para envio de arquivo
      const formDataToSend = new FormData();
      formDataToSend.append('nome', formData.nome.trim());
      formDataToSend.append('estabelecimento_id', estabelecimentoId);
      formDataToSend.append('imagem', formData.imagem);

      // Enviar para a API
      const response = await api.post('/categorias', formDataToSend);

      if (response.success) {
        // Limpar formulário
        setFormData({ nome: '', imagem: null });
        setImagePreview(null);
        
        // Chamar callback de sucesso (que deve fechar o modal)
        onSave(response.data);
      }
    } catch (error) {
      setError('Erro ao cadastrar categoria: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col">
      {/* Conteúdo do formulário */}
      <div className="flex-1 space-y-6">
        {/* Grid de 2 colunas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome - Obrigatório */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Nome da categoria"
              disabled={isLoading}
            />
          </div>

          {/* Imagem - Obrigatório */}
          <div className="flex flex-col items-center">
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                disabled={isLoading}
              />
              
              <label
                htmlFor="imageInput"
                className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group overflow-hidden bg-gray-50"
              >
                {imagePreview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={imagePreview}
                      alt="Preview da categoria"
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
              
              {/* Botão para remover imagem */}
              {imagePreview && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors duration-200"
                  disabled={isLoading}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              
              {/* Texto de ajuda abaixo da imagem */}
              <p className="text-xs text-gray-500 mt-2 text-center max-w-32">
                Clique para alterar a imagem
              </p>
            </div>
          </div>
        </div>
        
        {/* Mensagem de erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        <p className="text-xs text-gray-500">
          Selecione uma imagem para representar a categoria
        </p>
      </div>

      {/* Footer com botões */}
      <div className="border-t border-gray-200 pt-4 mt-6">
        <div className="grid grid-cols-2 gap-4">
          <CancelButton onClick={onCancel} disabled={isLoading} />
          <SaveButton onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar'}
          </SaveButton>
        </div>
      </div>
    </form>
  );
};

export default FormCategory;
