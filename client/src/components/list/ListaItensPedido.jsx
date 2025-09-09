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

  // Gera uma assinatura única para o conjunto de complementos (id e quantidade)
  const buildComplementSignature = (complements) => {
    const list = Array.isArray(complements) ? complements : [];
    const normalized = list
      .map((c) => ({
        id: Number(c.id ?? c.complemento_id),
        qty: Number(c.qty) > 0 ? Number(c.qty) : 1
      }))
      .filter((c) => c.id)
      .sort((a, b) => a.id - b.id)
      .map((c) => `${c.id}x${c.qty}`);
    return normalized.length ? normalized.join(',') : 'none';
  };

  // Agrupa por produto + assinatura de complementos
  const combined = React.useMemo(() => {
    const groups = new Map();

    const addToGroup = (sourceItem, isPending) => {
      const id = sourceItem.id;
      const name = sourceItem.name;
      const unitPrice = Number(sourceItem.unitPrice) || 0;
      const complements = Array.isArray(sourceItem.complements) ? sourceItem.complements : [];
      const qty = Number(sourceItem.qty) || 0;
      const signature = buildComplementSignature(complements);
      const key = `${id}|${signature}`;

      if (!groups.has(key)) {
        groups.set(key, {
          id,
          name,
          unitPrice,
          signature,
          savedQty: 0,
          pendingQty: 0,
          complements: []
        });
      }
      const group = groups.get(key);
      if (isPending) group.pendingQty += qty; else group.savedQty += qty;

      // Agregar complementos por id (somando quantidades)
      const byId = new Map(group.complements.map((c) => [Number(c.id), { ...c }]));
      for (const c of complements) {
        const cid = Number(c.id ?? c.complemento_id);
        const cqty = Number(c.qty) > 0 ? Number(c.qty) : 1;
        const cname = c.name ?? c.complemento_nome;
        const cprice = Number(c.unitPrice ?? c.complemento_valor) || 0;
        if (!cid) continue;
        if (!byId.has(cid)) byId.set(cid, { id: cid, name: String(cname || ''), unitPrice: cprice, qty: cqty });
        else {
          const cur = byId.get(cid);
          byId.set(cid, { ...cur, qty: (Number(cur.qty) || 0) + cqty });
        }
      }
      group.complements = Array.from(byId.values());
    };

    for (const it of items) {
      addToGroup(it, false);
    }
    for (const it of pendingItems) {
      addToGroup(it, true);
    }

    return Array.from(groups.values());
  }, [items, pendingItems]);

  return (
    <div className="h-1/2 min-h-[260px] bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">Itens do pedido</h3>
        <div className="text-xs text-slate-500">{combined.length} itens</div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ scrollBehavior: 'smooth' }}>
        <ul className="divide-y divide-slate-100">
          {combined.map((item) => {
            const savedQty = Number(item.savedQty || 0);
            const pendingQty = Number(item.pendingQty || 0);
            const hasPending = pendingQty > 0;
            const showPendingBadge = hasPending && savedQty > 0;
            const displayQty = savedQty + pendingQty;
            const handleDelete = () => {
              if (hasPending) onPendingDecrementOrDelete?.(item.id, item.signature);
              else handleDecrementOrDelete(item.id, item.signature);
            };
            return (
              <li key={`${item.id}|${item.signature}`} className="px-4 py-3 flex items-start gap-3 hover:bg-slate-50">
                <div className="relative mt-0.5">
                  <span className="inline-flex items-center justify-center h-7 min-w-7 px-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                    {displayQty}x
                  </span>
                  {showPendingBadge && (
                    <span className="absolute -top-2 -right-2 inline-flex items-center justify-center h-5 min-w-[18px] px-1.5 rounded-full text-orange-400 text-[10px] font-bold">
                      +{pendingQty}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">
                    {item.name}
                    {item.signature !== 'none' && item.complements.length > 0 ? (
                      <span className="text-[11px] font-normal text-slate-600"> {` + ${item.complements.map(c => c.name).join(' + ')}`}</span>
                    ) : null}
                  </div>
                  <div className="text-[11px] text-slate-500">Valor total {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((Number(displayQty) || 0) * (Number(item.unitPrice) || 0))}</div>
                  {Array.isArray(item.complements) && item.complements.length > 0 ? (
                    <ul className="mt-1 space-y-1">
                      {item.complements.map((c) => (
                        <li key={c.id} className="flex items-center justify-between text-[11px] text-slate-600">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                              {Number(c.qty) || 0}x
                            </span>
                            <span className="truncate max-w-[160px]">{c.name}</span>
                          </div>
                          <span className="text-slate-700 font-medium">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((Number(c.qty) || 0) * (Number(c.unitPrice) || 0))}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                <button
                  onClick={handleDelete}
                  className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors self-start mt-0.5"
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


