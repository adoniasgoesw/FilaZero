import React, { useState } from 'react';
import api from '../../services/api';

const FormComplementos = ({ complemento = null, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nome: '',
    valorVenda: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Detectar se é modo de edição
  const isEditMode = !!complemento;

  // Preencher formulário com dados do complemento (modo edição)
  React.useEffect(() => {
    if (complemento) {
      setFormData({
        nome: complemento.nome || '',
        valorVenda: complemento.valor_venda || ''
      });
    }
  }, [complemento]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validações
    if (!formData.nome.trim()) {
      setError('Nome é obrigatório!');
      return;
    }
    
    if (!formData.valorVenda) {
      setError('Valor de venda é obrigatório!');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Criar dados para envio
      const dataToSend = {
        nome: formData.nome.trim(),
        valor_venda: formData.valorVenda
      };

      if (isEditMode) {
        // Modo de edição
        const response = await api.put(`/complementos/${complemento.id}`, dataToSend);
        
        if (response.success) {
          console.log('✅ Complemento editado com sucesso');
          if (onSave) onSave(response.data);
          if (onClose) onClose();
        }
      } else {
        // Modo de criação
        const estabelecimentoId = localStorage.getItem('estabelecimentoId');
        if (!estabelecimentoId) {
          throw new Error('Estabelecimento não identificado!');
        }
        
        const response = await api.post('/complementos', {
          ...dataToSend,
          estabelecimento_id: estabelecimentoId
        });
        
        if (response.success) {
          console.log('✅ Complemento criado com sucesso');
          if (onSave) onSave(response.data);
          if (onClose) onClose();
        }
      }
    } catch (error) {
      const errorMessage = isEditMode ? 'Erro ao atualizar complemento: ' : 'Erro ao cadastrar complemento: ';
      setError(errorMessage + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col modal-form">
      {/* Conteúdo do formulário */}
      <div className="flex-1 space-y-6">
        {/* Nome - Obrigatório */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome do Complemento <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.nome}
            onChange={(e) => handleInputChange('nome', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: Refrigerante, Batata Frita"
          />
        </div>

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
        
        {/* Mensagem de erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-xs font-bold">!</span>
                </div>
              </div>
              <p className="text-sm text-red-700 leading-relaxed">{error}</p>
            </div>
          </div>
        )}
      </div>
    </form>
  );
};

export default FormComplementos;
