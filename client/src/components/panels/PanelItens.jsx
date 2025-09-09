import React from 'react';
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

const PanelItens = ({ estabelecimentoId, onOpenDetails, mobileHidden = false, onAddItem, onSave, selectedCounts = {}, totalSelectedCount = 0 }) => {
  const navigate = useNavigate();
  const [categorias, setCategorias] = React.useState([]);
  const [loadingCats, setLoadingCats] = React.useState(true);
  const [errorCats, setErrorCats] = React.useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState(null);

  const [produtos, setProdutos] = React.useState([]);
  const [loadingProdutos, setLoadingProdutos] = React.useState(true);
  const [erroProdutos, setErroProdutos] = React.useState(null);
  const [confirmUnsavedOpen, setConfirmUnsavedOpen] = React.useState(false);
  const [savingAndExit, setSavingAndExit] = React.useState(false);
  const [pendingNavAction, setPendingNavAction] = React.useState(null); // 'home' | 'back'

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

  React.useEffect(() => {
    let isMounted = true;
    async function fetchCategorias() {
      try {
        setLoadingCats(true);
        setErrorCats(null);
        const id = resolveEstabelecimentoId();
        if (id === null) {
          if (isMounted) {
            setErrorCats('Estabelecimento não definido');
            setLoadingCats(false);
          }
          return;
        }
        const resp = await api.get(`/categorias/${id}`);
        if (!isMounted) return;
        if (resp.success) {
          const list = Array.isArray(resp.data) ? resp.data : [];
          const active = list.filter((c) => c && (c.status === true || c.status === 1));
          setCategorias(active);
          if ((!selectedCategoryId || !active.some((c) => Number(c.id) === Number(selectedCategoryId))) && active.length) {
            setSelectedCategoryId(active[0].id);
          }
        } else {
          setErrorCats('Erro ao carregar categorias');
        }
      } catch {
        if (!isMounted) return;
        setErrorCats('Erro ao carregar categorias');
      } finally {
        if (isMounted) setLoadingCats(false);
      }
    }
    fetchCategorias();
    return () => { isMounted = false; };
  }, [resolveEstabelecimentoId, selectedCategoryId]);

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
              const r = await api.get(`/itens-complementos/categoria/${cat.id}`);
              const itens = r?.data || (r?.success ? r.data : []);
              return { categoriaId: cat.id, itens: Array.isArray(itens) ? itens : [] };
            } catch {
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
  return (
    <main className={`${mobileHidden ? 'hidden md:flex' : 'flex md:flex'} fixed top-4 bottom-4 right-4 md:left-[calc(30%+7rem)] left-4 bg-white border border-gray-200 rounded-2xl shadow-2xl z-30 flex-col`}>
      {/* Header com barra de pesquisa no topo */}
      <div className="p-3 md:p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          {/* Mostrar Back apenas em telas pequenas */}
          <div className="md:hidden">
            <Back onClick={() => {
              if (totalSelectedCount > 0) {
                setPendingNavAction('home');
                setConfirmUnsavedOpen(true);
              } else {
                navigate('/home');
              }
            }} />
          </div>
          <SearchBar placeholder="Buscar produtos e categorias" />
        </div>
      </div>

      {/* Conteúdo do painel */}
      <div className="flex-1 overflow-y-auto p-2 md:p-3 scrollbar-hide">
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
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-2.5 animate-pulse">
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
                    if (!selectedCategoryId) return true;
                    return Number(p.categoria_id) === Number(selectedCategoryId);
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
                <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-2.5 transition-opacity duration-200">
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

      {/* Footer com botões Cancelar e Salvar alinhados à direita ocupando 30% */}
      <div className="border-t border-gray-200 p-2 md:p-3">
        <div className="flex items-center justify-end gap-2 w-full flex-nowrap">
          {/* Information apenas no mobile, ao lado do Cancel */}
          <div className="md:hidden order-2">
            <Information onClick={onOpenDetails} />
          </div>
          <div className="flex items-center justify-end gap-2 ml-auto order-3">
            <CancelButton onClick={() => {
              if (totalSelectedCount > 0) {
                setPendingNavAction('back');
                setConfirmUnsavedOpen(true);
              } else {
                navigate(-1);
              }
            }} className="w-auto min-w-[110px] px-3 py-2 text-xs md:text-sm rounded-md whitespace-nowrap" />
            <SaveButton onClick={onSave} className="w-auto min-w-[110px] px-3 py-2 text-xs md:text-sm rounded-md whitespace-nowrap">{totalSelectedCount > 0 ? `Salvar (${totalSelectedCount})` : 'Salvar'}</SaveButton>
          </div>
        </div>
      </div>
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
        onSave={(detail) => {
          if (modalProduto) {
            // Monta a lista de complementos selecionados com nome e valor
            let selectedComplements = [];
            try {
              const categorias = detail?.categorias || [];
              for (const cat of categorias) {
                const itens = modalItensComplementosByCategoria[cat.id] || [];
                const selecionados = Array.isArray(cat.selecionados) ? cat.selecionados : [];
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
            } catch {
              /* ignore */
            }
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
          className="modal-form space-y-3"
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
            // Dispara evento de sucesso esperado pelo BaseModal
            window.dispatchEvent(
              new CustomEvent('modalSaveSuccess', {
                detail: {
                  produtoId: modalProduto?.id,
                  categorias: modalCategoriasComplementos?.map((c) => ({
                    id: c.id,
                    nome: c.nome,
                    obrigatorio: !!c.preenchimento_obrigatorio,
                    quantidade_minima: c.quantidade_minima,
                    quantidade_maxima: c.quantidade_maxima,
                    selecionados: Object.entries(modalSelectedByCategoria[c.id] || {})
                      .filter(([, qty]) => Number(qty) > 0)
                      .map(([compId]) => Number(compId))
                  })) || []
                }
              })
            );
          }}
        >
          {/* Título Complementos */}
          <div className="pt-1 text-sm font-semibold text-gray-800">Complementos</div>

          {/* Conteúdo das categorias e seus complementos */}
          {(!modalCategoriasComplementos || modalCategoriasComplementos.length === 0) ? (
            <div className="text-sm text-slate-500">Nenhuma categoria de complementos disponível.</div>
          ) : modalLoadingItens ? (
            <div className="text-sm text-slate-500">Carregando complementos...</div>
          ) : modalError ? (
            <div className="text-sm text-red-500">{modalError}</div>
          ) : (
            <div className="space-y-3">
              {modalCategoriasComplementos.map((cat) => {
                const itens = modalItensComplementosByCategoria[cat.id] || [];
                return (
                  <div key={cat.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-gray-800">{cat.nome}</div>
                        {cat.preenchimento_obrigatorio ? (
                          <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700 border border-gray-200">Obrigatório</span>
                        ) : null}
                      </div>
                      <div className="text-xs text-gray-500">
                        {(() => {
                          const max = cat.quantidade_maxima == null ? Infinity : Number(cat.quantidade_maxima);
                          const hints = [];
                          if (Number.isFinite(max)) {
                            hints.push(`Selecione até ${max} ${max === 1 ? 'item' : 'itens'}`);
                          }
                          return hints.join(' • ');
                        })()}
                      </div>
                    </div>
                    {modalCategoryErrors[cat.id] ? (
                      <div className="mt-1 text-xs text-red-500">{modalCategoryErrors[cat.id]}</div>
                    ) : null}
                    {(!itens || itens.length === 0) ? (
                      <div className="text-xs text-slate-500 mt-1">Nenhum complemento nesta categoria.</div>
                    ) : (
                      <div className="mt-2 grid grid-cols-1 gap-2">
                        {itens.map((it) => {
                          const qtyMap = modalSelectedByCategoria[cat.id] || {};
                          const currentQty = Number(qtyMap[it.complemento_id] || 0);
                          const max = cat.quantidade_maxima == null ? Infinity : Number(cat.quantidade_maxima);
                          const isSingleChoice = Number.isFinite(max) && Number(max) === 1;
                          const totalSelected = Object.values(qtyMap).reduce((s, q) => s + (Number(q) || 0), 0);
                          const canIncrement = totalSelected < max;
                          const formatMoney = (v) => (v || v === 0) ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v) : 'R$\u00A00,00';
                          return (
                            <div key={it.id} className="flex items-center justify-between rounded-md border border-gray-100 px-2 py-1.5">
                              <div className="min-w-0 pr-2">
                                <div className="flex items-center gap-2">
                                  <div className="text-sm text-gray-800 truncate">{it.complemento_nome}</div>
                                </div>
                                <div className="text-xs text-blue-600 font-medium mt-0.5">{formatMoney(it.complemento_valor)}</div>
                              </div>
                              <div className="flex items-center justify-end gap-2 min-w-[86px]">
                                {isSingleChoice ? (
                                  <input
                                    type="checkbox"
                                    className="h-5 w-5 appearance-none rounded-full border-2 border-blue-500 checked:bg-blue-600 checked:border-blue-600 cursor-pointer"
                                    checked={currentQty > 0}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      setModalSelectedByCategoria((prev) => {
                                        const next = { ...prev };
                                        const mapForCat = { ...(next[cat.id] || {}) };
                                        if (checked) {
                                          Object.keys(mapForCat).forEach((k) => delete mapForCat[k]);
                                          mapForCat[it.complemento_id] = 1;
                                        } else {
                                          delete mapForCat[it.complemento_id];
                                        }
                                        next[cat.id] = mapForCat;
                                        return next;
                                      });
                                    }}
                                  />
                                ) : (
                                  <div className="inline-flex items-center gap-2">
                                    {currentQty > 0 ? (
                                      <button
                                        type="button"
                                        className="h-7 w-7 inline-flex items-center justify-center rounded-md border border-gray-400 bg-gray-400 text-white"
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
                                      >−</button>
                                    ) : null}
                                    {currentQty > 0 ? (
                                      <span className="min-w-[16px] text-center text-sm">{currentQty}</span>
                                    ) : null}
                                    <button
                                      type="button"
                                      disabled={!canIncrement}
                                      className={`h-7 w-7 inline-flex items-center justify-center rounded-md border ${canIncrement ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-gray-200 text-gray-300'}`}
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
                                    >+</button>
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
        </form>
      </BaseModal>
    </main>
  );
};

export default PanelItens;

 