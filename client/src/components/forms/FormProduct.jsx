import React, { useState, useEffect } from 'react';
import { Package, Image as ImageIcon, Upload } from 'lucide-react';
import api from '../../services/api';


const FormProduct = ({ produto = null }) => {
  const [formData, setFormData] = useState({
    nome: '',
    imagem: null,
    categoria: '',
    valorVenda: '',
    valorCusto: '',
    codigoPdv: '',
    estoqueEnabled: false,
    estoque: '',
    tempoPreparoEnabled: false,
    tempoPreparo: ''
  });

  // Detectar se é modo de edição
  const isEditMode = !!produto;

  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [loadingCategorias, setLoadingCategorias] = useState(false);

  // Buscar categorias do estabelecimento
  useEffect(() => {
    const fetchCategorias = async () => {
      const estabelecimentoId = localStorage.getItem('estabelecimentoId');
      if (!estabelecimentoId) return;

      setLoadingCategorias(true);
      try {
        const response = await api.get(`/categorias-dropdown/${estabelecimentoId}`);
        if (response.success) {
          setCategorias(response.data);
        }
      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        setError('Erro ao carregar categorias');
      } finally {
        setLoadingCategorias(false);
      }
    };

    fetchCategorias();
  }, []);

  // Preencher formulário com dados do produto (modo edição) - DEPOIS de carregar as categorias
  useEffect(() => {
    if (produto && categorias.length > 0) {
      setFormData({
        nome: produto.nome || '',
        imagem: null, // Nova imagem (se selecionada)
        categoria: produto.categoria_id ? produto.categoria_id.toString() : '',
        valorVenda: produto.valor_venda || '',
        valorCusto: produto.valor_custo || '',
        codigoPdv: produto.codigo_pdv || '',
        estoqueEnabled: produto.habilita_estoque || false,
        estoque: produto.estoque_qtd || '',
        tempoPreparoEnabled: produto.habilita_tempo_preparo || false,
        tempoPreparo: produto.tempo_preparo_min || ''
      });
      
      // Se o produto tem imagem, mostrar preview
      if (produto.imagem_url) {
        setImagePreview(produto.imagem_url);
      }
    }
  }, [produto, categorias]);

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

  const handleCheckboxChange = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getImageUrl = (imagemUrl) => {
    if (!imagemUrl) return null;
    
    // Se a URL já é completa (começa com http), retorna como está
    if (imagemUrl.startsWith('http')) {
      return imagemUrl;
    }
    
    // Fallback para URLs locais (desenvolvimento)
    const normalizedUrl = imagemUrl.replace(/\\/g, '/');
    
    // Determinar a base URL baseada no ambiente
    let baseUrl;
    if (import.meta.env.VITE_API_URL) {
      baseUrl = import.meta.env.VITE_API_URL.replace(/\/api$/, '');
    } else {
      baseUrl = 'http://localhost:3001';
    }
    
    // Garantir que não há dupla barra
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const cleanImageUrl = normalizedUrl.replace(/^\//, '');
    
    return `${cleanBaseUrl}/${cleanImageUrl}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validações
    if (!formData.nome.trim()) {
      setError('Nome é obrigatório!');
      return;
    }
    
    if (!formData.categoria) {
      setError('Categoria é obrigatória!');
      return;
    }
    
    if (!formData.valorVenda) {
      setError('Valor de venda é obrigatório!');
      return;
    }
    
    // Imagem é obrigatória apenas no modo de criação
    if (!isEditMode && !formData.imagem) {
      setError('Imagem é obrigatória!');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Criar FormData para envio
      const formDataToSend = new FormData();
      formDataToSend.append('nome', formData.nome.trim());
      formDataToSend.append('categoria_id', formData.categoria);
      formDataToSend.append('valor_venda', formData.valorVenda);
      formDataToSend.append('valor_custo', formData.valorCusto || '');

      formDataToSend.append('habilita_estoque', formData.estoqueEnabled);
      formDataToSend.append('estoque_qtd', formData.estoque || '0');
      formDataToSend.append('habilita_tempo_preparo', formData.tempoPreparoEnabled);
      formDataToSend.append('tempo_preparo_min', formData.tempoPreparo || '');
      
      if (isEditMode) {
        // Modo de edição
        if (formData.imagem) {
          formDataToSend.append('imagem', formData.imagem);
        }
        
        const response = await api.put(`/produtos/${produto.id}`, formDataToSend);
        
        if (response.success) {
          console.log('✅ Produto editado com sucesso');
          // Disparar evento para o BaseModal fechar
          window.dispatchEvent(new CustomEvent('modalSaveSuccess', { detail: response.data }));
        }
      } else {
        // Modo de criação
        formDataToSend.append('imagem', formData.imagem);
        
        const estabelecimentoId = localStorage.getItem('estabelecimentoId');
        if (!estabelecimentoId) {
          throw new Error('Estabelecimento não identificado!');
        }
        formDataToSend.append('estabelecimento_id', estabelecimentoId);

        const response = await api.post('/produtos', formDataToSend);
        
        if (response.success) {
          // Limpar formulário apenas no modo de criação
          setFormData({
            nome: '',
            imagem: null,
            categoria: '',
            valorVenda: '',
            valorCusto: '',
            codigoPdv: '',
            estoqueEnabled: false,
            estoque: '',
            tempoPreparoEnabled: false,
            tempoPreparo: ''
          });
          setImagePreview(null);
          
          console.log('✅ Produto criado com sucesso');
          // Disparar evento para o BaseModal fechar
          window.dispatchEvent(new CustomEvent('modalSaveSuccess', { detail: response.data }));
        }
      }
    } catch (error) {
      const errorMessage = isEditMode ? 'Erro ao atualizar produto: ' : 'Erro ao cadastrar produto: ';
      setError(errorMessage + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col modal-form">
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
                disabled={loadingCategorias}
              >
                <option value="">
                  {loadingCategorias ? 'Carregando categorias...' : 'Selecione uma categoria'}
                </option>
                {categorias.map(cat => (
                  <option key={cat.id} value={cat.id.toString()}>{cat.nome}</option>
                ))}
              </select>
              {categorias.length === 0 && !loadingCategorias && (
                <p className="text-xs text-orange-600 mt-1">
                  Nenhuma categoria encontrada. Cadastre uma categoria primeiro.
                </p>
              )}
            </div>
          </div>

          {/* Coluna direita: Imagem */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagem do Produto {!isEditMode && <span className="text-red-500">*</span>}
            </label>
            <div className="flex justify-center">
              <div className="relative">
                <input
                  type="file"
                  id="imagem"
                  name="imagem"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isLoading}
                />
                <div className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 overflow-hidden bg-gray-50">
                  {formData.imagem ? (
                    <div className="w-full h-full relative">
                      <img
                        src={URL.createObjectURL(formData.imagem)}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                  ) : imagePreview ? (
                    <div className="w-full h-full relative">
                      <img
                        src={getImageUrl(imagePreview)}
                        alt="Imagem atual"
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-gray-500 p-4 text-center">
                      <ImageIcon className="w-10 h-10 mb-3 text-gray-400" />
                      <span className="text-sm font-medium">Clique para selecionar</span>
                      <span className="text-xs text-gray-400 mt-1">ou arraste uma imagem aqui</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              {isEditMode && produto?.imagem_url ? 'Deixe em branco para manter a imagem atual' : 'Formatos aceitos: PNG, JPG, JPEG (máx. 5MB)'}
            </p>
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

export default FormProduct;
