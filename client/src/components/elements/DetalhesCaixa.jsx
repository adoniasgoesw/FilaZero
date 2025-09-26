import React, { useState, useEffect } from 'react';
import { User, DollarSign, TrendingUp, TrendingDown, CreditCard, Smartphone, Banknote, Calendar, Clock, Building2 } from 'lucide-react';
import api from '../../services/api';
import { imprimirNotaCaixa } from '../../services/notaFiscalPrint';
import FormContainer from '../forms/FormContainer';
import FormField from '../forms/FormField';
import FormGrid from '../forms/FormGrid';

const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'R$ 0,00';
  const num = Number(value) || 0;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
};

const formatDateTime = (iso) => {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    const date = new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short'
    }).format(d);
    const time = new Intl.DateTimeFormat('pt-BR', {
      timeStyle: 'short'
    }).format(d);
    return { date, time };
  } catch {
    return { date: iso, time: '' };
  }
};

const getPagamentoIcon = (tipo) => {
  switch (tipo?.toLowerCase()) {
    case 'pix':
      return Smartphone;
    case 'dinheiro':
    case 'dinheiro à vista':
      return Banknote;
    case 'cartão de crédito':
    case 'cartão de débito':
    case 'crédito':
    case 'débito':
      return CreditCard;
    default:
      return CreditCard;
  }
};

const getPagamentoColor = (tipo) => {
  switch (tipo?.toLowerCase()) {
    case 'pix':
      return 'text-emerald-600 bg-emerald-100';
    case 'dinheiro':
    case 'dinheiro à vista':
      return 'text-green-600 bg-green-100';
    case 'cartão de crédito':
    case 'crédito':
      return 'text-blue-600 bg-blue-100';
    case 'cartão de débito':
    case 'débito':
      return 'text-purple-600 bg-purple-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const DetalhesCaixa = ({ caixa, onPrintDataReady }) => {
  const [loading, setLoading] = useState(false);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [pagamentos, setPagamentos] = useState([]);
  const [totalPagamentos, setTotalPagamentos] = useState(0);
  const [usuarioAbertura, setUsuarioAbertura] = useState(null);
  const [usuarioFechamento, setUsuarioFechamento] = useState(null);

  useEffect(() => {
    if (caixa) {
      fetchDetalhes();
    }
  }, [caixa]);

  // Notificar quando os dados estão prontos para impressão
  useEffect(() => {
    if (onPrintDataReady && !loading && caixa) {
      onPrintDataReady({
        caixa,
        movimentacoes,
        pagamentos,
        usuarioAbertura,
        usuarioFechamento
      });
    }
  }, [loading, caixa, movimentacoes, pagamentos, usuarioAbertura, usuarioFechamento, onPrintDataReady]);

  const fetchDetalhes = async () => {
    if (!caixa) return;
    
    setLoading(true);
    try {
      const estabelecimentoId = localStorage.getItem('estabelecimentoId');
      
      // Buscar movimentações do caixa
      const movimentacoesRes = await api.get(`/movimentacoes-caixa/${caixa.id}`);
      if (movimentacoesRes.success) {
        setMovimentacoes(movimentacoesRes.data.movimentacoes || movimentacoesRes.data || []);
      }

      // Buscar pagamentos do caixa
      if (estabelecimentoId) {
        try {
          const pagamentosRes = await api.get(`/pagamentos/historico/caixa/${caixa.id}?estabelecimento_id=${estabelecimentoId}`);
          console.log('🔍 DetalhesCaixa - Resposta da API de pagamentos:', pagamentosRes);
          
          if (pagamentosRes.success) {
            // A API retorna os dados brutos da tabela pedidos_pagamentos_historico
            const pagamentosBrutos = pagamentosRes.data?.data?.pagamentos || pagamentosRes.data?.pagamentos || [];
            
            console.log('🔍 DetalhesCaixa - Dados brutos:', pagamentosBrutos);
            
            // Buscar tipos de pagamento para obter os nomes corretos
            const tiposPagamento = {};
            try {
              const pagamentosRes = await api.get(`/pagamentos/${estabelecimentoId}`);
              if (pagamentosRes.success) {
                pagamentosRes.data.forEach(pag => {
                  tiposPagamento[pag.id] = pag.nome;
                });
              }
            } catch (error) {
              console.warn('Erro ao buscar tipos de pagamento:', error);
            }
            
            // Agrupar os pagamentos por pagamento_id
            const pagamentosAgrupados = {};
            let totalGeral = 0;
            
            pagamentosBrutos.forEach(pagamento => {
              const pagamentoId = pagamento.pagamento_id;
              const valor = parseFloat(pagamento.valor_pago || 0);
              
              if (!pagamentosAgrupados[pagamentoId]) {
                pagamentosAgrupados[pagamentoId] = {
                  pagamento_id: pagamentoId,
                  forma_pagamento: tiposPagamento[pagamentoId] || `Pagamento ${pagamentoId}`,
                  valor_total: 0,
                  quantidade_pedidos: 0
                };
              }
              
              pagamentosAgrupados[pagamentoId].valor_total += valor;
              pagamentosAgrupados[pagamentoId].quantidade_pedidos += 1;
              totalGeral += valor;
            });
            
            // Converter para array (sem percentuais)
            const pagamentosData = Object.values(pagamentosAgrupados);
            
            console.log('🔍 DetalhesCaixa - Pagamentos agrupados:', pagamentosData);
            
            setPagamentos(pagamentosData);
            setTotalPagamentos(0); // Não exibir total
          }
        } catch (error) {
          console.warn('Erro ao buscar pagamentos do caixa:', error);
        }
      }

      // Buscar dados dos usuários se existirem
      if (caixa.aberto_por) {
        try {
          const usuarioRes = await api.get(`/usuarios/${caixa.aberto_por}`);
          if (usuarioRes.success) {
            setUsuarioAbertura(usuarioRes.data);
          }
        } catch (error) {
          console.warn('Erro ao buscar usuário de abertura:', error);
        }
      }

      if (caixa.fechado_por) {
        try {
          const usuarioRes = await api.get(`/usuarios/${caixa.fechado_por}`);
          if (usuarioRes.success) {
            setUsuarioFechamento(usuarioRes.data);
          }
        } catch (error) {
          console.warn('Erro ao buscar usuário de fechamento:', error);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do caixa:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handlePrint = async () => {
    // Buscar dados do estabelecimento
    const estabelecimento = await buscarDadosEstabelecimento();
    
    imprimirNotaCaixa(caixa, movimentacoes, pagamentos, usuarioAbertura, usuarioFechamento, estabelecimento);
  };

  if (!caixa) return null;

  return (
    <FormContainer>
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-sm text-gray-600 font-medium">Carregando detalhes...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Resumo Financeiro */}
          <div>
            <FormField label="Resumo Financeiro">
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  <div className="space-y-4 p-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Valor de Abertura</span>
                      <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">{formatCurrency(caixa.valor_abertura)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Entradas</span>
                      <span className="text-sm font-semibold text-green-600 whitespace-nowrap">+ {formatCurrency(caixa.entradas)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-medium text-gray-600">Saídas</span>
                      <span className="text-sm font-semibold text-red-600 whitespace-nowrap">- {formatCurrency(caixa.saidas)}</span>
                    </div>
                  </div>
                  <div className="space-y-4 p-4">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Fechamento</span>
                      <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">{formatCurrency(caixa.valor_fechamento)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Saldo Total</span>
                      <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">{formatCurrency(caixa.saldo_total)}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 bg-gray-50 -mx-4 px-4 rounded-b-lg">
                      <span className="text-base font-bold text-gray-800">Diferença</span>
                      <span className="text-base font-bold text-gray-900 whitespace-nowrap">{formatCurrency(caixa.diferenca)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </FormField>
          </div>

          {/* Responsáveis */}
          <div>
            <FormField label="Responsáveis">
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-800">Abertura</span>
                  </div>
                  <div className="pl-11 space-y-2">
                    <p className="text-sm font-medium text-gray-900">{usuarioAbertura ? usuarioAbertura.nome : 'Usuário não encontrado'}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDateTime(caixa.data_abertura).date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDateTime(caixa.data_abertura).time}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {caixa.data_fechamento && (
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-800">Fechamento</span>
                    </div>
                    <div className="pl-11 space-y-2">
                      <p className="text-sm font-medium text-gray-900">{usuarioFechamento ? usuarioFechamento.nome : 'Usuário não encontrado'}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDateTime(caixa.data_fechamento).date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDateTime(caixa.data_fechamento).time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </FormField>
          </div>

          {/* Pagamentos */}
          {pagamentos.length > 0 && (
            <div>
              <FormField label="Formas de Pagamento">
                <div className="space-y-3">
                  {pagamentos.map((pagamento, index) => {
                    const IconComponent = getPagamentoIcon(pagamento.forma_pagamento);
                    return (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getPagamentoColor(pagamento.forma_pagamento).split(' ')[1]}`}>
                              <IconComponent className={`w-4 h-4 ${getPagamentoColor(pagamento.forma_pagamento).split(' ')[0]}`} />
                            </div>
                            <span className="text-sm font-medium text-gray-900">{pagamento.forma_pagamento}</span>
                          </div>
                          <span className="text-sm font-bold text-gray-900">{formatCurrency(pagamento.valor_total)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </FormField>
            </div>
          )}

          {/* Movimentações */}
          {movimentacoes.length > 0 && (
            <div>
              <FormField label="Movimentações">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  {/* Header - só aparece em telas maiores */}
                  <div className="hidden sm:block bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <div className="grid grid-cols-4 gap-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      <div>Descrição</div>
                      <div>Data/Hora</div>
                      <div>Tipo</div>
                      <div className="text-right">Valor</div>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {movimentacoes.map((mov) => (
                      <div key={mov.id} className="px-4 py-4">
                        {/* Mobile layout */}
                        <div className="sm:hidden space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-gray-900">{mov.descricao}</div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              mov.tipo === 'entrada' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {mov.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDateTime(mov.criado_em).date}</span>
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" />
                                <span>{formatDateTime(mov.criado_em).time}</span>
                              </div>
                            </div>
                            <div className="text-right font-medium text-gray-900">
                              <span className={mov.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}>
                                {mov.tipo === 'entrada' ? '+' : '-'}{formatCurrency(mov.valor)}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Desktop layout */}
                        <div className="hidden sm:grid grid-cols-4 gap-4 items-center">
                          <div className="font-medium text-gray-900">{mov.descricao}</div>
                          <div className="text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDateTime(mov.criado_em).date}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatDateTime(mov.criado_em).time}</span>
                            </div>
                          </div>
                          <div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              mov.tipo === 'entrada' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {mov.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                            </span>
                          </div>
                          <div className="text-right font-medium text-gray-900">
                            <span className={mov.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}>
                              {mov.tipo === 'entrada' ? '+' : '-'}{formatCurrency(mov.valor)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FormField>
            </div>
          )}
        </div>
      )}
    </FormContainer>
  );
};

export default DetalhesCaixa;