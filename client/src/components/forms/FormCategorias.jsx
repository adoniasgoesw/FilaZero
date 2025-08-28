import React, { useState } from 'react';
import { Tag } from 'lucide-react';
import CancelButton from '../buttons/CancelButton';
import SaveButton from '../buttons/SaveButton';
import Notification from '../elements/Notification.jsx';
import api from '../../services/api.js';

  // Função helper para construir URL da imagem
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // Se já é uma URL completa, retornar como está
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Detectar ambiente automaticamente
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    
    if (isProduction) {
      // Produção: usar Render
      return `https://filazero-sistema-de-gestao.onrender.com${imagePath}`;
    } else {
      // Desenvolvimento: usar localhost
      return `http://localhost:3001${imagePath}`;
    }
  };

const FormCategorias = ({ onClose, onSubmit, categoriaParaEditar = null }) => {
  const [formData, setFormData] = useState({
    nome: categoriaParaEditar?.nome || '',
    imagem: null
  });
  
  const [imagemPreview, setImagemPreview] = useState(
    categoriaParaEditar?.imagem_url ? getImageUrl(categoriaParaEditar.imagem_url) : null
  );
  
  // Estado para notificação
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null,
    showConfirm: false
  });
  
  const isEditando = !!categoriaParaEditar;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Função para mostrar notificação
  const showNotification = (type, title, message, onConfirm = null, showConfirm = false) => {
    setNotification({
      isOpen: true,
      type,
      title,
      message,
      onConfirm,
      showConfirm
    });
  };

  // Função para fechar notificação
  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isOpen: false }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      showNotification('warning', 'Campo Obrigatório', 'Nome é obrigatório!');
      return;
    }

    try {
      // Pegar o estabelecimento ID do localStorage
      const estabelecimento = JSON.parse(localStorage.getItem('filaZero_establishment'));
      console.log('🏪 Estabelecimento encontrado:', estabelecimento);
      
      if (!estabelecimento || !estabelecimento.id) {
        showNotification('error', 'Erro', 'Erro: Estabelecimento não encontrado!');
        return;
      }

      // Criar FormData para enviar arquivo
      const formDataToSend = new FormData();
      formDataToSend.append('estabelecimento_id', estabelecimento.id);
      formDataToSend.append('nome', formData.nome);
      
      if (formData.imagem) {
        formDataToSend.append('imagem', formData.imagem);
      }
      
      // Se estiver editando, incluir o ID da categoria
      if (isEditando) {
        formDataToSend.append('id', categoriaParaEditar.id);
      }

      // Log do que está sendo enviado
      console.log('📤 Dados sendo enviados:');
      console.log('🏪 Estabelecimento ID:', estabelecimento.id);
      console.log('📝 Nome:', formData.nome);
      console.log('🖼️ Imagem:', formData.imagem ? 'Sim' : 'Não');
      
      // Log do FormData
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`📦 ${key}:`, value);
      }

      let response;
      
      if (isEditando) {
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
        const mensagem = isEditando ? 'Categoria atualizada com sucesso!' : 'Categoria criada com sucesso!';
        showNotification('success', 'Sucesso', mensagem);
        onSubmit(response.data.data);
        onClose();
      } else {
        showNotification('error', 'Erro', 'Erro ao ' + (isEditando ? 'atualizar' : 'criar') + ' categoria: ' + response.data.message);
      }
    } catch (error) {
      console.error('Erro ao ' + (isEditando ? 'atualizar' : 'criar') + ' categoria:', error);
      if (error.response?.data?.message) {
        showNotification('error', 'Erro', 'Erro: ' + error.response.data.message);
      } else {
        showNotification('error', 'Erro', 'Erro ao ' + (isEditando ? 'atualizar' : 'criar') + ' categoria. Tente novamente.');
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header fixo - sempre visível */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
            <Tag className="w-5 h-5 text-cyan-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">
            {isEditando ? 'Alterar Categoria' : 'Cadastrar Categoria'}
          </h2>
        </div>
      </div>

      {/* Formulário com scroll - ocupa o espaço restante */}
      <div className="flex-1 overflow-y-auto p-6">
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
                    <img
                      src={URL.createObjectURL(formData.imagem)}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ) : imagemPreview ? (
                  <div className="w-full h-full relative">
                    <img
                      src={imagemPreview}
                      alt="Imagem atual"
                      className="w-full h-full object-cover rounded-lg"
                    />
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

      {/* Sistema de Notificação */}
      <Notification
        isOpen={notification.isOpen}
        onClose={closeNotification}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onConfirm={notification.onConfirm}
        showConfirm={notification.showConfirm}
        confirmText="OK"
        cancelText="Fechar"
      />
    </div>
  );
};

export default FormCategorias;
