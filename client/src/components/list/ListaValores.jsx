import React from 'react';

function formatCurrencyBRL(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
}

// Props:
// subtotal: number
// acrescimo?: number
// desconto?: number
// pago?: number
// valorPago?: number - valor pago salvo no banco
// valorRestante?: number - valor restante salvo no banco
// showAcrescimo?: boolean
// showDesconto?: boolean
// mostrarPago?: boolean (derivado de pago > 0)
// mostrarRestante?: boolean (derivado de pago > 0 e restante > 0)
// showOnlyTotal?: boolean - se true, mostra apenas o total final
// showDivisaoConta?: boolean - se true, mostra seção de divisão de conta
// numberOfPeople?: number - número de pessoas para divisão
// onNumberOfPeopleChange?: function - callback para mudança do número de pessoas
// showSubtotal?: boolean - se true, mostra subtotal (padrão: true)
// showTroco?: boolean - se true, mostra troco (padrão: true)
// mode?: 'details' | 'payments' - modo de exibição (padrão: 'details')
const ListaValores = ({ 
  subtotal = 0, 
  acrescimo = 0, 
  desconto = 0, 
  pago = 0, 
  valorPago = 0,
  valorRestante = 0,
  showAcrescimo = false, 
  showDesconto = false, 
  showOnlyTotal = false,
  showDivisaoConta = false,
  numberOfPeople = 1,
  onNumberOfPeopleChange,
  showSubtotal = true,
  showTroco = true,
  mode = 'details'
}) => {
  const temAcrescimo = showAcrescimo && Number(acrescimo) > 0;
  const temDesconto = showDesconto && Number(desconto) > 0;
  const total = Math.max(0, Number(subtotal) + Number(acrescimo) - Number(desconto));
  
  // Usar valores do banco se disponíveis, senão usar valores calculados
  const valorPagoFinal = Number(valorPago) > 0 ? Number(valorPago) : Number(pago);
  const valorRestanteFinal = Number(valorRestante) >= 0 ? Number(valorRestante) : Math.max(0, total - valorPagoFinal);
  
  const temPagamento = valorPagoFinal > 0;
  const mostrarRestante = valorRestanteFinal > 0;
  const troco = valorPagoFinal > total ? valorPagoFinal - total : 0;
  const mostrarTroco = troco > 0;
  
  // No modo 'details', o valor pago deve ser apenas o valor efetivamente pago do pedido (sem troco)
  // No modo 'payments', o valor pago é o valor físico pago pelo cliente (incluindo troco)
  const valorPagoExibido = mode === 'details' ? Math.min(valorPagoFinal, total) : valorPagoFinal;

  const topRows = [];
  
  if (showOnlyTotal) {
    // Modo finalização: mostrar apenas o total
    topRows.push({ label: 'Total', value: total, strong: true });
  } else if (mode === 'payments') {
    // Modo pagamentos: mostrar apenas total
    topRows.push({ label: 'Total', value: total, strong: true });
  } else {
    // Modo detalhes: mostrar subtotal, acréscimo, desconto e total
    if (showSubtotal) {
      topRows.push({ label: 'Subtotal', value: subtotal });
    }
    
    // Adicionar acréscimo se existir e estiver no modo detalhes
    if (mode === 'details' && temAcrescimo) {
      topRows.push({ label: 'Acréscimo', value: acrescimo });
    }
    
    // Adicionar desconto se existir e estiver no modo detalhes
    if (mode === 'details' && temDesconto) {
      topRows.push({ label: 'Desconto', value: desconto });
    }
    
    // Total sempre por último
    topRows.push({ label: 'Total', value: total, strong: true });
  }
  
  const detailRows = [];
  if (temPagamento) detailRows.push({ label: 'Pago', value: valorPagoExibido });
  // Restante só aparece quando há pagamento (valorPagoFinal > 0) e ainda há valor restante
  if (temPagamento && mostrarRestante) detailRows.push({ label: 'Restante', value: valorRestanteFinal });
  // Troco só aparece no modo pagamentos
  if (mode === 'payments' && mostrarTroco && showTroco) {
    detailRows.push({ label: 'Troco', value: troco, strong: true, color: 'text-green-600' });
  }

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
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
          <ul className="mt-1">
            {detailRows.map((r, idx) => (
              <li key={`detail-${idx}`} className="px-4 py-1 flex items-center justify-between">
                <span className={`text-sm ${r.strong ? 'font-semibold' : ''} ${r.color || 'text-slate-600'}`}>{r.label}</span>
                <span className={`text-sm ${r.strong ? 'font-semibold' : ''} ${r.color || 'text-slate-700'}`}>{formatCurrencyBRL(r.value)}</span>
              </li>
            ))}
          </ul>
        )}
        
        {/* Seção de Divisão de Conta */}
        {showDivisaoConta && (
          <>
            <div className="border-t border-slate-200 my-3"></div>
            <div className="px-4 py-3 space-y-3">
              <h4 className="text-sm font-semibold text-slate-800">Dividir Conta</h4>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <label className="text-sm text-slate-600 whitespace-nowrap">Quantas pessoas:</label>
                  <input
                    type="number"
                    min="1"
                    value={numberOfPeople > 1 ? numberOfPeople : ''}
                    placeholder="1"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '') {
                        onNumberOfPeopleChange?.(1);
                      } else {
                        const num = parseInt(value, 10);
                        if (!isNaN(num) && num > 0) {
                          onNumberOfPeopleChange?.(num);
                        }
                      }
                    }}
                    onFocus={(e) => {
                      e.target.select();
                    }}
                    onClick={(e) => {
                      e.target.select();
                    }}
                    onKeyDown={(e) => {
                      // Permitir apenas números e teclas de controle
                      if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    className="w-12 px-2 py-1 text-center border border-slate-300 rounded focus:ring-0 focus:border-blue-500 focus:outline-none font-normal text-gray-700 bg-white hover:bg-slate-50 transition-colors text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    style={{ textAlign: 'center' }}
                  />
                </div>
                {numberOfPeople > 1 && (
                  <div className="text-right">
                    <div className="text-sm text-slate-500">Valor por pessoa</div>
                    <div className="text-lg font-semibold text-blue-600">
                      {formatCurrencyBRL(total / numberOfPeople)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ListaValores;


