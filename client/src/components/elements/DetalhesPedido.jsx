import React from 'react';
import { Calendar, User, CreditCard, Info, Printer, X } from 'lucide-react';
import BaseModal from '../modals/Base';
import CloseButton from '../buttons/Close';
import { imprimirNotaFiscal } from '../../services/notaFiscalPrint';

const DetalhesPedido = ({ pedido, itens, onClose, isOpen }) => {
  if (!isOpen || !pedido) return null;

  const formatCurrency = (value) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));

  const formatDateOnly = (date) => {
    if (!date) return '-';
    try {
      return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(date));
    } catch {
      return date;
    }
  };

  const handlePrint = () => {
    imprimirNotaFiscal(pedido, itens);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalhes da Venda"
      subtitle={`Pedido #${pedido.codigo || pedido.id}`}
      icon={Info}
      iconBgColor="bg-gray-100"
      iconColor="text-gray-600"
      showButtons={false}
      printButton={
        <button
          onClick={handlePrint}
          className="w-10 h-10 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
          title="Imprimir"
        >
          <Printer size={18} />
        </button>
      }
    >
      <div className="space-y-6">
        {/* Cabeçalho Principal */}
        <div className="border-b border-gray-200 pb-6">
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">Data</label>
              <p className="text-gray-900 text-sm font-medium whitespace-nowrap">{formatDateOnly(pedido.criado_em)}</p>
            </div>
            <div className="text-center">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">Cliente</label>
              <div className="flex items-center justify-center gap-1">
                <User className="w-3 h-3 text-gray-500 flex-shrink-0" />
                <p className="text-gray-700 text-sm font-light whitespace-nowrap truncate">{pedido.cliente_nome_real || pedido.cliente_nome || 'Não informado'}</p>
              </div>
            </div>
            <div className="text-center">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">Valor Total</label>
              <p className="text-gray-900 text-sm font-bold whitespace-nowrap">{formatCurrency(pedido.valor_total)}</p>
            </div>
            <div className="text-center">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">Vendido por</label>
              <div className="flex items-center justify-center gap-1">
                <User className="w-3 h-3 text-gray-500 flex-shrink-0" />
                <p className="text-gray-700 text-sm font-light whitespace-nowrap truncate">{pedido.vendido_por || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Resumo do Produto */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">RESUMO DO PRODUTO</h3>
          <div className="border border-gray-300">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-300">
              <div className="grid grid-cols-10 gap-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                <div className="col-span-1">Qtd</div>
                <div className="col-span-7">Nome do Item</div>
                <div className="col-span-2 text-right">Valor Total</div>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {itens && itens.length > 0 ? (
                itens.map((item) => (
                  <div key={item.id} className="px-4 py-4">
                    <div className="grid grid-cols-10 gap-4 text-sm">
                      <div className="col-span-1 font-medium text-gray-900">{item.quantidade}</div>
                      <div className="col-span-7 text-gray-900">
                        {item.produto_nome}
                        {item.produto_descricao && (
                          <div className="text-xs text-gray-600 mt-1">{item.produto_descricao}</div>
                        )}
                        {/* Complementos */}
                        {item.complementos && item.complementos.length > 0 && (
                          <div className="mt-2 pl-4 border-l-2 border-gray-200">
                            {item.complementos.map((complemento) => (
                              <div key={complemento.id} className="text-xs text-gray-700">
                                {complemento.quantidade}x {complemento.nome_complemento} - {formatCurrency(complemento.valor_total)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="col-span-2 text-right font-medium text-gray-900">
                        {formatCurrency(item.valor_total)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-gray-500">
                  Nenhum item encontrado para este pedido
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resumo de Valores */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">RESUMO DE VALORES</h3>
          <div className="bg-gray-50 p-4 border border-gray-300">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">Subtotal</span>
                <span className="text-gray-900 font-medium">{formatCurrency(pedido.valor_total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">Desconto</span>
                <span className="text-gray-900 font-medium">- {formatCurrency(0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">Acréscimos</span>
                <span className="text-gray-900 font-medium">{formatCurrency(0)}</span>
              </div>
              <hr className="border-gray-300" />
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-800">TOTAL</span>
                <span className="text-gray-900">{formatCurrency(pedido.valor_total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Forma de Pagamento */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">FORMA DE PAGAMENTO</h3>
          <div className="bg-gray-50 p-4 border border-gray-300">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 font-medium">{pedido.forma_pagamento || 'Não informado'}</span>
              <span className="text-gray-900 font-medium">{formatCurrency(pedido.valor_total)}</span>
            </div>
          </div>
        </div>

      </div>
    </BaseModal>
  );
};

export default DetalhesPedido;
