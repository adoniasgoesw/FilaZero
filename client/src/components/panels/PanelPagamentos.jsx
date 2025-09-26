import React, { useState, useEffect } from 'react';
import Back from '../buttons/Back';
import { CreditCard, DollarSign, Smartphone, Banknote, Users, Plus, X } from 'lucide-react';
import ListaValores from '../list/ListaValores';
import AddButton from '../buttons/Add';
import ConfirmDialog from '../elements/ConfirmDialog';
import BaseModal from '../modals/Base';
import ListClient from '../list/ListClient';
import api from '../../services/api';
import { imprimirNotaFiscal } from '../../services/notaFiscalPrint';

function formatCurrencyBRL(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
}

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

const PanelPagamentos = ({ 
  identificacao, 
  onBack, 
  orderName, 
  items = [], 
  displayItems = [], 
  pendingItems = [], 
  mobileVisible = false, 
  isSmallScreen = false,
  onFinalizeOrder 
}) => {
  // Calcular totais
  const safeItems = Array.isArray(displayItems) ? displayItems : (Array.isArray(items) ? items : []);
  const itemsTotal = safeItems.reduce((acc, it) => acc + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0), 0)
    + (Array.isArray(pendingItems) ? pendingItems.reduce((acc, it) => acc + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0), 0) : 0);
  const complementsTotal = safeItems.reduce((acc, it) => {
    const itemComplements = Array.isArray(it.complements) 
      ? it.complements.reduce((s, c) => s + (Number(c.qty) || 0) * (Number(c.unitPrice) || 0), 0)
      : 0;
    return acc + itemComplements;
  }, 0) + (Array.isArray(pendingItems) ? pendingItems.reduce((acc, it) => {
    const itemComplements = Array.isArray(it.complements) 
      ? it.complements.reduce((s, c) => s + (Number(c.qty) || 0) * (Number(c.unitPrice) || 0), 0)
      : 0;
    return acc + itemComplements;
  }, 0) : 0);
  const subtotal = itemsTotal + complementsTotal;
  
  // Estados para pagamentos - agora usando array de objetos com IDs únicos
  const [selectedPayments, setSelectedPayments] = useState([]); // [{ id: uniqueId, paymentId: methodId, amount: value }]
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [finalizing, setFinalizing] = useState(false);
  
  // Estados para valores do banco
  const [valorPagoBanco, setValorPagoBanco] = useState(0);
  const [valorRestanteBanco, setValorRestanteBanco] = useState(0);
  
  
  // Estados para buscar pagamentos do banco
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [paymentError, setPaymentError] = useState(null);
  
  // Estados para desconto e acréscimo do banco
  const [desconto, setDesconto] = useState(0);
  const [acrescimo, setAcrescimo] = useState(0);
  
  // Estado para controlar o modal de adicionar cliente
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  
  
  
  // Calcular total final considerando desconto e acréscimo
  const totalFinal = Math.max(0, subtotal + Number(acrescimo) - Number(desconto));
  
  // Calcular total pago e troco
  const totalPago = selectedPayments.reduce((acc, payment) => acc + (Number(payment.amount) || 0), 0);
  const valorRestante = Math.max(0, totalFinal - totalPago);
  const troco = totalPago > totalFinal ? totalPago - totalFinal : 0;
  
  // Calcular valores totais - usar apenas os valores dos pagamentos selecionados
  // (que já incluem os pagamentos existentes pré-carregados)
  const totalPagoComAnteriores = totalPago;
  const valorRestanteComAnteriores = Math.max(0, totalFinal - totalPagoComAnteriores);

  // Função para carregar pagamentos existentes do pedido
  const loadExistingPayments = async (pedidoId) => {
    try {
      console.log('🔍 Carregando pagamentos existentes para pedido:', pedidoId);
      
      if (!pedidoId) {
        console.log('⚠️ ID do pedido não fornecido');
        return;
      }
      
      const response = await api.get(`/pagamentos/pedido/${pedidoId}`);
      
      if (response.success && response.data && response.data.length > 0) {
        console.log('✅ Pagamentos existentes encontrados:', response.data);
        
        // Pré-preencher pagamentos existentes
        const existingPayments = response.data.map(pagamento => ({
          id: Date.now() + Math.random() + pagamento.pagamento_id, // ID único
          paymentId: pagamento.pagamento_id,
          amount: Number(pagamento.valor_pago) || 0,
          isExisting: true, // Marcar como pagamento existente
          dbId: pagamento.id // ID do banco para referência
        }));
        
        setSelectedPayments(existingPayments);
        console.log('✅ Pagamentos existentes pré-preenchidos:', existingPayments);
      } else {
        console.log('ℹ️ Nenhum pagamento existente encontrado para este pedido');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar pagamentos existentes:', error);
      // Em caso de erro, não fazer nada - deixa o usuário configurar manualmente
    }
  };

  // Buscar dados do pedido do banco (desconto e acréscimo)
  useEffect(() => {
    let isMounted = true;
    async function fetchPedidoData() {
      try {
        const estabelecimentoId = localStorage.getItem('estabelecimentoId');
        if (!estabelecimentoId) return;

        const response = await api.get(`/pedidos/${estabelecimentoId}/${encodeURIComponent(identificacao)}`);
        if (response.success && response.data && response.data.pedido) {
          const pedido = response.data.pedido;
          if (isMounted) {
            setDesconto(Number(pedido.desconto) || 0);
            setAcrescimo(Number(pedido.acrescimos) || 0);
            
            // Carregar valores de pagamento do banco
            setValorPagoBanco(Number(pedido.valor_pago) || 0);
            setValorRestanteBanco(Number(pedido.valor_restante) || 0);
            
            // Carregar pagamentos existentes do pedido
            if (pedido.id) {
              await loadExistingPayments(pedido.id);
            }
            
            console.log('✅ Dados do pedido carregados no PanelPagamentos:', {
              desconto: Number(pedido.desconto) || 0,
              acrescimo: Number(pedido.acrescimos) || 0,
              valor_pago: Number(pedido.valor_pago) || 0,
              valor_restante: Number(pedido.valor_restante) || 0
            });
          }
        }
      } catch (error) {
        console.warn('Erro ao carregar dados do pedido:', error);
      }
    }
    fetchPedidoData();
    return () => { isMounted = false; };
  }, [identificacao]);

  // Função para obter ícone baseado no tipo
  const getTipoIcon = (tipo) => {
    switch (tipo.toLowerCase()) {
      case 'dinheiro':
        return Banknote;
      case 'pix':
        return Smartphone;
      case 'cartão':
      case 'cartao':
        return CreditCard;
      case 'transferência':
      case 'transferencia':
        return DollarSign;
      default:
        return DollarSign;
    }
  };

  // Função para obter cor do ícone baseado no tipo
  const getTipoIconColor = (tipo) => {
    switch (tipo.toLowerCase()) {
      case 'dinheiro':
        return 'bg-green-100 text-green-600';
      case 'pix':
        return 'bg-blue-100 text-blue-600';
      case 'cartão':
      case 'cartao':
        return 'bg-purple-100 text-purple-600';
      case 'transferência':
      case 'transferencia':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };


  // Função para buscar pagamentos do banco
  const fetchPaymentMethods = async () => {
    try {
      const estabelecimentoId = localStorage.getItem('estabelecimentoId');
      if (!estabelecimentoId) {
        throw new Error('Estabelecimento não identificado');
      }


      setLoadingPayments(true);
      setPaymentError(null);

      console.log('🔍 Buscando métodos de pagamento para estabelecimento:', estabelecimentoId);
      
      const response = await api.get(`/pagamentos/${estabelecimentoId}`);
      
      if (response.success) {
        // Filtrar apenas pagamentos ativos e esconder compostos
        const activePayments = response.data.filter(payment => 
          payment.status === true && 
          payment.nome !== 'Pagamento Composto' && 
          payment.tipo !== 'Composto'
        );
        setPaymentMethods(activePayments);
        console.log('🚫 Pagamentos compostos escondidos');
      } else {
        throw new Error(response.message || 'Erro ao carregar métodos de pagamento');
      }
    } catch (error) {
      console.error('❌ Erro ao buscar métodos de pagamento:', error);
      setPaymentError(error.message || 'Erro ao carregar métodos de pagamento');
    } finally {
      setLoadingPayments(false);
    }
  };

  // Carregar pagamentos quando o componente monta
  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  // Carregar cliente existente do pedido
  useEffect(() => {
    const fetchClienteExistente = async () => {
      try {
        const estabelecimentoId = localStorage.getItem('estabelecimentoId');
        if (!estabelecimentoId) return;

        const response = await api.get(`/pedidos/${estabelecimentoId}/${encodeURIComponent(identificacao)}`);
        if (response.success && response.data && response.data.cliente) {
          setSelectedClient(response.data.cliente);
          console.log('✅ Cliente carregado:', response.data.cliente);
        }
      } catch (error) {
        console.error('❌ Erro ao carregar cliente existente:', error);
      }
    };

    fetchClienteExistente();
  }, [identificacao]);


  const handleAddPayment = (methodId) => {
    const newPayment = {
      id: Date.now() + Math.random(), // ID único
      paymentId: methodId,
      amount: 0,
      isExisting: false // Marcar como novo pagamento
    };
    setSelectedPayments(prev => [...prev, newPayment]);
  };

  const handleRemovePayment = async (paymentId) => {
    try {
      // Encontrar o pagamento que está sendo removido
      const paymentToRemove = selectedPayments.find(p => p.id === paymentId);
      if (!paymentToRemove) return;

      // Se for um pagamento existente, precisamos excluir do banco de dados
      const isExistingPayment = paymentToRemove.isExisting;
      
      if (isExistingPayment) {
        console.log('🗑️ Removendo pagamento existente do banco:', paymentToRemove);
        
        // Buscar o ID do pedido
        const estabelecimentoId = localStorage.getItem('estabelecimentoId');
        if (!estabelecimentoId) {
          console.error('Estabelecimento não identificado');
          return;
        }

        const response = await api.get(`/pedidos/${estabelecimentoId}/${encodeURIComponent(identificacao)}`);
        if (response.success && response.data && response.data.pedido) {
          const pedidoId = response.data.pedido.id;
          
          // Excluir o pagamento específico da tabela pedidos_pagamentos
          const deleteResponse = await api.delete(`/pagamentos/pedido/${pedidoId}/${paymentToRemove.paymentId}`);
          
          if (deleteResponse.success) {
            console.log('✅ Pagamento existente removido do banco');
          } else {
            console.error('❌ Erro ao remover pagamento do banco:', deleteResponse.message);
          }
        }
      }

      // Remover da lista local
      setSelectedPayments(prev => prev.filter(payment => payment.id !== paymentId));
      
      // Disparar evento para atualizar o painel detalhes
      window.dispatchEvent(new CustomEvent('paymentUpdated'));
      
    } catch (error) {
      console.error('❌ Erro ao remover pagamento:', error);
      // Mesmo com erro, remover da lista local para não travar a interface
      setSelectedPayments(prev => prev.filter(payment => payment.id !== paymentId));
      
      // Disparar evento mesmo em caso de erro
      window.dispatchEvent(new CustomEvent('paymentUpdated'));
    }
  };

  const handlePaymentAmountChange = async (paymentId, value) => {
    const newAmount = parseFloat(value) || 0;
    
    // Atualizar o estado local primeiro
    setSelectedPayments(prev => 
      prev.map(payment => 
        payment.id === paymentId 
          ? { ...payment, amount: newAmount }
          : payment
      )
    );

    // Se for um pagamento existente, atualizar no banco de dados
    const payment = selectedPayments.find(p => p.id === paymentId);
    if (payment && payment.id < Date.now()) { // Pagamento existente
      try {
        console.log('💾 Atualizando valor do pagamento existente:', { paymentId, newAmount });
        
        const estabelecimentoId = localStorage.getItem('estabelecimentoId');
        if (!estabelecimentoId) {
          console.error('Estabelecimento não identificado');
          return;
        }

        const response = await api.get(`/pedidos/${estabelecimentoId}/${encodeURIComponent(identificacao)}`);
        if (response.success && response.data && response.data.pedido) {
          const pedidoId = response.data.pedido.id;
          
          // Atualizar o valor do pagamento na tabela pedidos_pagamentos
          const updateResponse = await api.put(`/pagamentos/pedido/${pedidoId}/${payment.paymentId}`, {
            valor_pago: newAmount
          });
          
          if (updateResponse.success) {
            console.log('✅ Valor do pagamento atualizado no banco');
            // Disparar evento para atualizar o painel detalhes
            window.dispatchEvent(new CustomEvent('paymentUpdated'));
      } else {
            console.error('❌ Erro ao atualizar pagamento no banco:', updateResponse.message);
          }
        }
      } catch (error) {
        console.error('❌ Erro ao atualizar valor do pagamento:', error);
      }
    }
  };

  const handleClientSelect = async (client) => {
    setSelectedClient(client);
    console.log('Cliente selecionado:', client);
    
    // Salvar cliente no pedido via API
    try {
      const estabelecimentoId = localStorage.getItem('estabelecimentoId');
      if (!estabelecimentoId) {
        console.error('Estabelecimento não identificado');
        return;
      }

      const response = await api.put(`/pedidos/${estabelecimentoId}/${encodeURIComponent(identificacao)}/cliente`, {
        cliente_id: client.id
      });

      if (response.success) {
        console.log('✅ Cliente salvo no pedido:', response.data);
        
        // Disparar evento para atualizar a listagem de pontos de atendimento
        window.dispatchEvent(new CustomEvent('pedidoUpdated'));
        window.dispatchEvent(new CustomEvent('atendimentoChanged'));
      } else {
        console.error('❌ Erro ao salvar cliente:', response.message);
      }
    } catch (error) {
      console.error('❌ Erro ao salvar cliente no pedido:', error);
    }
  };

  const handleFinalizeOrder = async () => {
    try {
      setFinalizing(true);
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
      if (estId === null) {
        setFinalizing(false);
        return;
      }
      
      const ident = String(identificacao || '').toLowerCase();
      
      console.log('🔍 PanelPagamentos - Parâmetros para API:', {
        estId,
        ident,
        identificacao,
        selectedPayments,
        totalPago,
        troco
      });
      
      // DEBUG: Verificar estado dos itens
      console.log('🔍 DEBUG - Estado dos itens no PanelPagamentos:');
      console.log('  - pendingItems:', pendingItems);
      console.log('  - displayItems:', displayItems);
      console.log('  - hasPendingItems:', Array.isArray(pendingItems) && pendingItems.length > 0);
      console.log('  - hasDisplayItems:', Array.isArray(displayItems) && displayItems.length > 0);
      
      // PRIMEIRO: Salvar apenas itens pendentes (não salvos ainda)
      console.log('💾 Salvando apenas itens pendentes...');
      
      // Verificar se há itens pendentes para salvar
      const hasPendingItems = Array.isArray(pendingItems) && pendingItems.length > 0;
      
      if (hasPendingItems) {
        console.log('📝 Salvando itens pendentes antes de finalizar pagamento...');
        console.log('📝 Itens pendentes a serem salvos:', pendingItems);
        
        // Constrói payload APENAS com itens pendentes (não salvos)
        const itensPayload = [];
        
        for (const it of pendingItems) {
          const base = {
            produto_id: Number(it.id),
            quantidade: Math.max(1, Number(it.qty) || 0),
            valor_unitario: Number(it.unitPrice) || 0,
            complementos: Array.isArray(it.complements)
              ? it.complements.map((c) => ({
                  complemento_id: Number(c.id),
                  nome_complemento: String(c.name || ''),
                  quantidade: Math.max(1, Number(c.qty) || 0),
                  valor_unitario: Number(c.unitPrice) || 0
                }))
              : []
          };
          itensPayload.push(base);
        }

        console.log('📝 Payload dos itens pendentes:', itensPayload);

        // Normaliza e filtra
        const finalItens = itensPayload
          .map((i) => ({
            ...i,
            quantidade: Math.max(1, Number(i.quantidade) || 0),
            valor_unitario: Number(i.valor_unitario) || 0,
            complementos: Array.isArray(i.complementos)
              ? i.complementos.map((c) => ({
                  complemento_id: Number(c.complemento_id),
                  nome_complemento: String(c.nome_complemento || ''),
                  quantidade: Math.max(1, Number(c.quantidade) || 0),
                  valor_unitario: Number(c.valor_unitario) || 0
                }))
              : []
          }))
          .filter((i) => !Number.isNaN(i.produto_id) && i.quantidade > 0);

        console.log('📝 Itens finais a serem salvos:', finalItens);

        // Salvar apenas itens pendentes no pedido
        const payload = {
          nome_ponto: orderName || '',
          valor_total: finalItens.reduce((s, i) => s + i.quantidade * i.valor_unitario, 0),
          itens: finalItens,
        };
        
        console.log('📝 Payload completo para API:', payload);
        
        await api.put(`/pedidos/${estId}/${encodeURIComponent(ident)}`, payload);
        console.log('✅ Itens pendentes salvos com sucesso');
      } else {
        console.log('ℹ️ Nenhum item pendente para salvar');
      }
      
      // Garantir que o atendimento existe antes de prosseguir
      try {
        console.log('🔍 Garantindo que atendimento existe...');
        await api.post(`/atendimentos/ensure/${estId}/${encodeURIComponent(ident)}`, { nome_ponto: '' });
        console.log('✅ Atendimento garantido');
      } catch (error) {
        console.warn('⚠️ Erro ao garantir atendimento:', error);
        // Continuar mesmo assim, pode ser que já exista
      }
      
      // Criar/obter pagamento composto
      const pagamentoIds = selectedPayments.map(payment => payment.paymentId);
      const pagamentoResponse = await api.post(`/pedidos/${estId}/pagamento-composto`, {
        pagamentoIds: pagamentoIds
      });

      if (!pagamentoResponse.success) {
        throw new Error(pagamentoResponse.message || 'Erro ao criar pagamento composto');
      }

      const pagamentoId = pagamentoResponse.data.pagamento_id;
      console.log('✅ Pagamento composto criado/obtido:', pagamentoId);

      // Separar pagamentos existentes (para atualizar) dos novos (para criar)
      const existingPayments = selectedPayments.filter(payment => payment.isExisting && payment.amount > 0);
      const newPayments = selectedPayments.filter(payment => !payment.isExisting && payment.amount > 0);
      
      console.log('🔍 Pagamentos existentes para atualizar:', existingPayments);
      console.log('🔍 Novos pagamentos para criar:', newPayments);
      
      // Atualizar pagamentos existentes no banco
      for (const payment of existingPayments) {
        if (payment.dbId) {
          try {
            const updateResponse = await api.put(`/pagamentos/${payment.dbId}`, {
              valor_pago: payment.amount
            });
            
            if (updateResponse.success) {
              console.log('✅ Pagamento existente atualizado:', payment.dbId, 'novo valor:', payment.amount);
            } else {
              console.error('❌ Erro ao atualizar pagamento existente:', updateResponse.message);
            }
          } catch (error) {
            console.error('❌ Erro ao atualizar pagamento existente:', error);
          }
        }
      }
      
      // Preparar detalhes dos novos pagamentos
      const pagamentosDetalhes = newPayments.map(payment => {
        const method = paymentMethods.find(m => m.id === payment.paymentId);
        return {
          pagamento_id: payment.paymentId,
          valor_pago: payment.amount,
          pagamento_nome: method?.nome || 'Desconhecido',
          pagamento_tipo: method?.tipo || 'Desconhecido'
        };
      });

      // Salvar valores de pagamento e troco no banco
      console.log('🔍 PanelPagamentos - Chamando API de pagamento:', {
        url: `/pedidos/${estId}/${encodeURIComponent(ident)}/payment`,
        data: {
          valor_pago: totalPagoComAnteriores,
          valor_troco: troco,
          valor_restante: valorRestanteComAnteriores,
          pagamento_id: pagamentoId,
          pagamentos_detalhes: pagamentosDetalhes
        }
      });
      
      const paymentResponse = await api.put(`/pedidos/${estId}/${encodeURIComponent(ident)}/payment`, {
        valor_pago: totalPagoComAnteriores,
        valor_troco: troco,
        valor_restante: valorRestanteComAnteriores,
        pagamento_id: pagamentoId,
        pagamentos_detalhes: pagamentosDetalhes
      });

      if (!paymentResponse.success) {
        throw new Error(paymentResponse.message || 'Erro ao salvar valores de pagamento');
      }

      console.log('✅ Valores de pagamento salvos:', {
        valor_pago: totalPagoComAnteriores,
        valor_troco: troco,
        valor_restante: valorRestanteComAnteriores,
        pagamento_id: pagamentoId
      });

      // Disparar eventos para atualizar listas
      window.dispatchEvent(new CustomEvent('paymentUpdated'));
      window.dispatchEvent(new CustomEvent('pedidoUpdated'));
      window.dispatchEvent(new CustomEvent('atendimentoChanged'));

      // Limpar itens pendentes após salvar no banco
      console.log('🧹 Limpando itens pendentes após finalizar pagamento');
      
      // Voltar para o painel de detalhes
      onBack?.();
    } catch (e) {
      console.error('Erro ao finalizar pedido:', e);
    } finally {
      setFinalizing(false);
    }
  };

  return (
    <aside className={`${mobileVisible ? 'flex md:flex' : 'hidden md:flex'} fixed md:top-4 md:bottom-4 md:left-24 md:w-[30%] top-0 bottom-0 left-0 right-0 w-full bg-white border border-gray-200 md:rounded-2xl shadow-2xl z-50 flex-col`}>
      {/* Header */}
      <div className="p-3 md:p-4 border-b border-gray-200 flex items-center gap-3">
        <div className="shrink-0">
          <Back onClick={onBack} />
        </div>
            <div className="text-base md:text-lg font-semibold text-gray-800">
              Pagamentos
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto rounded-b-2xl space-y-6 scrollbar-hide">
        {/* Formas de pagamento em duas colunas */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Formas de Pagamento</h3>
          
          {loadingPayments ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-sm text-gray-600">Carregando...</span>
            </div>
          ) : paymentError ? (
            <div className="text-center py-4">
              <div className="text-red-500 mb-2">
                <CreditCard className="w-8 h-8 mx-auto" />
              </div>
              <p className="text-sm text-red-600 mb-2">{paymentError}</p>
              <button
                onClick={fetchPaymentMethods}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Tentar novamente
              </button>
            </div>
          ) : paymentMethods.length === 0 ? (
            <div className="text-center py-4">
              <div className="text-gray-400 mb-2">
                <CreditCard className="w-8 h-8 mx-auto" />
              </div>
              <p className="text-sm text-gray-600">Nenhum método de pagamento cadastrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((method) => {
                const Icon = getTipoIcon(method.tipo);
                return (
                  <button
                    key={method.id}
                    onClick={() => handleAddPayment(method.id)}
                    className="p-2 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTipoIconColor(method.tipo)}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-800 truncate">{method.nome}</div>
                        {method.taxa > 0 && (
                          <div className="text-xs text-gray-500">+{method.taxa}%</div>
                        )}
                      </div>
                      <Plus className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Botão Cliente */}
        <div className="w-full">
          <button
            onClick={() => setShowAddClientModal(true)}
            className={`w-full h-12 px-3 sm:px-4 border-2 text-sm font-medium rounded-xl flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md ${
              selectedClient 
                ? 'bg-orange-50 border-orange-500 text-orange-700 hover:bg-orange-100' 
                : 'bg-white border-orange-500 text-orange-500 hover:bg-orange-50 hover:border-orange-600 hover:text-orange-600'
            }`}
            title={selectedClient ? `Cliente: ${selectedClient.nome}` : "Adicionar cliente"}
          >
            {selectedClient ? <Users size={16} /> : <Plus size={16} />}
            <span className="inline truncate">
              {selectedClient ? selectedClient.nome : "Adicionar cliente"}
            </span>
          </button>
        </div>

        {/* Lista de Valores com Divisão de Conta */}
        <div className="w-full">
          <ListaValores 
            subtotal={subtotal} 
            acrescimo={acrescimo} 
            desconto={desconto} 
            pago={totalPagoComAnteriores}
            valorPago={totalPagoComAnteriores}
            valorRestante={valorRestanteComAnteriores}
            showAcrescimo={false}
            showDesconto={false}
            showOnlyTotal={false}
            showDivisaoConta={true}
            numberOfPeople={numberOfPeople}
            onNumberOfPeopleChange={setNumberOfPeople}
            mode="payments"
          />
        </div>

        {/* Pagamentos Selecionados */}
        {selectedPayments.length > 0 && (
          <div className="w-full space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Pagamentos Selecionados</h3>
            {selectedPayments.map((payment) => {
              const method = paymentMethods.find(m => m.id === payment.paymentId);
              if (!method) return null;
              
              const Icon = getTipoIcon(method.tipo);
              
              return (
                <div key={payment.id} className="w-full p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTipoIconColor(method.tipo)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800 truncate">{method.nome}</div>
                      {method.taxa > 0 && (
                        <div className="text-xs text-gray-500">+{method.taxa}% de taxa</div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={payment.amount}
                        onChange={(e) => handlePaymentAmountChange(payment.id, e.target.value)}
                        onFocus={(e) => e.target.select()}
                        placeholder="0,00"
                        className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:ring-0 focus:border-blue-500 focus:outline-none text-sm font-normal transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-white hover:bg-gray-50 text-gray-700"
                        style={{ textAlign: 'center' }}
                      />
                      <button
                        onClick={() => handleRemovePayment(payment.id)}
                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Remover pagamento"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}


      </div>

      {/* Footer */}
      <div className="p-3 md:p-4 border-t border-gray-200">
        <button
          type="button"
          onClick={handleFinalizeOrder}
          disabled={selectedPayments.length === 0 || loadingPayments || finalizing}
          className="w-full h-11 md:h-12 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold transition-colors"
        >
          {finalizing ? 'Finalizando...' : 'Finalizar pagamento'}
        </button>
      </div>


      {/* Modal de Selecionar Cliente */}
      <BaseModal
        isOpen={showAddClientModal}
        onClose={() => setShowAddClientModal(false)}
        title={selectedClient ? "Alterar Cliente" : "Selecionar Cliente"}
        icon={selectedClient ? Users : Plus}
        iconBgColor="bg-orange-500"
        iconColor="text-white"
        onSave={() => {
          if (selectedClient) {
            console.log('Cliente selecionado:', selectedClient);
            // Aqui você pode adicionar a lógica para usar o cliente selecionado
          }
        }}
        saveText="Selecionar"
        cancelText="Cancelar"
      >
        {/* Lista de Clientes */}
        <div className="p-6">
          <ListClient 
            onClientSelect={handleClientSelect}
            selectedClientId={selectedClient?.id}
          />
        </div>
      </BaseModal>

    </aside>
  );
};

export default PanelPagamentos;
