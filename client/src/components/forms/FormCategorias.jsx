import React, { useState, useEffect } from 'react';
import { Tag } from 'lucide-react';
import CancelButton from '../buttons/CancelButton';
import api from '../../services/api';

const FormCategorias = ({ onClose, onSubmit, categoriaParaEditar = null, isEditing = false }) => {
  const [formData, setFormData] = useState({
    nome: '',
    imagem: null
  });

  // Preencher formulário quando for edição
  useEffect(() => {
    if (categoriaParaEditar && isEditing) {
      setFormData({
        nome: categoriaParaEditar.nome || '',
        imagem: null
      });
    }
  }, [categoriaParaEditar, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      alert('Nome é obrigatório!');
      return;
    }

    try {
      // Pegar o estabelecimento ID do localStorage
      const estabelecimento = JSON.parse(localStorage.getItem('filaZero_establishment'));
      if (!estabelecimento || !estabelecimento.id) {
        alert('Erro: Estabelecimento não encontrado!');
        return;
      }

      // Criar FormData para enviar arquivo
      const formDataToSend = new FormData();
      formDataToSend.append('estabelecimento_id', estabelecimento.id);
      formDataToSend.append('nome', formData.nome);
      
      if (formData.imagem) {
        formDataToSend.append('imagem', formData.imagem);
      }

      let response;
      
      if (isEditing && categoriaParaEditar) {
        // Atualizar categoria existente
        response = await api.put(`/categorias/${categoriaParaEditar.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // Criar nova categoria
        response = await api.post('/categorias', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      if (response.data.success) {
        const message = isEditing ? 'Categoria alterada com sucesso!' : 'Categoria criada com sucesso!';
        alert(message);
        onSubmit(response.data.data);
      } else {
        const errorMessage = isEditing ? 'Erro ao alterar categoria: ' : 'Erro ao criar categoria: ';
        alert(errorMessage + response.data.message);
      }
    } catch (error) {
      console.error('Erro ao processar categoria:', error);
      if (error.response?.data?.message) {
        alert('Erro: ' + error.response.data.message);
      } else {
        const errorMessage = isEditing ? 'Erro ao alterar categoria.' : 'Erro ao criar categoria.';
        alert(errorMessage + ' Tente novamente.');
      }
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
            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-cyan-400 hover:bg-cyan-50 transition-all duration-200 overflow-hidden">
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
                      <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-xs text-cyan-600 font-medium">Arquivo Selecionado</p>
                      <p className="text-xs text-gray-500 mt-1 truncate w-24">{formData.imagem.name}</p>
                    </div>
                  )}
                </div>
              ) : isEditing && categoriaParaEditar?.imagem_url ? (
                // Exibir imagem atual quando for edição
                <div className="w-full h-full relative">
                  <img
                    src={`http://localhost:3001${categoriaParaEditar.imagem_url}`}
                    alt="Imagem atual"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute top-1 right-1 bg-cyan-100 rounded-full p-1">
                    <svg className="w-3 h-3 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
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

        {/* Botões */}
        <div className="flex space-x-3 pt-4">
          <CancelButton
            onClick={onClose}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
          />
          <button
            type="submit"
            className="flex-1 bg-gradient-to-r from-cyan-300 to-cyan-400 hover:from-cyan-400 hover:to-cyan-500 text-white h-12 px-4 rounded-xl font-medium transition-all duration-200"
          >
            {isEditing ? 'Alterar' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormCategorias;
