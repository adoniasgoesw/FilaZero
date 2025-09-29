import React from 'react';
import { Printer, Info, Calendar, User, DollarSign, Clock, Package, CreditCard } from 'lucide-react';
import BaseModal from '../modals/Base';
import { imprimirNotaFiscal } from '../../services/notaFiscalPrint';
import FormContainer from '../forms/FormContainer';
import FormField from '../forms/FormField';
import FormGrid from '../forms/FormGrid';

const DetalhesPedido = ({ pedido, itens, cliente, pagamentos, onClose, isOpen }) => {
  const formatCurrency = (value) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));

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


  // Listar itens individualmente (sem agrupamento incorreto)
  const itensListados = React.useMemo(() => {
    if (!itens || !Array.isArray(itens)) return [];
    
    // Cada item do banco é exibido individualmente
    return itens.map((item) => {
      const produtoId = item.produto_id;
      const nome = item.produto_nome;
      const unitPrice = Number(item.valor_unitario) || 0;
      const qty = Number(item.quantidade) || 0;
      const complementos = Array.isArray(item.complementos) ? item.complementos : [];
      
      // Processar complementos individualmente
      const complementosProcessados = complementos.map(complemento => ({
        id: Number(complemento.id ?? complemento.complemento_id),
        nome_complemento: complemento.nome_complemento ?? complemento.nome,
        valor_unitario: Number(complemento.valor_unitario ?? complemento.unitPrice) || 0,
        quantidade: Number(complemento.quantidade ?? complemento.qty) || 1,
        valor_total: (Number(complemento.quantidade ?? complemento.qty) || 1) * (Number(complemento.valor_unitario ?? complemento.unitPrice) || 0)
      }));

      return {
        id: item.id,
        produto_id: produtoId,
        produto_nome: nome,
        valor_unitario: unitPrice,
        quantidade: qty,
        complementos: complementosProcessados,
        // Calcular valor total incluindo complementos
        valor_total: (qty * unitPrice) + complementosProcessados.reduce((total, comp) => total + comp.valor_total, 0)
      };
    });
  }, [itens]);

  const formatDateOnly = (date) => {
    if (!date) return '-';
    try {
      return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(date));
    } catch {
      return date;
    }
  };

  const handlePrint = async () => {
    // Buscar dados do estabelecimento
    const estabelecimento = await buscarDadosEstabelecimento();
    
    imprimirNotaFiscal(pedido, itens, cliente, pagamentos, estabelecimento);
  };

  if (!isOpen || !pedido) return null;

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
      <FormContainer>
        <div className="space-y-6">
          {/* Cabeçalho Principal */}
          <FormField label="Informações do Pedido">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="grid grid-cols-2 xl:grid-cols-4 py-6">
                {/* Data */}
                <div className="flex flex-col items-start justify-between py-4 px-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-gray-600" />
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Data</span>
                  </div>
                  <span className="text-xs font-medium text-gray-800 mt-2">{formatDateOnly(pedido.criado_em)}</span>
                </div>

                {/* Cliente */}
                <div className="flex flex-col items-start justify-between py-4 px-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 text-gray-600" />
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cliente</span>
                  </div>
                  <span className="text-xs font-medium text-gray-800 mt-2 w-full">{cliente?.nome || pedido.cliente_nome || 'Não informado'}</span>
                </div>

                {/* Valor Total */}
                <div className="flex flex-col items-start justify-between py-4 px-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3 h-3 text-gray-600" />
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-800 mt-2">{formatCurrency(pedido.valor_total)}</span>
                </div>

                {/* Vendido por */}
                <div className="flex flex-col items-start justify-between py-4 px-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 text-gray-600" />
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Atendente</span>
                  </div>
                  <span className="text-xs font-medium text-gray-800 mt-2 w-full">{pedido.vendido_por || 'Sistema'}</span>
                </div>
              </div>
            </div>
          </FormField>

          {/* Resumo do Produto */}
          <FormField label="Resumo do Produto">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              {/* Header - só aparece em telas maiores */}
              <div className="hidden sm:block bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="grid grid-cols-10 gap-4 text-xs font-medium text-gray-600 uppercase tracking-wide">
                  <div className="col-span-1">Qtd</div>
                  <div className="col-span-7">Nome do Item</div>
                  <div className="col-span-2 text-right whitespace-nowrap">Valor Total</div>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {itensListados && itensListados.length > 0 ? (
                  itensListados.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="px-6 py-5">
                      {/* Layout responsivo */}
                      <div className="sm:hidden space-y-3">
                        {/* Mobile layout */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">{item.quantidade}</span>
                            </div>
                            <div className="font-medium text-gray-800">{item.produto_nome}</div>
                          </div>
                          <div className="text-right font-semibold text-gray-800">
                            {formatCurrency(item.valor_total)}
                          </div>
                        </div>
                        {/* Complementos mobile */}
                        {item.complementos && item.complementos.length > 0 && (
                          <div className="ml-10 space-y-1">
                            {item.complementos.map((complemento) => (
                              <div key={complemento.id} className="flex items-center gap-2 text-xs text-gray-600">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                  +{complemento.quantidade}x
                                </span>
                                <span>{complemento.nome_complemento}</span>
                                <span className="text-gray-600 font-medium">
                                  {formatCurrency(complemento.valor_total)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Desktop layout */}
                      <div className="hidden sm:grid grid-cols-10 gap-4 text-sm items-start">
                        <div className="col-span-1 font-medium text-gray-800 flex-shrink-0 flex items-center justify-center">
                          <div className="w-7 h-7 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">{item.quantidade}</span>
                          </div>
                        </div>
                        <div className="col-span-7 text-gray-800 min-w-0">
                          <div className="font-medium text-gray-800">{item.produto_nome}</div>
                          {/* Complementos */}
                          {item.complementos && item.complementos.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {item.complementos.map((complemento) => (
                                <div key={complemento.id} className="flex items-center gap-2 text-xs text-gray-600">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                    +{complemento.quantidade}x
                                  </span>
                                  <span>{complemento.nome_complemento}</span>
                                  <span className="text-gray-600 font-medium">
                                    {formatCurrency(complemento.valor_total)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="col-span-2 text-right font-semibold text-gray-800 whitespace-nowrap flex-shrink-0">
                          {formatCurrency(item.valor_total)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="w-8 h-8 text-gray-400" />
                      <span>Nenhum item encontrado para este pedido</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </FormField>

          {/* Resumo de Valores */}
          <FormField label="Resumo de Valores">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="space-y-3 p-6">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Subtotal</span>
                  <span className="text-sm font-semibold text-gray-800">{formatCurrency(pedido.valor_total)}</span>
                </div>
                {pedido.desconto && Number(pedido.desconto) > 0 && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Desconto</span>
                    <span className="text-sm font-semibold text-gray-600">- {formatCurrency(pedido.desconto)}</span>
                  </div>
                )}
                {pedido.acrescimos && Number(pedido.acrescimos) > 0 && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Acréscimos</span>
                    <span className="text-sm font-semibold text-gray-600">+ {formatCurrency(pedido.acrescimos)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-4 bg-gray-50 -mx-6 px-6 rounded-b-lg">
                  <span className="text-base font-semibold text-gray-800">TOTAL</span>
                  <span className="text-base font-semibold text-gray-800">
                    {formatCurrency(Number(pedido.valor_total) + Number(pedido.acrescimos || 0) - Number(pedido.desconto || 0))}
                  </span>
                </div>
              </div>
            </div>
          </FormField>

          {/* Forma de Pagamento */}
          <FormField label="Forma de Pagamento">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
              {pagamentos && pagamentos.length > 0 ? (
                <div className="space-y-3 p-6">
                  {pagamentos.map((pagamento, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-gray-200 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-800">
                          {pagamento.pagamento_nome || 'Pagamento não informado'}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-gray-800">
                        {formatCurrency(Math.min(pagamento.valor_pago, pedido.valor_total + Number(pedido.acrescimos || 0) - Number(pedido.desconto || 0)))}
                      </span>
                    </div>
                  ))}
                  {pagamentos.length > 1 && (
                    <div className="flex justify-between items-center py-4 bg-gray-50 -mx-6 px-6 rounded-b-lg">
                      <span className="text-base font-semibold text-gray-800">Total Pago</span>
                      <span className="text-base font-semibold text-gray-800">
                        {formatCurrency(pagamentos.reduce((total, p) => total + Math.min(Number(p.valor_pago || 0), pedido.valor_total + Number(pedido.acrescimos || 0) - Number(pedido.desconto || 0)), 0))}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="flex flex-col items-center gap-2">
                    <CreditCard className="w-8 h-8 text-gray-400" />
                    <span>Nenhuma forma de pagamento registrada</span>
                  </div>
                </div>
              )}
            </div>
          </FormField>
        </div>
      </FormContainer>
    </BaseModal>
  );
};

export default DetalhesPedido;
