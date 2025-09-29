import React, { useState } from 'react';
import { Image as ImageIcon, Upload, Zap, Loader2, X } from 'lucide-react';
  
  import api, { buscarImagens } from '../../services/api';
  import ValidationNotification from '../elements/ValidationNotification';
  import { useFormValidation } from '../../hooks/useFormValidation';
  import FormContainer from './FormContainer';
  import FormField from './FormField';
  import FormInput from './FormInput';

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

    // Hook de validação
    const {
      errors,
      showNotification,
      validateForm,
      clearError,
      getFieldError,
      setShowNotification
    } = useFormValidation();
    
    // Estados para sugestões de imagens
    const [sugestoesImagens, setSugestoesImagens] = useState([]);
    const [buscandoImagens, setBuscandoImagens] = useState(false);
    const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
    const [imagensComErro, setImagensComErro] = useState(new Set());

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

    const handleRemoveImage = () => {
      setFormData(prev => ({
        ...prev,
        imagem: null
      }));
      setImagePreview(null);
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
          const imagens = response.imagens || [];
          
          // Filtrar imagens que já sabemos que têm erro
          const imagensNaoComErro = imagens.filter(imagem => 
            !imagensComErro.has(imagem.url)
          );
          
          // Validar imagens restantes
          const imagensValidas = await validarImagens(imagensNaoComErro);
          
          // Adicionar imagens com erro ao conjunto de erros
          const imagensComErroNovas = imagensNaoComErro.filter(imagem => 
            !imagensValidas.some(valida => valida.url === imagem.url)
          );
          
          if (imagensComErroNovas.length > 0) {
            setImagensComErro(prev => new Set([...prev, ...imagensComErroNovas.map(img => img.url)]));
          }
          
          setSugestoesImagens(imagensValidas);
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

    // Função para validar se uma imagem é carregável
    const validarImagem = async (url) => {
      try {
        const proxyUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/proxy-image?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl, { method: 'HEAD' });
        return response.ok;
      } catch (error) {
        return false;
      }
    };

    // Função para validar múltiplas imagens em paralelo
    const validarImagens = async (imagens) => {
      const validacoes = imagens.map(async (imagem) => {
        const isValid = await validarImagem(imagem.url);
        return { ...imagem, isValid };
      });
      
      const resultados = await Promise.all(validacoes);
      return resultados.filter(imagem => imagem.isValid);
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

    

    // Função para selecionar uma imagem sugerida
    const selecionarImagemSugerida = async (imagemUrl) => {
      try {
        // Usar o proxy do backend para evitar problemas de CORS
        const proxyUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/proxy-image?url=${encodeURIComponent(imagemUrl)}`;
        
        // Fazer download da imagem através do proxy
        const response = await fetch(proxyUrl);
        
        if (!response.ok) {
          // Verificar se é um erro específico de imagem não encontrada
          if (response.status === 404) {
            throw new Error('Esta imagem não está mais disponível ou foi bloqueada pelo servidor de origem. Tente selecionar outra imagem.');
          }
          throw new Error(`Erro ao carregar imagem: ${response.status}`);
        }
        
        const blob = await response.blob();
        
        // Verificar se o blob é válido (não é uma resposta de erro)
        if (blob.size === 0) {
          throw new Error('A imagem retornada está vazia. Tente selecionar outra imagem.');
        }
        
        // Criar um arquivo a partir do blob
        const file = new File([blob], 'imagem-sugerida.jpg', { type: blob.type });
        
        // Atualizar o estado do formulário
        setFormData(prev => ({
          ...prev,
          imagem: file
        }));
        
        // Atualizar o preview usando a URL original para exibição
        setImagePreview(imagemUrl);
        
        // Esconder as sugestões
        setMostrarSugestoes(false);
        setSugestoesImagens([]);
        
        // Limpar erro se existir
        setError('');
        
        console.log('✅ Imagem sugerida selecionada:', imagemUrl);
      } catch (error) {
        console.error('Erro ao selecionar imagem sugerida:', error);
        setError('Erro ao carregar a imagem selecionada: ' + error.message);
        
        // Manter as sugestões abertas para o usuário tentar outra imagem
        setMostrarSugestoes(true);
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
      
      // Se a URL já é completa (começa com http), usar proxy para evitar CORS
      if (imagemUrl.startsWith('http')) {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        return `${baseUrl}/api/proxy-image?url=${encodeURIComponent(imagemUrl)}`;
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
      const validationRules = {
        nome: { required: true, label: 'Nome da categoria' }
      };

      // Adicionar validação de imagem apenas no modo de criação
      if (!isEditMode) {
        validationRules.imagem = { required: true, label: 'Imagem da categoria' };
      }

      const isValid = validateForm(formData, validationRules);
      if (!isValid) {
        return;
      }

      setError('');

      // Disparar evento para o modal fechar IMEDIATAMENTE
      window.dispatchEvent(new CustomEvent('modalSaveSuccess', { detail: formData }));
      
      // Disparar evento de atualização em tempo real IMEDIATAMENTE
      window.dispatchEvent(new CustomEvent('categoriaUpdated'));
      window.dispatchEvent(new CustomEvent('produtoUpdated'));
      window.dispatchEvent(new CustomEvent('refreshCategorias'));

      // Salvar no backend em background (sem bloquear a UI)
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
            console.log('✅ Categoria criada com sucesso');
            // Limpar formulário apenas no modo de criação
            setFormData({ nome: '', imagem: null });
            setImagePreview(null);
          }
        }
      } catch (error) {
        console.error('Erro ao salvar categoria:', error);
        const errorMessage = isEditMode ? 'Erro ao atualizar categoria: ' : 'Erro ao cadastrar categoria: ';
        setError(errorMessage + error.message);
      }
    };

      return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col modal-form bg-white">
      <FormContainer>
        {/* Nome - Obrigatório */}
        <FormField 
          label="Nome da Categoria" 
          required
          error={getFieldError('nome')}
          helpText="Nome que aparecerá na listagem de categorias"
        >
          <FormInput
            type="text"
            value={formData.nome}
            onChange={(e) => {
              handleInputChange('nome', e.target.value);
              clearError('nome');
            }}
            placeholder="Digite o nome da categoria"
            error={!!getFieldError('nome')}
            disabled={isLoading}
          />
        </FormField>

        {/* Imagem - Obrigatório apenas no modo de criação */}
        <FormField 
          label="Imagem da Categoria"
          helpText={isEditMode && categoria?.imagem_url ? 'Deixe em branco para manter a imagem atual' : 'Formatos aceitos: PNG, JPG, JPEG (máx. 5MB)'}
        >
          <div className="flex justify-start">
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
              <div className="w-32 h-32 sm:w-40 sm:h-40 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 overflow-hidden bg-gray-50">
                {formData.imagem ? (
                  <div className="w-full h-full relative">
                    <img
                      src={URL.createObjectURL(formData.imagem)}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors duration-200"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : imagePreview ? (
                  <div className="w-full h-full relative">
                    <img
                      src={getImageUrl(imagePreview)}
                      alt="Imagem atual"
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <button
                      onClick={handleRemoveImage}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-colors duration-200"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-gray-500 p-2 sm:p-4 text-center">
                    <ImageIcon className="w-6 h-6 sm:w-10 sm:h-10 mb-2 sm:mb-3 text-gray-400" />
                    <span className="text-xs sm:text-sm font-medium">Clique para selecionar</span>
                    <span className="text-xs text-gray-400 mt-1">PNG, JPG até 5MB</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </FormField>
          
                  {/* Seção de sugestões de imagens - LAYOUT HORIZONTAL */}
        {mostrarSugestoes && (
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl p-2 sm:p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h3 className="text-sm sm:text-lg font-semibold text-purple-800">
                Sugestões
              </h3>
              {buscandoImagens && (
                <div className="flex items-center gap-1 sm:gap-2 text-purple-600">
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                  <span className="text-xs sm:text-sm font-medium">Buscando...</span>
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
                                // Adicionar classe para indicar erro
                                e.target.parentElement.classList.add('opacity-50', 'cursor-not-allowed');
                                // Adicionar à lista de imagens com erro
                                setImagensComErro(prev => new Set([...prev, imagem.url]));
                                // Remover da lista de sugestões
                                setSugestoesImagens(prev => prev.filter(img => img.url !== imagem.url));
                              }}
                              onLoad={() => {
                                console.log('✅ Imagem sugerida carregada:', imagem.thumbnail || imagem.url);
                                // Remover classe de erro se carregou com sucesso
                                e.target.parentElement.classList.remove('opacity-50', 'cursor-not-allowed');
                              }}
                            />
                            {/* Fallback para erro */}
                            <div 
                              className="w-full h-full flex flex-col items-center justify-center text-red-400 bg-red-50 text-xs"
                              style={{ display: 'none' }}
                            >
                              <ImageIcon size={12} className="mb-1" />
                              <span className="text-center px-1">Erro</span>
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
                <h4 className="text-purple-800 font-semibold mb-1 text-sm">
                  {imagensComErro.size > 0 ? 'Imagens indisponíveis' : 'Nenhuma imagem encontrada'}
                </h4>
                <p className="text-purple-600 text-xs">
                  {imagensComErro.size > 0 
                    ? 'As imagens sugeridas não estão mais disponíveis. Tente um termo diferente.'
                    : `Tente um termo diferente para "${formData.nome}"`
                  }
                </p>
                {imagensComErro.size > 0 && (
                  <button
                    onClick={() => {
                      setImagensComErro(new Set());
                      buscarSugestoesImagens(formData.nome);
                    }}
                    className="mt-3 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-xs font-medium transition-colors"
                  >
                    Tentar novamente
                  </button>
                )}
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
      </FormContainer>

      {/* Notificação de Validação */}
      <ValidationNotification
        isOpen={showNotification}
        onClose={() => setShowNotification(false)}
        errors={errors}
        title="Campos obrigatórios não preenchidos"
      />
    </form>
  );
  };

  export default FormCategory;
