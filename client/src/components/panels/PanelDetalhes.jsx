import React from 'react';
import Back from '../buttons/Back';
import { Pencil, Trash2 } from 'lucide-react';
import ListaItensPedido from '../list/ListaItensPedido';
import api from '../../services/api';
import ListaValores from '../list/ListaValores';
import Surcharge from '../buttons/Surcharge';
import Discount from '../buttons/Discount';
import PrintButton from '../buttons/Print';
import KitchenButton from '../buttons/Kitchen';
import DeleteButton from '../buttons/Delete';
import ConfirmDelete from '../elements/ConfirmDelete';
import ConfirmDialog from '../elements/ConfirmDialog';

function formatIdentificacao(raw) {
  const str = String(raw || '').toLowerCase();
  if (str.startsWith('mesa-')) {
    const n = String(parseInt(str.replace('mesa-', ''), 10) || '').padStart(2, '0');
    return `Mesa ${n}`;
  }
  if (str.startsWith('comanda-')) {
    const n = String(parseInt(str.replace('comanda-', ''), 10) || '').padStart(2, '0');
    return `Comanda ${n}`;
  }
  // Fallback: capitalizar primeira letra apenas
  const [word, num] = String(raw || '').split(/\s*(\d+)\s*/).filter(Boolean);
  const wordFmt = word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : '';
  return `${wordFmt}${num ? ` ${String(num).padStart(2, '0')}` : ''}`.trim();
}

const PanelDetalhes = ({ identificacao, onBack, orderName, onOrderNameChange, mobileVisible = false, items, displayItems, pendingItems = [], onItemsChange, onPendingDecrementOrDelete, onSave, isSmallScreen = false }) => {
  const label = formatIdentificacao(identificacao);
  const [loadingRemote, setLoadingRemote] = React.useState(false);
  const [remoteError, setRemoteError] = React.useState(null);
  const [hasUserEditedName, setHasUserEditedName] = React.useState(false);

  const handleOrderNameChange = (e) => {
    setHasUserEditedName(true);
    onOrderNameChange?.(e.target.value);
  };
  React.useEffect(() => {
    let isMounted = true;
    async function fetchPedido() {
      try {
        setLoadingRemote(true);
        setRemoteError(null);
        // Resolver estabelecimentoId (não é o identificador/mesa)
        let estId = null;
        const fromStorage = localStorage.getItem('estabelecimentoId');
        const parsedStorage = parseInt(fromStorage, 10);
        if (!Number.isNaN(parsedStorage)) estId = parsedStorage;
        if (estId === null) {
          try {
            const usuarioRaw = localStorage.getItem('usuario');
            if (usuarioRaw) {
              const usuario = JSON.parse(usuarioRaw);
              const cand = parseInt(usuario?.estabelecimento_id, 10);
              if (!Number.isNaN(cand)) estId = cand;
            }
          } catch {}
        }
        if (estId === null) return;
        const ident = String(identificacao || '').toLowerCase();
        const res = await api.get(`/pedidos/${estId}/${encodeURIComponent(ident)}`);
        if (!isMounted) return;
        if (res.success && res.data) {
          if (res.data.pedido) {
            const exib = Array.isArray(res.data.itens_exibicao) ? res.data.itens_exibicao : null;
            if (exib) {
              const itensMapped = exib.map((e) => ({
                id: e.produto_id,
                qty: Number(e.quantidade) || 0,
                name: e.produto_nome || `Produto ${e.produto_id}`,
                unitPrice: Number(e.valor_unitario) || 0,
                complements: Array.isArray(e.complementos)
                  ? e.complementos.map((c) => ({
                      id: Number(c.complemento_id),
                      name: String(c.nome_complemento || ''),
                      unitPrice: Number(c.valor_unitario) || 0,
                      qty: Number(c.quantidade) || 0
                    }))
                  : []
              }));
              onItemsChange?.(itensMapped);
            } else {
              const itensBase = Array.isArray(res.data.itens) ? res.data.itens : [];
              const itensMapped = itensBase.map((r) => ({
                id: r.produto_id,
                qty: r.quantidade,
                name: r.produto_nome || `Produto ${r.produto_id}`,
                unitPrice: Number(r.valor_unitario) || 0,
                complements: []
              }));
              onItemsChange?.(itensMapped);
            }
          }
          // Só preencher o nome se ainda não houver edição local
          if (!hasUserEditedName && res.data.nome_ponto !== undefined && res.data.nome_ponto !== null) {
            onOrderNameChange?.(res.data.nome_ponto);
          }
        }
      } catch (e) {
        if (!isMounted) return;
        setRemoteError('Erro ao carregar itens salvos');
      } finally {
        if (isMounted) setLoadingRemote(false);
      }
    }
    fetchPedido();
    return () => { isMounted = false; };
  }, [identificacao, onItemsChange, onOrderNameChange, hasUserEditedName]);
  const safeItems = Array.isArray(displayItems) ? displayItems : (Array.isArray(items) ? items : []);
  const itemsTotal = safeItems.reduce((acc, it) => acc + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0), 0)
    + (Array.isArray(pendingItems) ? pendingItems.reduce((acc, it) => acc + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0), 0) : 0);
  const complementsTotal = safeItems.reduce((acc, it) => acc + (Array.isArray(it.complements) ? it.complements.reduce((s, c) => s + (Number(c.qty) || 0) * (Number(c.unitPrice) || 0), 0) : 0), 0)
    + (Array.isArray(pendingItems) ? pendingItems.reduce((acc, it) => acc + (Array.isArray(it.complements) ? it.complements.reduce((s, c) => s + (Number(c.qty) || 0) * (Number(c.unitPrice) || 0), 0) : 0), 0) : 0);
  const subtotal = itemsTotal + complementsTotal;
  const acrescimo = 0;
  const desconto = 0;
  const pago = 0;
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [confirmUnsavedOpen, setConfirmUnsavedOpen] = React.useState(false);
  const [savingAndExit, setSavingAndExit] = React.useState(false);
  const totalPendingQty = Array.isArray(pendingItems) ? pendingItems.reduce((acc, it) => acc + (Number(it.qty) || 0), 0) : 0;

  return (
    <aside className={`${mobileVisible ? 'flex md:flex' : 'hidden md:flex'} fixed top-4 bottom-20 md:bottom-4 left-4 md:left-24 w-[calc(100%-2rem)] md:w-[30%] bg-white border border-gray-200 rounded-2xl shadow-2xl z-40 flex-col`}>
      {/* Header */}
      <div className="p-3 md:p-4 border-b border-gray-200 flex items-center gap-3">
        <div className="shrink-0">
          <Back onClick={() => {
            // Em telas pequenas (mobile), sempre voltar sem alerta (vai para o painel de itens)
            if (isSmallScreen) {
              onBack?.();
              return;
            }
            if (totalPendingQty > 0) {
              setConfirmUnsavedOpen(true);
            } else {
              onBack?.();
            }
          }} />
        </div>
        <div className="flex-1 min-w-0 text-center">
          <div className="text-base md:text-lg font-semibold text-gray-800 truncate whitespace-nowrap">{label}</div>
        </div>
        <div className="shrink-0">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Pencil size={16} />
            </span>
            <input
              type="text"
              value={orderName}
              onChange={handleOrderNameChange}
              placeholder="Nome do pedido"
              className="h-12 pl-9 pr-3 w-40 md:w-60 border border-gray-300 rounded-xl bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-3 md:p-4 overflow-y-auto rounded-b-2xl space-y-3 md:space-y-4 scrollbar-hide">
        <ListaItensPedido items={safeItems} onItemsChange={onItemsChange} pendingItems={pendingItems} onPendingDecrementOrDelete={onPendingDecrementOrDelete} />
        {loadingRemote && <div className="text-xs text-slate-500">Carregando itens salvos...</div>}
        {remoteError && <div className="text-xs text-red-500">{remoteError}</div>}
        <ListaValores subtotal={subtotal} acrescimo={acrescimo} desconto={desconto} pago={pago} />
      </div>

      {/* Footer */}
      <div className="p-3 md:p-4 border-t border-gray-200">
        <div className="flex items-center justify-between gap-2 md:gap-3 mb-2 md:mb-3">
          <Surcharge />
          <Discount />
          <PrintButton />
          <KitchenButton />
          <DeleteButton square onClick={() => setConfirmOpen(true)} />
        </div>
        <button
          type="button"
          className="w-full h-11 md:h-12 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold transition-colors"
        >
          Finalizar pedido
        </button>
      </div>
      <ConfirmDelete
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={async () => {
          try {
            setDeleting(true);
            // Resolver estabelecimento id
            let estId = null;
            const fromStorage = localStorage.getItem('estabelecimentoId');
            const parsedStorage = parseInt(fromStorage, 10);
            if (!Number.isNaN(parsedStorage)) estId = parsedStorage;
            if (estId === null) {
              try {
                const usuarioRaw = localStorage.getItem('usuario');
                if (usuarioRaw) {
                  const usuario = JSON.parse(usuarioRaw);
                  const cand = parseInt(usuario?.estabelecimento_id, 10);
                  if (!Number.isNaN(cand)) estId = cand;
                }
              } catch {}
            }
            const ident = String(identificacao || '').toLowerCase();
            await api.delete(`/pedidos/${estId}/${encodeURIComponent(ident)}`);
            // Redireciona para home
            window.location.assign('/home');
          } catch (e) {
            // noop
          } finally {
            setDeleting(false);
            setConfirmOpen(false);
          }
        }}
        title="Excluir pedido"
        message="Tem certeza que deseja excluir este pedido e todos os itens? Esta ação não pode ser desfeita."
        isLoading={deleting}
      />
      <ConfirmDialog
        isOpen={confirmUnsavedOpen}
        onClose={() => setConfirmUnsavedOpen(false)}
        onSecondary={() => {
          setConfirmUnsavedOpen(false);
          onBack?.();
        }}
        onPrimary={async () => {
          try {
            setSavingAndExit(true);
            await onSave?.();
          } finally {
            setSavingAndExit(false);
            setConfirmUnsavedOpen(false);
          }
        }}
        title="Itens não salvos"
        message={"Existem itens adicionados que não foram salvos. Deseja sair? Se sair agora, os itens não serão salvos."}
        primaryLabel="Salvar e sair"
        secondaryLabel="Sair"
        isLoading={savingAndExit}
      />
    </aside>
  );
};

export default PanelDetalhes;


