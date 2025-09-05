import React from 'react';
import { Trash2 } from 'lucide-react';

const ListaItensPedido = ({ items, onItemsChange, pendingItems = [], onPendingDecrementOrDelete }) => {
  const handleDecrementOrDelete = (id) => {
    if (!onItemsChange) return;
    onItemsChange((prev) => {
      const next = prev.map((it) => ({ ...it }));
      const idx = next.findIndex((it) => it.id === id);
      if (idx === -1) return prev;
      next[idx].qty = Math.max(0, (Number(next[idx].qty) || 0) - 1);
      if (next[idx].qty === 0) next.splice(idx, 1);
      return next;
    });
  };

  const pendingMap = React.useMemo(() => {
    const map = new Map();
    for (const it of pendingItems) {
      map.set(it.id, { qty: Number(it.qty) || 0, name: it.name, unitPrice: Number(it.unitPrice) || 0 });
    }
    return map;
  }, [pendingItems]);

  const combined = React.useMemo(() => {
    const map = new Map();
    for (const it of items) {
      map.set(it.id, { id: it.id, qty: Number(it.qty) || 0, name: it.name, unitPrice: Number(it.unitPrice) || 0, isPendingOnly: false });
    }
    for (const it of pendingItems) {
      if (!map.has(it.id)) {
        map.set(it.id, { id: it.id, qty: 0, name: it.name, unitPrice: Number(it.unitPrice) || 0, isPendingOnly: true });
      }
    }
    return Array.from(map.values());
  }, [items, pendingItems]);

  return (
    <div className="h-1/2 min-h-[260px] bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Itens do pedido</h3>
        <div className="text-xs text-slate-500">{items.length} itens</div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <ul className="divide-y divide-slate-100">
          {combined.map((item) => {
            const pending = pendingMap.get(item.id);
            const hasPending = pending && pending.qty > 0;
            const showPendingBadge = hasPending && !item.isPendingOnly; // só mostra +N se já existe salvo
            const displayQty = Number(item.qty || 0) + (hasPending ? Number(pending.qty || 0) : 0);
            const handleDelete = () => {
              if (hasPending) onPendingDecrementOrDelete?.(item.id);
              else handleDecrementOrDelete(item.id);
            };
            return (
              <li key={item.id} className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50">
                <div className="relative">
                  <span className="inline-flex items-center justify-center h-7 min-w-7 px-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                    {displayQty}x
                  </span>
                  {showPendingBadge && (
                    <span className="absolute -top-2 -right-2 inline-flex items-center justify-center h-5 min-w-[18px] px-1.5 rounded-full text-orange-400 text-[10px] font-bold">
                      +{pending.qty}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">{item.name}</div>
                  <div className="text-[11px] text-slate-500">Valor total {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(item.qty) * Number(item.unitPrice || 0))}</div>
                </div>
                <button
                  onClick={handleDelete}
                  className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Remover item"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default ListaItensPedido;


