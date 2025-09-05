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
          setCategorias(list);
          if (!selectedCategoryId && list.length) {
            setSelectedCategoryId(list[0].id);
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
          setProdutos(Array.isArray(list) ? list : []);
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
  return (
    <main className={`${mobileHidden ? 'hidden md:flex' : 'flex md:flex'} fixed top-4 bottom-20 md:bottom-4 right-4 md:left-[calc(30%+7rem)] left-4 bg-white border border-gray-200 rounded-2xl shadow-2xl z-30 flex-col`}>
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
                    <button onClick={() => onAddItem?.(produto)} key={produto.id} className="relative text-left bg-white border border-gray-200 rounded-xl p-1.5 md:p-2 shadow-sm hover:shadow transition-transform duration-150 hover:-translate-y-0.5">
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
    </main>
  );
};

export default PanelItens;

 