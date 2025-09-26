import React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../layout/SeachBar';
import SaveButton from '../buttons/Save';
import CancelButton from '../buttons/Cancel';
import Back from '../buttons/Back';
import Information from '../buttons/Information';
import api from '../../services/api';
import Counter from '../elements/Counter';
import ConfirmDialog from '../elements/ConfirmDialog';
import BaseModal from '../modals/Base';
import { imprimirNotaCozinha } from '../../services/notaFiscalPrint';
// Removido import do cache - agora busca diretamente da API

const PanelItens = ({ estabelecimentoId, onOpenDetails, mobileHidden = false, onAddItem, onSave, selectedCounts = {}, totalSelectedCount = 0, disabled = false, isBalcao = false, identificacao, nomePonto, vendedor, usuarioId, pedido, pendingCombosByProductId = {} }) => {
  const navigate = useNavigate();
  
  // Estados para categorias e produtos (busca direta da API)
  const [categorias, setCategorias] = React.useState([]);
  const [loadingCats, setLoadingCats] = React.useState(false);
  const [errorCats, setErrorCats] = React.useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState(null);
  const [search, setSearch] = React.useState('');

  const [produtos, setProdutos] = React.useState([]);
  const [loadingProdutos, setLoadingProdutos] = React.useState(true);
  const [erroProdutos, setErroProdutos] = React.useState(null);
  const [confirmUnsavedOpen, setConfirmUnsavedOpen] = React.useState(false);
  const [savingAndExit, setSavingAndExit] = React.useState(false);
  const [pendingNavAction, setPendingNavAction] = React.useState(null); // 'home' | 'back'
  const [savingAndPrinting, setSavingAndPrinting] = React.useState(false);

  // Modal de complementos
  const [complementsModalOpen, setComplementsModalOpen] = React.useState(false);
  const [modalProduto, setModalProduto] = React.useState(null);
  const [modalCategoriasComplementos, setModalCategoriasComplementos] = React.useState([]);
  const [modalItensComplementosByCategoria, setModalItensComplementosByCategoria] = React.useState({});
  const [modalLoadingItens, setModalLoadingItens] = React.useState(false);
  const [modalError, setModalError] = React.useState(null);
  // Armazena quantidades por categoria -> complementoId -> qty
  const [modalSelectedByCategoria, setModalSelectedByCategoria] = React.useState({});
  const [modalCategoryErrors, setModalCategoryErrors] = React.useState({});

  const resolveEstabelecimentoId = React.useCallback(() => {
    // Tenta interpretar a prop como número
    if (estabelecimentoId !== undefined && estabelecimentoId !== null) {
      const parsed = parseInt(estabelecimentoId, 10);
      if (!Number.isNaN(parsed)) return parsed;
    }
    // Tenta obter do localStorage chave direta
    const fromStorage = localStorage.getItem('estabelecimentoId');
    if (fromStorage) {
      const parsedStorage = parseInt(fromStorage, 10);
      if (!Number.isNaN(parsedStorage)) return parsedStorage;
    }
    // Tenta obter do usuário logado
    try {
      const usuarioRaw = localStorage.getItem('usuario');
      if (usuarioRaw) {
        const usuario = JSON.parse(usuarioRaw);
        const cand = parseInt(usuario?.estabelecimento_id, 10);
        if (!Number.isNaN(cand)) return cand;
      }
    } catch {
      /* ignore */
    }
    return null;
  }, [estabelecimentoId]);

  // Função para carregar categorias diretamente da API
  const loadCategorias = React.useCallback(async (forceRefresh = false) => {
    const id = resolveEstabelecimentoId();
    if (!id) {
      console.warn('⚠️ PanelItens: estabelecimentoId não encontrado');
      return;
    }

    try {
      setLoadingCats(true);
      setErrorCats(null);
      console.log('🔄 PanelItens - Carregando categorias da API...');
      
      const response = await api.get(`/categorias/${id}`);
      if (response.success && response.data) {
        const categoriasData = Array.isArray(response.data) ? response.data : response.data.categorias || [];
        setCategorias(categoriasData);
        console.log('✅ PanelItens - Categorias carregadas:', categoriasData.length);
      } else {
        console.warn('⚠️ PanelItens - Resposta da API sem sucesso para categorias');
        setCategorias([]);
      }
    } catch (error) {
      console.warn('⚠️ PanelItens - Erro ao carregar categorias:', error.message);
      setErrorCats(error.message);
      setCategorias([]);
    } finally {
      setLoadingCats(false);
    }
  }, [resolveEstabelecimentoId]);

  // Carregar categorias da API
  React.useEffect(() => {
    const id = resolveEstabelecimentoId();
    if (id) {
      console.log('🔄 PanelItens - Carregando categorias da API...');
      loadCategorias().catch(error => {
        console.warn('⚠️ Erro ao carregar categorias, continuando sem categorias:', error);
      });
    }
  }, [resolveEstabelecimentoId, loadCategorias]);

  // Atualizar categoria selecionada quando categorias mudarem
  React.useEffect(() => {
    if (categorias && categorias.length > 0) {
      const activeCategorias = categorias.filter((c) => c && (c.status === true || c.status === 1));
      if ((!selectedCategoryId || !activeCategorias.some((c) => Number(c.id) === Number(selectedCategoryId))) && activeCategorias.length) {
        console.log('🔄 PanelItens - Selecionando primeira categoria:', activeCategorias[0].nome);
        setSelectedCategoryId(activeCategorias[0].id);
      }
    }
  }, [categorias, selectedCategoryId]);

  // Listener para atualizações de categorias em tempo real
  React.useEffect(() => {
    const handleCategoriaUpdate = () => {
      console.log('🔄 PanelItens - Evento de atualização de categoria recebido, recarregando...');
      const id = resolveEstabelecimentoId();
      if (id) {
        loadCategorias(true); // Forçar recarregamento
      }
    };

    window.addEventListener('categoriaUpdated', handleCategoriaUpdate);
    
    return () => {
      window.removeEventListener('categoriaUpdated', handleCategoriaUpdate);
    };
  }, [resolveEstabelecimentoId, loadCategorias]);

  React.useEffect(() => {
    let isMounted = true;
    async function fetchProdutos() {
      const id = resolveEstabelecimentoId();
      if (id === null) {
        if (isMounted) {
          setErroProdutos('Estabelecimento não definido');
          setLoadingProdutos(false);
        }
        return;
      }
      
      try {

        setLoadingProdutos(true);
        setErroProdutos(null);
        const response = await api.get(`/produtos/${id}?page=1&limit=200`);
        if (!isMounted) return;
        if (response.success) {
          const list = response.data?.produtos || response.data || [];
          const filtered = Array.isArray(list)
            ? list.filter((p) => (p?.status === true || p?.status === 1) && (p?.categoria_status === true || p?.categoria_status === 1))
            : [];
          setProdutos(filtered);
        } else {
          setErroProdutos('Erro ao carregar produtos');
        }
      } catch {
        if (!isMounted) return;
        setErroProdutos('Erro ao carregar produtos');
      } finally {
        if (isMounted) setLoadingProdutos(false);
      }
    }
    fetchProdutos();
    return () => { isMounted = false; };
  }, [resolveEstabelecimentoId]);

  const getImageUrl = (imagemUrl) => {
    if (!imagemUrl) return null;
    if (String(imagemUrl).startsWith('http')) return imagemUrl;
    const normalizedUrl = String(imagemUrl).replace(/\\/g, '/');
    const baseEnv = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') : 'http://localhost:3001';
    const cleanBase = baseEnv.replace(/\/$/, '');
    const cleanImage = normalizedUrl.replace(/^\//, '');
    return `${cleanBase}/${cleanImage}`;
  };

  const handleProdutoClick = async (produto) => {
    // Se o painel estiver desabilitado, não fazer nada
    if (disabled) return;
    
    try {
      // Verifica se o produto possui alguma categoria de complementos ativa
      const resp = await api.get(`/categorias-complementos/${produto.id}`);
      const categorias = resp?.data || resp?.data === 0 ? resp.data : (resp?.success ? resp.data : []);
      const activeCats = Array.isArray(categorias) ? categorias.filter((c) => c && (c.status === true || c.status === 1)) : [];
      const hasCategorias = activeCats.length > 0;
      if (hasCategorias) {
        setModalProduto(produto);
        setModalCategoriasComplementos(activeCats);
        setComplementsModalOpen(true);
      } else {
        // Adiciona direto se não houver categorias de complementos
        onAddItem?.(produto);
      }
    } catch {
      // Em caso de erro ao verificar, segue o fluxo simples de adicionar direto
      onAddItem?.(produto);
    }
  };

  // Carrega itens de complementos por categoria quando abrir o modal
  React.useEffect(() => {
    let isMounted = true;
    async function fetchItens() {
      if (!complementsModalOpen || !Array.isArray(modalCategoriasComplementos) || modalCategoriasComplementos.length === 0) return;
      
      
      try {
        setModalLoadingItens(true);
        setModalError(null);
        const results = await Promise.all(
          modalCategoriasComplementos.map(async (cat) => {
            try {
              console.log(`🔍 Buscando complementos para categoria ${cat.id} (${cat.nome})`);
              const r = await api.get(`/itens-complementos/categoria/${cat.id}`);
              console.log(`📦 Resposta da API para categoria ${cat.id}:`, r);
              const itens = r?.data || (r?.success ? r.data : []);
              console.log(`📋 Itens processados para categoria ${cat.id}:`, itens);
              return { categoriaId: cat.id, itens: Array.isArray(itens) ? itens : [] };
            } catch (error) {
              console.error(`❌ Erro ao buscar complementos para categoria ${cat.id}:`, error);
              return { categoriaId: cat.id, itens: [] };
            }
          })
        );
        if (!isMounted) return;
        const byCat = {};
        for (const { categoriaId, itens } of results) {
          byCat[categoriaId] = itens;
        }
        setModalItensComplementosByCategoria(byCat);
        console.log('📊 Estado modalItensComplementosByCategoria atualizado:', byCat);
        // inicializa seleção vazia para categorias ainda não vistas
        setModalSelectedByCategoria((prev) => {
          const next = { ...prev };
          for (const cat of modalCategoriasComplementos) {
            if (!next[cat.id]) next[cat.id] = {}; // complementoId -> qty
          }
          return next;
        });
      } catch {
        if (!isMounted) return;
        setModalError('Erro ao carregar complementos');
      } finally {
        if (isMounted) setModalLoadingItens(false);
      }
    }
    fetchItens();
    return () => { isMounted = false; };
  }, [complementsModalOpen, modalCategoriasComplementos]);

  // Garante que as seleções respeitam as regras (máximo e seleção única)
  React.useEffect(() => {
    if (!Array.isArray(modalCategoriasComplementos) || modalCategoriasComplementos.length === 0) return;
    const next = { ...modalSelectedByCategoria };
    let changed = false;
    for (const cat of modalCategoriasComplementos) {
      const max = cat?.quantidade_maxima == null ? Infinity : Number(cat.quantidade_maxima);
      const map = { ...(next[cat.id] || {}) };
      const entries = Object.entries(map).filter(([, q]) => Number(q) > 0);
      if (Number.isFinite(max) && max === 1) {
        // Seleção única: manter apenas um item com quantidade 1
        if (entries.length > 1 || (entries.length === 1 && Number(entries[0][1]) !== 1)) {
          const keepKey = entries[0]?.[0];
          next[cat.id] = keepKey ? { [keepKey]: 1 } : {};
          changed = true;
        }
      } else if (Number.isFinite(max) && max >= 2) {
        // Limitar o total ao máximo
        let remaining = max;
        const newMap = {};
        for (const [k, qRaw] of entries) {
          const q = Number(qRaw) || 0;
          if (remaining <= 0) break;
          const allow = Math.min(q, remaining);
          if (allow > 0) newMap[k] = allow;
          remaining -= allow;
        }
        const prevKeys = Object.keys(map);
        const newKeys = Object.keys(newMap);
        const same = prevKeys.length === newKeys.length && prevKeys.every((k) => Number(map[k]) === Number(newMap[k]));
        if (!same) {
          next[cat.id] = newMap;
          changed = true;
        }
      }
    }
    if (changed) {
      setModalSelectedByCategoria(next);
    }
  }, [modalCategoriasComplementos, modalSelectedByCategoria]);

  // Função para buscar dados do estabelecimento
  const buscarDadosEstabelecimento = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002/api'}/estabelecimento/meu`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return result.data;
        }
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar dados do estabelecimento:', error);
      return null;
    }
  };

  // Função para lidar com salvamento e impressão
  const handleSaveAndPrint = async () => {
    if (totalSelectedCount === 0) {
      // Se não há itens selecionados, apenas salva
      await onSave?.();
      return;
    }

    try {
      setSavingAndPrinting(true);
      
      // PRIMEIRO: Buscar dados do estabelecimento
      console.log('🏢 Buscando dados do estabelecimento...');
      const estabelecimento = await buscarDadosEstabelecimento();
      console.log('📋 Dados do estabelecimento:', estabelecimento);
      
      // SEGUNDO: Imprimir a nota de cozinha com os itens novos (não salvos)
      console.log('🖨️ Imprimindo nota de cozinha com itens novos...');
      
      // Converter selectedCounts para formato de itens para impressão
      const itensParaImpressao = [];
      for (const [produtoId, quantidade] of Object.entries(selectedCounts)) {
        if (quantidade > 0) {
          const produto = produtos.find(p => Number(p.id) === Number(produtoId));
          if (produto) {
            // Buscar complementos para este produto
            const combos = pendingCombosByProductId[produtoId] || [];
            
            // Se não há combos, criar item simples
            if (combos.length === 0) {
              itensParaImpressao.push({
                id: produto.id,
                name: produto.nome,
                produto_nome: produto.nome,
                qty: quantidade,
                quantidade: quantidade,
                unitPrice: produto.valor_venda,
                valor_unitario: produto.valor_venda,
                complements: []
              });
            } else {
              // Criar um item separado para cada combo (cada clique no produto)
              combos.forEach((combo, index) => {
                if (Array.isArray(combo)) {
                  const complementos = combo.map(complemento => ({
                    id: complemento.id,
                    name: complemento.name,
                    nome_complemento: complemento.name,
                    qty: complemento.qty || 0,
                    quantidade: complemento.qty || 0,
                    unitPrice: complemento.unitPrice || 0,
                    valor_unitario: complemento.unitPrice || 0
                  }));
                  
                  itensParaImpressao.push({
                    id: `${produto.id}-${index}`, // ID único para cada combo
                    name: produto.nome,
                    produto_nome: produto.nome,
                    qty: 1, // Cada combo representa 1 item
                    quantidade: 1,
                    unitPrice: produto.valor_venda,
                    valor_unitario: produto.valor_venda,
                    complements: complementos
                  });
                }
              });
            }
          }
        }
      }

      if (itensParaImpressao.length > 0) {
        console.log('📋 Itens para impressão (com complementos):', itensParaImpressao);
        
        // Buscar dados do pedido atual para obter o código correto
        let pedidoParaImpressao = pedido || { id: 'NOVO', codigo: 'NOVO' };
        try {
          const estId = Number(localStorage.getItem('estabelecimentoId')) || null;
          if (estId && identificacao) {
            console.log('🔍 Buscando dados do pedido para impressão...');
            const printResponse = await api.get(`/pedidos/${estId}/${encodeURIComponent(identificacao)}`);
            if (printResponse.success && printResponse.data && printResponse.data.pedido) {
              pedidoParaImpressao = printResponse.data.pedido;
              console.log('✅ Dados do pedido obtidos:', pedidoParaImpressao);
            }
          }
        } catch (error) {
          console.warn('⚠️ Erro ao buscar dados do pedido, usando dados padrão:', error);
        }
        
        // Imprimir nota de cozinha com dados do estabelecimento
        imprimirNotaCozinha(
          pedidoParaImpressao,
          itensParaImpressao,
          identificacao,
          nomePonto,
          vendedor,
          usuarioId,
          estabelecimento
        );
        console.log('✅ Nota de cozinha enviada para impressão');
        
        // Aguardar um pouco para a impressão processar
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // TERCEIRO: Salvar o pedido
      console.log('💾 Salvando pedido...');
      await onSave?.();
      
      // QUARTO: Navegar de volta
      console.log('🏠 Navegando de volta...');
      navigate('/home');
      
    } catch (error) {
      console.error('❌ Erro ao salvar e imprimir:', error);
      alert('Erro ao salvar e imprimir: ' + error.message);
    } finally {
      setSavingAndPrinting(false);
    }
  };

  return (
    <>
      <main className={`${mobileHidden ? 'hidden md:flex' : 'flex md:flex'} fixed md:top-4 md:bottom-4 md:right-4 md:left-[calc(35%+7rem)] lg:left-[calc(30%+7rem)] top-0 bottom-0 left-0 right-0 bg-white border border-gray-200 md:rounded-2xl shadow-2xl z-50 flex-col ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Header com barra de pesquisa no topo */}
      <div className="p-3 md:p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          {/* Mostrar Back apenas em telas pequenas */}
          <div className="md:hidden">
            <Back onClick={() => {
              if (isBalcao) {
                // Balcão: sair sem confirmação (não salva itens)
                navigate('/home');
              } else if (totalSelectedCount > 0) {
                setPendingNavAction('home');
                setConfirmUnsavedOpen(true);
              } else {
                navigate('/home');
              }
            }} />
          </div>
          <SearchBar placeholder="Buscar produtos e categorias" value={search} onChange={setSearch} />
        </div>
      </div>

      {/* Conteúdo do painel */}
      <div className="flex-1 overflow-y-auto p-2 md:p-3 scrollbar-hide">
        {disabled && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-600 mb-2">Painel de Pagamentos Ativo</div>
              <div className="text-sm text-gray-500">Finalize o pagamento para continuar adicionando itens</div>
            </div>
          </div>
        )}
        <div className="overflow-x-auto scrollbar-hide">
          {loadingCats ? (
            <div className="text-xs text-slate-500 px-1">Carregando categorias...</div>
          ) : errorCats ? (
            <div className="text-xs text-red-500 px-1">{errorCats}</div>
          ) : categorias && categorias.length ? (
            <div className="flex items-start gap-2 md:gap-3">
              {categorias.map((cat) => {
                const isSelected = Number(selectedCategoryId) === Number(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`relative flex-shrink-0 w-16 md:w-20 group transition-transform duration-150 ${isSelected ? 'scale-110 z-[1]' : 'hover:scale-110'}`}
                  >
                    <div className={`mx-auto w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden bg-slate-100 shadow-sm border-[3px] ${isSelected ? 'border-blue-600' : 'border-blue-500'} mt-1 mb-1`}>
                      {getImageUrl(cat.imagem_url) ? (
                        <img src={getImageUrl(cat.imagem_url)} alt={cat.nome} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full" />
                      )}
                    </div>
                    <div className="mt-1 text-[10px] md:text-[11px] text-slate-700 text-center truncate">{cat.nome}</div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-slate-400 px-1">Nenhuma categoria</div>
          )}
        </div>
        {/* Produtos filtrados */}
        <div className="pt-2 md:pt-3">
          {loadingProdutos && (!produtos || produtos.length === 0) ? (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-2.5 animate-pulse">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-1.5 md:p-2">
                  <div className="aspect-square p-1.5 md:p-2">
                    <div className="w-full h-full rounded-lg bg-gray-200" />
                  </div>
                  <div className="mt-1 space-y-1">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : erroProdutos ? (
            <div className="text-sm text-red-500">{erroProdutos}</div>
          ) : (
            (() => {
              const filtered = Array.isArray(produtos)
                ? produtos.filter((p) => {
                    if (selectedCategoryId && Number(p.categoria_id) !== Number(selectedCategoryId)) return false;
                    const q = String(search || '').toLowerCase().trim();
                    if (!q) return true;
                    const name = String(p.nome || '').toLowerCase();
                    if (name.includes(q)) return true;
                    const catName = String((categorias.find((c) => Number(c.id) === Number(p.categoria_id)) || {}).nome || '').toLowerCase();
                    return catName.includes(q);
                  })
                : [];
              if (!filtered.length) {
                return <div className="text-sm text-slate-400">Nenhum produto para esta categoria.</div>;
              }
              const formatCurrency = (value) => {
                if (!value) return 'R$\u00A00,00';
                return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
              };
              return (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-2.5 transition-opacity duration-200">
                  {filtered.map((produto) => (
                    <button onClick={() => handleProdutoClick(produto)} key={produto.id} className="relative text-left bg-white border border-gray-200 rounded-xl p-1.5 md:p-2 shadow-sm hover:shadow transition-transform duration-150 hover:-translate-y-0.5">
                      <div className="aspect-square p-1.5 md:p-2 relative">
                        <div className="w-full h-full rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                          {getImageUrl(produto.imagem_url) ? (
                            <img src={getImageUrl(produto.imagem_url)} alt={produto.nome} className="w-full h-full object-cover" />
                          ) : null}
                        </div>
                        <Counter value={selectedCounts[produto.id] || 0} />
                      </div>
                      <div className="mt-1 md:mt-1.5">
                        <div className="text-[12px] md:text-[13px] font-medium text-gray-900 truncate">{produto.nome}</div>
                        <div className="text-[12px] md:text-[13px] font-semibold text-gray-800">{formatCurrency(produto.valor_venda)}</div>
                      </div>
                    </button>
                  ))}
                </div>
              );
            })()
          )}
        </div>
      </div>

      {/* Footer com botões Information, Cancelar e Salvar alinhados à direita */}
      {!isBalcao && (
        <div className="border-t border-gray-200 p-2 md:p-3">
          <div className="flex items-center justify-end gap-2 w-full flex-nowrap">
            <div className="flex items-center justify-end gap-2 ml-auto">
              {/* Information apenas no mobile */}
              <div className="md:hidden">
                <Information onClick={onOpenDetails} />
              </div>
              <CancelButton onClick={() => {
                if (totalSelectedCount > 0) {
                  setPendingNavAction('back');
                  setConfirmUnsavedOpen(true);
                } else {
                  navigate(-1);
                }
              }} className="w-auto min-w-[120px] px-4 py-2.5 text-xs md:text-sm rounded-lg whitespace-nowrap" />
              <SaveButton onClick={handleSaveAndPrint} disabled={savingAndPrinting} className="w-auto min-w-[120px] px-4 py-2.5 text-xs md:text-sm rounded-lg whitespace-nowrap">
                {savingAndPrinting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Salvando...
                  </div>
                ) : (
                  totalSelectedCount > 0 ? `Salvar (${totalSelectedCount})` : 'Salvar'
                )}
              </SaveButton>
            </div>
          </div>
        </div>
      )}

      {/* Footer para balcão com botão de informação */}
      {isBalcao && (
        <div className="border-t border-gray-200 p-2 md:p-3">
          <div className="flex items-center justify-end gap-2 w-full flex-nowrap">
            <Information onClick={onOpenDetails} variant="orange" />
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmUnsavedOpen}
        onClose={() => setConfirmUnsavedOpen(false)}
        onSecondary={() => {
          setConfirmUnsavedOpen(false);
          if (pendingNavAction === 'home') navigate('/home');
          else if (pendingNavAction === 'back') navigate(-1);
          setPendingNavAction(null);
        }}
        onPrimary={async () => {
          try {
            setSavingAndExit(true);
            await onSave?.();
          } finally {
            setSavingAndExit(false);
            setConfirmUnsavedOpen(false);
            setPendingNavAction(null);
          }
        }}
        title="Itens não salvos"
        message={"Existem itens adicionados que não foram salvos. Deseja sair? Se sair agora, os itens não serão salvos."}
        primaryLabel="Salvar e sair"
        secondaryLabel="Sair"
        isLoading={savingAndExit}
      />
      {/* Modal para seleção de complementos (exibição simples por enquanto) */}
      {complementsModalOpen && createPortal(
        <BaseModal
        isOpen={complementsModalOpen}
        onClose={() => {
          setComplementsModalOpen(false);
          setModalProduto(null);
          setModalCategoriasComplementos([]);
          setModalItensComplementosByCategoria({});
          setModalError(null);
          setModalSelectedByCategoria({});
          setModalCategoryErrors({});
        }}
        title={''}
        headerContent={modalProduto ? (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
              {getImageUrl(modalProduto.imagem_url) ? (
                <img src={getImageUrl(modalProduto.imagem_url)} alt={modalProduto.nome} className="w-full h-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">{modalProduto.nome}</div>
              <div className="text-sm font-medium text-gray-800 truncate">
                {(() => {
                  const v = modalProduto.valor_venda;
                  const str = (v || v === 0) ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v) : 'R$\u00A00,00';
                  return str;
                })()}
              </div>
            </div>
          </div>
        ) : null}
        iconBgColor="bg-amber-500"
        onSave={() => {
          if (modalProduto) {
            // Monta a lista de complementos selecionados com nome e valor
            let selectedComplements = [];
            try {
              for (const cat of modalCategoriasComplementos || []) {
                const itens = modalItensComplementosByCategoria[cat.id] || [];
                const selecionados = Object.entries(modalSelectedByCategoria[cat.id] || {})
                  .filter(([, qty]) => Number(qty) > 0)
                  .map(([compId]) => Number(compId));
                
                for (const compId of selecionados) {
                  const found = itens.find((it) => Number(it.complemento_id) === Number(compId));
                  if (found) {
                    const qty = Number(modalSelectedByCategoria[cat.id]?.[found.complemento_id] || 0);
                    if (qty > 0) {
                      selectedComplements.push({
                        id: Number(found.complemento_id),
                        name: String(found.complemento_nome || ''),
                        unitPrice: Number(found.complemento_valor) || 0,
                        qty
                      });
                    }
                  }
                }
              }
            } catch (error) {
              console.error('Erro ao processar complementos:', error);
            }
            
            console.log('🛒 Adicionando produto com complementos:', {
              produto: modalProduto.nome,
              complementos: selectedComplements
            });
            
            onAddItem?.(modalProduto, selectedComplements);
          }
          // Limpa estado após salvar
          setComplementsModalOpen(false);
          setModalProduto(null);
          setModalCategoriasComplementos([]);
          setModalItensComplementosByCategoria({});
          setModalError(null);
          setModalSelectedByCategoria({});
          setModalCategoryErrors({});
        }}
      >
        <form
          className="modal-form space-y-4 sm:space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            // Validação por categoria: mostrar erros diretamente em cada categoria
            const nextErrors = {};
            for (const cat of modalCategoriasComplementos || []) {
              const max = cat.quantidade_maxima == null ? Infinity : Number(cat.quantidade_maxima);
              const obrig = !!cat.preenchimento_obrigatorio;
              const mapQty = modalSelectedByCategoria[cat.id] || {};
              const total = Object.values(mapQty).reduce((s, q) => s + (Number(q) || 0), 0);
              if (obrig && total < 1) {
                nextErrors[cat.id] = 'Selecione pelo menos 1 item';
                continue;
              }
              if (Number.isFinite(max) && total > max) {
                nextErrors[cat.id] = `Máximo permitido é ${max}`;
              }
            }
            if (Object.keys(nextErrors).length > 0) {
              setModalCategoryErrors(nextErrors);
              return;
            }
            setModalCategoryErrors({});
            
            // Chama diretamente o onSave do BaseModal
            if (modalProduto) {
              // Monta a lista de complementos selecionados com nome e valor
              let selectedComplements = [];
              try {
                for (const cat of modalCategoriasComplementos || []) {
                  const itens = modalItensComplementosByCategoria[cat.id] || [];
                  const selecionados = Object.entries(modalSelectedByCategoria[cat.id] || {})
                    .filter(([, qty]) => Number(qty) > 0)
                    .map(([compId]) => Number(compId));
                  
                  for (const compId of selecionados) {
                    const found = itens.find((it) => Number(it.complemento_id) === Number(compId));
                    if (found) {
                      const qty = Number(modalSelectedByCategoria[cat.id]?.[found.complemento_id] || 0);
                      if (qty > 0) {
                        selectedComplements.push({
                          id: Number(found.complemento_id),
                          name: String(found.complemento_nome || ''),
                          unitPrice: Number(found.complemento_valor) || 0,
                          qty
                        });
                      }
                    }
                  }
                }
              } catch (error) {
                console.error('Erro ao processar complementos:', error);
              }
              
              console.log('🛒 Adicionando produto com complementos:', {
                produto: modalProduto.nome,
                complementos: selectedComplements
              });
              
              onAddItem?.(modalProduto, selectedComplements);
            }
            
            // Fecha o modal
            setComplementsModalOpen(false);
            setModalProduto(null);
            setModalCategoriasComplementos([]);
            setModalItensComplementosByCategoria({});
            setModalError(null);
            setModalSelectedByCategoria({});
            setModalCategoryErrors({});
          }}
        >
          {/* Container principal organizado */}
          <div className="flex flex-col h-full px-4 sm:px-6">
            {/* Título Complementos - alinhado no start */}
            <div className="py-3 border-b border-gray-100 mb-4">
              <h3 className="text-sm font-semibold text-gray-800">Complementos</h3>
            </div>

            {/* Conteúdo das categorias e seus complementos */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {(!modalCategoriasComplementos || modalCategoriasComplementos.length === 0) ? (
                <div className="text-sm text-slate-500 text-center py-8">Nenhuma categoria de complementos disponível.</div>
              ) : modalLoadingItens ? (
                <div className="text-sm text-slate-500 text-center py-8">Carregando complementos...</div>
              ) : modalError ? (
                <div className="text-sm text-red-500 text-center py-8">{modalError}</div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
              {modalCategoriasComplementos.map((cat) => {
                const itens = modalItensComplementosByCategoria[cat.id] || [];
                console.log(`🎯 Renderizando categoria ${cat.id} (${cat.nome}) com ${itens.length} itens:`, itens);
                return (
                  <div key={cat.id} className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                    {/* Cabeçalho da categoria - alinhado no start */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-gray-800 truncate">{cat.nome}</h4>
                        {cat.preenchimento_obrigatorio && (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 border border-gray-200 flex-shrink-0">
                            Obrigatório
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {(() => {
                          const max = cat.quantidade_maxima == null ? Infinity : Number(cat.quantidade_maxima);
                          if (Number.isFinite(max)) {
                            return `Selecione até ${max} ${max === 1 ? 'item' : 'itens'}`;
                          }
                          return 'Selecione quantos quiser';
                        })()}
                      </div>
                    </div>
                    {modalCategoryErrors[cat.id] ? (
                      <div className="mt-1 text-xs text-red-500">{modalCategoryErrors[cat.id]}</div>
                    ) : null}
                    {(!itens || itens.length === 0) ? (
                      <div className="text-xs text-slate-500 text-center py-4 bg-white rounded-md border border-gray-100">
                        Nenhum complemento nesta categoria.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {itens.map((it) => {
                          const qtyMap = modalSelectedByCategoria[cat.id] || {};
                          const currentQty = Number(qtyMap[it.complemento_id] || 0);
                          const max = cat.quantidade_maxima == null ? Infinity : Number(cat.quantidade_maxima);
                          const isSingleChoice = Number.isFinite(max) && Number(max) === 1;
                          const totalSelected = Object.values(qtyMap).reduce((s, q) => s + (Number(q) || 0), 0);
                          const canIncrement = totalSelected < max;
                          const formatMoney = (v) => (v || v === 0) ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v) : 'R$\u00A00,00';
                          return (
                            <div key={it.id} className={`flex items-center justify-between rounded-lg border px-3 py-2.5 transition-colors ${
                              currentQty > 0 
                                ? 'bg-blue-50 border-blue-200' 
                                : 'bg-white border-gray-200 hover:border-gray-300'
                            }`}>
                              <div className="min-w-0 pr-3 flex-1">
                                <div className="text-sm font-medium text-gray-800 truncate">{it.complemento_nome}</div>
                                <div className="text-xs text-blue-600 font-semibold mt-0.5">{formatMoney(it.complemento_valor)}</div>
                              </div>
                              <div className="flex items-center justify-end gap-2 min-w-[80px] sm:min-w-[90px]">
                                {isSingleChoice ? (
                                  <button
                                    type="button"
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                      currentQty > 0 
                                        ? 'border-blue-600 bg-blue-600 text-white' 
                                        : 'border-gray-300 bg-white text-gray-400 hover:border-blue-400'
                                    }`}
                                    onClick={() => {
                                      setModalSelectedByCategoria((prev) => {
                                        const next = { ...prev };
                                        const mapForCat = { ...(next[cat.id] || {}) };
                                        if (currentQty > 0) {
                                          Object.keys(mapForCat).forEach((k) => delete mapForCat[k]);
                                        } else {
                                          Object.keys(mapForCat).forEach((k) => delete mapForCat[k]);
                                          mapForCat[it.complemento_id] = 1;
                                        }
                                        next[cat.id] = mapForCat;
                                        return next;
                                      });
                                    }}
                                  >
                                    {currentQty > 0 && (
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    )}
                                  </button>
                                ) : (
                                  <div className="inline-flex items-center gap-1.5">
                                    {currentQty > 0 ? (
                                      <button
                                        type="button"
                                        className="w-6 h-6 inline-flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                                        onClick={() => {
                                          setModalSelectedByCategoria((prev) => {
                                            const next = { ...prev };
                                            const mapForCat = { ...(next[cat.id] || {}) };
                                            const newQty = Math.max(0, currentQty - 1);
                                            if (newQty === 0) delete mapForCat[it.complemento_id];
                                            else mapForCat[it.complemento_id] = newQty;
                                            next[cat.id] = mapForCat;
                                            return next;
                                          });
                                        }}
                                      >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                        </svg>
                                      </button>
                                    ) : null}
                                    {currentQty > 0 ? (
                                      <span className="min-w-[20px] text-center text-sm font-semibold text-gray-700">{currentQty}</span>
                                    ) : null}
                                    <button
                                      type="button"
                                      disabled={!canIncrement}
                                      className={`w-6 h-6 inline-flex items-center justify-center rounded-full border text-sm font-medium transition-colors ${
                                        canIncrement 
                                          ? 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700' 
                                          : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                      }`}
                                      onClick={() => {
                                        const nextTotal = totalSelected + 1;
                                        if (Number.isFinite(max) && nextTotal > max) {
                                          setModalCategoryErrors((prev) => ({ ...prev, [cat.id]: `Máximo permitido é ${max}` }));
                                          setTimeout(() => setModalCategoryErrors((prev) => {
                                            const copy = { ...prev };
                                            delete copy[cat.id];
                                            return copy;
                                          }), 2000);
                                          return;
                                        }
                                        setModalSelectedByCategoria((prev) => {
                                          const next = { ...prev };
                                          const mapForCat = { ...(next[cat.id] || {}) };
                                          const newQty = (currentQty || 0) + 1;
                                          mapForCat[it.complemento_id] = newQty;
                                          next[cat.id] = mapForCat;
                                          return next;
                                        });
                                      }}
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                      </svg>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
                </div>
              )}
            </div>
          </div>
        </form>
      </BaseModal>,
      document.body
      )}
      </main>
    </>
  );
};

export default PanelItens;

 