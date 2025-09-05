import React from 'react';

function formatCurrencyBRL(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
}

// Props:
// subtotal: number
// acrescimo?: number
// desconto?: number
// pago?: number
// mostrarPago?: boolean (derivado de pago > 0)
// mostrarRestante?: boolean (derivado de pago > 0 e restante > 0)
const ListaValores = ({ subtotal = 0, acrescimo = 0, desconto = 0, pago = 0 }) => {
  const temAcrescimo = Number(acrescimo) > 0;
  const temDesconto = Number(desconto) > 0;
  const total = Math.max(0, Number(subtotal) + Number(acrescimo) - Number(desconto));
  const temPagamento = Number(pago) > 0;
  const restante = Math.max(0, total - Number(pago));
  const mostrarRestante = temPagamento && restante > 0;

  const topRows = [
    { label: 'Subtotal', value: subtotal },
    { label: 'Total', value: total, strong: true }
  ];
  const detailRows = [];
  if (temAcrescimo) detailRows.push({ label: 'Acréscimo', value: acrescimo });
  if (temDesconto) detailRows.push({ label: 'Desconto', value: desconto });
  if (temPagamento) detailRows.push({ label: 'Pago', value: pago });
  if (mostrarRestante) detailRows.push({ label: 'Restante', value: restante });

  return (
    <div className="h-[15%] min-h-[140px] bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden mb-3 md:mb-4">
      <div className="px-4 py-3 border-b border-slate-200">
        <h3 className="text-sm font-semibold text-slate-800">Valores</h3>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <ul>
          {topRows.map((r, idx) => (
            <li key={`top-${idx}`} className="px-4 py-1 flex items-center justify-between">
              <span className={`text-sm ${r.strong ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>{r.label}</span>
              <span className={`text-sm ${r.strong ? 'font-semibold text-slate-800' : 'text-slate-700'}`}>{formatCurrencyBRL(r.value)}</span>
            </li>
          ))}
        </ul>
        {detailRows.length > 0 && (
          <ul className="divide-y divide-slate-100 mt-1">
            {detailRows.map((r, idx) => (
              <li key={`detail-${idx}`} className="px-4 py-2 flex items-center justify-between">
                <span className="text-sm text-slate-600">{r.label}</span>
                <span className="text-sm text-slate-700">{formatCurrencyBRL(r.value)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ListaValores;


