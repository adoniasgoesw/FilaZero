  import React, { useState } from 'react';
  import { Image as ImageIcon, Upload, Zap, Loader2 } from 'lucide-react';
  
  import api, { buscarImagens } from '../../services/api';

  // Função debounce
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const FormCategory = ({ categoria = null }) => {
    const [formData, setFormData] = useState({
      nome: '',
      imagem: null
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Estados para sugestões de imagens
    const [sugestoesImagens, setSugestoesImagens] = useState([]);
    const [buscandoImagens, setBuscandoImagens] = useState(false);
    const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

      // Detectar se é modo de edição
  const isEditMode = !!categoria;



    // Preencher formulário com dados da categoria (modo edição)
    React.useEffect(() => {
      if (categoria) {
        setFormData({
          nome: categoria.nome || '',
          imagem: null // Nova imagem (se selecionada)
        });
        
        // Se a categoria tem imagem, mostrar preview
        if (categoria.imagem_url) {
          setImagePreview(categoria.imagem_url);
        }
      }
    }, [categoria]);

    const handleInputChange = (field, value) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
      
      // Se for o campo nome, buscar sugestões de imagens
      if (field === 'nome') {
        buscarSugestoesImagens(value);
      }
    };

    // Função para buscar sugestões de imagens com debounce
    const buscarSugestoesImagens = debounce(async (query) => {
      if (!query || query.trim().length < 2) {
        setSugestoesImagens([]);
        setMostrarSugestoes(false);
        return;
      }

      setBuscandoImagens(true);
      setMostrarSugestoes(true);

      try {
        const response = await buscarImagens(query);
        if (response.success) {
          setSugestoesImagens(response.imagens || []);
        } else {
          setSugestoesImagens([]);
        }
      } catch (error) {
        console.error('Erro ao buscar sugestões de imagens:', error);
        setSugestoesImagens([]);
      } finally {
        setBuscandoImagens(false);
      }
    }, 500);



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

    

    // Função para selecionar uma imagem sugerida
    const selecionarImagemSugerida = async (imagemUrl) => {
      try {
        // Fazer download da imagem e converter para File
        const response = await fetch(imagemUrl);
        const blob = await response.blob();
        
        // Criar um arquivo a partir do blob
        const file = new File([blob], 'imagem-sugerida.jpg', { type: blob.type });
        
        // Atualizar o estado do formulário
        setFormData(prev => ({
          ...prev,
          imagem: file
        }));
        
        // Atualizar o preview
        setImagePreview(imagemUrl);
        
        // Esconder as sugestões
        setMostrarSugestoes(false);
        setSugestoesImagens([]);
        
        // Limpar erro se existir
        setError('');
        
        console.log('✅ Imagem sugerida selecionada:', imagemUrl);
      } catch (error) {
        console.error('Erro ao selecionar imagem sugerida:', error);
        setError('Erro ao carregar a imagem selecionada');
      }
    };

    const getImageUrl = (imagemUrl) => {
      if (!imagemUrl) return null;
      
      // Se a URL já é completa (começa com http), retorna como está
      // Isso funciona tanto para URLs locais quanto para URLs do Cloudinary
      if (imagemUrl.startsWith('http')) {
        return imagemUrl;
      }
      
      // Fallback para URLs locais (desenvolvimento)
      // Normalizar separadores de caminho (Windows usa \, Unix usa /)
      const normalizedUrl = imagemUrl.replace(/\\/g, '/');
      
      // Determinar a base URL baseada no ambiente
      let baseUrl;
      if (import.meta.env.VITE_API_URL) {
        // Remove /api do final se existir, pois vamos adicionar apenas o caminho da imagem
        baseUrl = import.meta.env.VITE_API_URL.replace(/\/api$/, '');
      } else {
        // Fallback para desenvolvimento
        baseUrl = 'http://localhost:3001';
      }
      
      // Garantir que não há dupla barra
      const cleanBaseUrl = baseUrl.replace(/\/$/, '');
      const cleanImageUrl = normalizedUrl.replace(/^\//, '');
      
      return `${cleanBaseUrl}/${cleanImageUrl}`;
    };

    // Função específica para URLs de sugestões (Google Images)
    const getSuggestionImageUrl = (imagemUrl) => {
      if (!imagemUrl) return null;
      
      // Usar a mesma lógica do input principal que já funciona
      // Se a URL já é completa (começa com http), retorna como está
      if (imagemUrl.startsWith('http')) {
        return imagemUrl;
      }
      
      // Fallback para URLs locais (desenvolvimento)
      // Normalizar separadores de caminho (Windows usa \, Unix usa /)
      const normalizedUrl = imagemUrl.replace(/\\/g, '/');
      
      // Determinar a base URL baseada no ambiente
      let baseUrl;
      if (import.meta.env.VITE_API_URL) {
        // Remove /api do final se existir, pois vamos adicionar apenas o caminho da imagem
        baseUrl = import.meta.env.VITE_API_URL.replace(/\/api$/, '');
      } else {
        // Fallback para desenvolvimento
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
        
        if (isEditMode) {
          // Modo de edição
          if (formData.imagem) {
            formDataToSend.append('imagem', formData.imagem);
          }
          
          const response = await api.put(`/categorias/${categoria.id}`, formDataToSend);
          
                  if (response.success) {
          console.log('✅ Categoria editada com sucesso');
          // Disparar evento para o BaseModal fechar
          window.dispatchEvent(new CustomEvent('modalSaveSuccess', { detail: response.data }));
        }
        } else {
          // Modo de criação
          const estabelecimentoId = localStorage.getItem('estabelecimentoId');
          
          if (!estabelecimentoId) {
            throw new Error('Estabelecimento não identificado!');
          }

          formDataToSend.append('estabelecimento_id', estabelecimentoId);
          formDataToSend.append('imagem', formData.imagem);

          const response = await api.post('/categorias', formDataToSend);
          
          if (response.success) {
            // Limpar formulário apenas no modo de criação
            setFormData({ nome: '', imagem: null });
            setImagePreview(null);
            
                      console.log('✅ Categoria criada com sucesso');
          // Disparar evento para o BaseModal fechar
          window.dispatchEvent(new CustomEvent('modalSaveSuccess', { detail: response.data }));
          }
        }
      } catch (error) {
        const errorMessage = isEditMode ? 'Erro ao atualizar categoria: ' : 'Erro ao cadastrar categoria: ';
        setError(errorMessage + error.message);
      } finally {
        setIsLoading(false);
      }
    };

      return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col modal-form">
            {/* Conteúdo do formulário */}
      <div className="flex-1 space-y-8">
        {/* Nome - Obrigatório */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Nome da Categoria <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.nome}
            onChange={(e) => handleInputChange('nome', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            placeholder="Digite o nome da categoria"
            disabled={isLoading}
          />
        </div>

        {/* Imagem - Obrigatório apenas no modo de criação */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Imagem da Categoria {!isEditMode && <span className="text-red-500">*</span>}
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
          <p className="text-xs text-gray-500 text-center">
            {isEditMode && categoria?.imagem_url ? 'Deixe em branco para manter a imagem atual' : 'Formatos aceitos: PNG, JPG, JPEG (máx. 5MB)'}
          </p>
        </div>
          
                  {/* Seção de sugestões de imagens - LAYOUT HORIZONTAL */}
        {mostrarSugestoes && (
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-purple-800">
                Sugestões
              </h3>
              {buscandoImagens && (
                <div className="flex items-center gap-2 text-purple-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">Buscando...</span>
                </div>
              )}
            </div>
              
            {buscandoImagens ? (
              <div className="flex items-center justify-center py-8 bg-white rounded-xl border-2 border-dashed border-purple-300">
                <div className="text-center">
                  <Loader2 className="w-6 h-6 text-purple-500 animate-spin mx-auto mb-2" />
                  <p className="text-purple-700 font-medium text-sm">Encontrando imagens...</p>
                </div>
              </div>
            ) : sugestoesImagens.length > 0 ? (
              <div className="relative">
                {/* Container com scroll horizontal */}
                <div className="overflow-x-auto scrollbar-hide">
                  <div className="flex gap-3 pb-2" style={{ width: 'max-content' }}>
                    {sugestoesImagens.map((imagem, index) => (
                      <div
                        key={index}
                        className="group relative cursor-pointer flex-shrink-0"
                        onClick={() => selecionarImagemSugerida(imagem.url)}
                        onMouseEnter={() => {
                          // Preview automático no hover
                          setImagePreview(imagem.url);
                        }}
                        onMouseLeave={() => {
                          // Volta para a imagem original se não foi selecionada
                          if (!formData.imagem) {
                            setImagePreview(categoria?.imagem_url || null);
                          }
                        }}
                      >
                        {/* Card responsivo */}
                        <div className="relative overflow-hidden rounded-xl bg-white shadow-md border-2 border-transparent group-hover:border-purple-400 group-hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-1">
                          {/* Imagem responsiva */}
                          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 relative">
                            <img
                              src={getSuggestionImageUrl(imagem.thumbnail || imagem.url)}
                              alt={imagem.title || 'Imagem sugerida'}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              onError={(e) => {
                                console.error('Erro ao carregar imagem sugerida:', imagem.thumbnail || imagem.url);
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                              onLoad={() => {
                                console.log('✅ Imagem sugerida carregada:', imagem.thumbnail || imagem.url);
                              }}
                            />
                            {/* Fallback para erro */}
                            <div 
                              className="w-full h-full flex items-center justify-center text-purple-400 bg-purple-50"
                              style={{ display: 'none' }}
                            >
                              <ImageIcon size={16} className="sm:w-5 sm:h-5" />
                            </div>
                          </div>
                          
                          {/* Overlay com botão de seleção */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-1">
                            <div className="bg-white rounded-full p-1 shadow-lg transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                              <Upload className="w-3 h-3 text-purple-600" />
                            </div>
                          </div>
                          
                          {/* Indicador de seleção */}
                          <div className="absolute top-1 right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Indicador de scroll no mobile */}
                <div className="flex justify-center mt-2 sm:hidden">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-purple-300 rounded-full"></div>
                    <div className="w-1 h-1 bg-purple-300 rounded-full"></div>
                    <div className="w-1 h-1 bg-purple-300 rounded-full"></div>
                  </div>
                </div>
              </div>
            ) : formData.nome.trim().length >= 2 ? (
              <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-purple-300">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ImageIcon className="w-6 h-6 text-purple-500" />
                </div>
                <h4 className="text-purple-800 font-semibold mb-1 text-sm">Nenhuma imagem encontrada</h4>
                <p className="text-purple-600 text-xs">
                  Tente um termo diferente para "{formData.nome}"
                </p>
              </div>
            ) : null}
          </div>
        )}
          
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

  export default FormCategory;
