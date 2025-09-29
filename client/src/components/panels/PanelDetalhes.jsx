import React from 'react';
import Back from '../buttons/Back';
import { Pencil, Trash2, Info, X } from 'lucide-react';
import ListaItensPedido from '../list/ListaItensPedido';
import api from '../../services/api';
import ListaValores from '../list/ListaValores';
import Surcharge from '../buttons/Surcharge';
import Discount from '../buttons/Discount';
import KitchenButton from '../buttons/Kitchen';
import DeleteButton from '../buttons/Delete';
import ConfirmDelete from '../elements/ConfirmDelete';
import ConfirmDialog from '../elements/ConfirmDialog';
import DiscountSurchargeDialog from '../elements/DiscountSurchargeDialog';
import { imprimirNotaFiscal, imprimirNotaCozinha } from '../../services/notaFiscalPrint';

function formatIdentificacao(raw) {
  const str = String(raw || '').toLowerCase();
  if (str.startsWith('balcao-')) {
    const n = String(parseInt(str.replace('balcao-', ''), 10) || '').padStart(2, '0');
    return `Balcão ${n}`;
  }
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

const PanelDetalhes = ({ identificacao, onBack, orderName, onOrderNameChange, mobileVisible = false, items, displayItems, pendingItems = [], onItemsChange, onPendingDecrementOrDelete, onSave, isSmallScreen = false, onShowPaymentPanel }) => {
  const label = formatIdentificacao(identificacao);
  const isBalcao = String(identificacao || '').toLowerCase().startsWith('balcao-');
  const [hasUserEditedName, setHasUserEditedName] = React.useState(false);

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

  const handleOrderNameChange = (e) => {
    setHasUserEditedName(true);
    onOrderNameChange?.(e.target.value);
  };
  React.useEffect(() => {
    let isMounted = true;
    async function fetchPedido() {
      try {
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
          } catch {
            // Ignore error
          }
        }
        if (estId === null) return;
        const ident = String(identificacao || '').toLowerCase();
        // Usar a rota que busca dados completos incluindo nome_ponto
        const res = await api.get(`/pedidos/${estId}/${encodeURIComponent(ident)}`);
        if (!isMounted) return;
        if (res.success && res.data) {
          // Usar itens_exibicao que já vem formatado
          const itens = Array.isArray(res.data.itens_exibicao) ? res.data.itens_exibicao : [];
          const itensMapped = itens.map((item) => ({
            id: item.produto_id,
            qty: Number(item.quantidade) || 0,
            name: item.produto_nome || `Produto ${item.produto_id}`,
            unitPrice: Number(item.valor_unitario) || 0,
            complements: Array.isArray(item.complementos)
              ? item.complementos.map((c) => ({
                  id: Number(c.complemento_id),
                  name: String(c.nome_complemento || ''),
                  unitPrice: Number(c.valor_unitario) || 0,
                  qty: Number(c.quantidade) || 0
                }))
              : []
          }));
          onItemsChange?.(itensMapped);
          console.log('✅ PanelDetalhes - Itens carregados do banco:', itensMapped);
        }
        
        // Carregar valores de desconto e acréscimo do pedido
        if (res.data.pedido) {
            const pedido = res.data.pedido;
            if (pedido.desconto !== undefined) {
              setDesconto(Number(pedido.desconto) || 0);
              // Por enquanto, assumir que desconto é em R$ (não temos tipo no banco)
              setDescontoIsPercentage(false);
            }
            if (pedido.acrescimos !== undefined) {
              setAcrescimo(Number(pedido.acrescimos) || 0);
              // Por enquanto, assumir que acréscimo é em R$ (não temos tipo no banco)
              setAcrescimoIsPercentage(false);
            }
            
            // Carregar valores de pagamento
            if (pedido.valor_pago !== undefined) {
              setValorPago(Number(pedido.valor_pago) || 0);
            }
            
            // Verificar se o pagamento foi finalizado (valor_pago > 0)
            const pagamentoIniciado = (Number(pedido.valor_pago) || 0) > 0;
            setPagamentoFinalizado(pagamentoIniciado);
            
            console.log('✅ Valores de pagamento carregados:', {
              valor_pago: Number(pedido.valor_pago) || 0,
              valor_restante: Number(pedido.valor_restante) || 0,
              pagamento_finalizado: pagamentoIniciado
            });
          }
          
          // Preencher o nome do pedido se existir no banco
          if (res.data.nome_ponto !== undefined && res.data.nome_ponto !== null && res.data.nome_ponto !== '') {
            onOrderNameChange?.(res.data.nome_ponto);
            // Resetar flag de edição local para permitir carregamento futuro
            setHasUserEditedName(false);
            console.log('✅ PanelDetalhes - Nome do pedido carregado:', res.data.nome_ponto);
          }
      } catch (error) {
        if (!isMounted) return;
        console.error('Erro ao carregar itens salvos:', error);
        // Remover mensagem de erro desnecessária - não mostrar erro para o usuário
      } finally {
        // Finalizar loading
      }
    }
    fetchPedido();
    return () => { isMounted = false; };
  }, [identificacao, onItemsChange, onOrderNameChange, hasUserEditedName]);

  // Função para recarregar dados do pedido
  const fetchPedidoData = React.useCallback(async () => {
    try {
      const estabelecimentoId = localStorage.getItem('estabelecimentoId');
      if (!estabelecimentoId) return;

      const response = await api.get(`/pedidos/${estabelecimentoId}/${encodeURIComponent(identificacao)}`);
      if (response.success && response.data && response.data.pedido) {
        const pedido = response.data.pedido;
        
        // Atualizar valores de pagamento
        setValorPago(Number(pedido.valor_pago) || 0);
        
        // Verificar se o pagamento foi finalizado
        const pagamentoIniciado = (Number(pedido.valor_pago) || 0) > 0;
        setPagamentoFinalizado(pagamentoIniciado);
        
        // Atualizar nome do pedido se existir (vem direto do res.data)
        if (response.data.nome_ponto && response.data.nome_ponto !== '') {
          onOrderNameChange?.(response.data.nome_ponto);
          setHasUserEditedName(false);
          console.log('✅ PanelDetalhes - Nome do pedido atualizado:', response.data.nome_ponto);
        }
        
        console.log('✅ Valores de pagamento atualizados:', {
          valor_pago: Number(pedido.valor_pago) || 0,
          pagamento_finalizado: pagamentoIniciado,
          nome_ponto: response.data.nome_ponto
        });
      }
    } catch (error) {
      console.warn('Erro ao recarregar dados do pedido:', error);
    }
  }, [identificacao, onOrderNameChange]);

  // Recarregar dados quando o componente é focado novamente (volta do painel de pagamentos)
  React.useEffect(() => {
    const handleFocus = () => {
      fetchPedidoData();
    };

    // Listener para eventos customizados de atualização de pagamento
    const handlePaymentUpdate = () => {
      console.log('🔄 Evento de atualização de pagamento recebido');
      fetchPedidoData();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('paymentUpdated', handlePaymentUpdate);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('paymentUpdated', handlePaymentUpdate);
    };
  }, [fetchPedidoData]);
  // Estados para desconto e acréscimo
  const [desconto, setDesconto] = React.useState(0);
  const [acrescimo, setAcrescimo] = React.useState(0);
  const [descontoIsPercentage, setDescontoIsPercentage] = React.useState(false);
  const [acrescimoIsPercentage, setAcrescimoIsPercentage] = React.useState(false);
  const [showDiscountDialog, setShowDiscountDialog] = React.useState(false);
  const [showSurchargeDialog, setShowSurchargeDialog] = React.useState(false);
  const [applyingDiscount, setApplyingDiscount] = React.useState(false);
  const [applyingSurcharge, setApplyingSurcharge] = React.useState(false);
  
  // Estados para controle de pagamento
  const [valorPago, setValorPago] = React.useState(0);
  const [pagamentoFinalizado, setPagamentoFinalizado] = React.useState(false);

  const safeItems = Array.isArray(displayItems) ? displayItems : (Array.isArray(items) ? items : []);
  const itemsTotal = safeItems.reduce((acc, it) => acc + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0), 0)
    + (Array.isArray(pendingItems) ? pendingItems.reduce((acc, it) => acc + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0), 0) : 0);
  const complementsTotal = safeItems.reduce((acc, it) => acc + (Array.isArray(it.complements) ? it.complements.reduce((s, c) => s + (Number(c.qty) || 0) * (Number(c.unitPrice) || 0), 0) : 0), 0)
    + (Array.isArray(pendingItems) ? pendingItems.reduce((acc, it) => acc + (Array.isArray(it.complements) ? it.complements.reduce((s, c) => s + (Number(c.qty) || 0) * (Number(c.unitPrice) || 0), 0) : 0), 0) : 0);
  const subtotal = itemsTotal + complementsTotal;
  
  // Calcular total final considerando desconto e acréscimo
  const totalFinal = Math.max(0, subtotal + Number(acrescimo) - Number(desconto));
  
  // Calcular valor restante dinamicamente baseado no total atual dos itens
  const valorRestanteCalculado = Math.max(0, totalFinal - Number(valorPago));
  
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [confirmUnsavedOpen, setConfirmUnsavedOpen] = React.useState(false);
  const [savingAndExit, setSavingAndExit] = React.useState(false);
  const [confirmFinalizeOpen, setConfirmFinalizeOpen] = React.useState(false);
  const [finalizing, setFinalizing] = React.useState(false);
  const [shouldPrint, setShouldPrint] = React.useState(false);
  const totalPendingQty = Array.isArray(pendingItems) ? pendingItems.reduce((acc, it) => acc + (Number(it.qty) || 0), 0) : 0;

  // Função para finalizar o pedido de verdade
  const handleFinalizeOrder = async () => {
    try {
      setFinalizing(true);
      
      // Verificar se o pagamento foi finalizado e não há valor restante
      if (!pagamentoFinalizado || valorRestanteCalculado > 0) {
        alert('O pagamento deve ser finalizado completamente (sem valor restante) antes de finalizar o pedido.');
        return;
      }
      
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
        } catch {
          // Ignore error
        }
      }
      if (estId === null) {
        alert('Estabelecimento não identificado');
        return;
      }
      
      const ident = String(identificacao || '').toLowerCase();
      
      // PRIMEIRO: Salvar todos os itens pendentes antes de finalizar
      console.log('💾 Salvando itens pendentes antes de finalizar...');
      
      // Verificar se há itens pendentes para salvar
      const hasPendingItems = Array.isArray(pendingItems) && pendingItems.length > 0;
      const hasDisplayItems = Array.isArray(displayItems) && displayItems.length > 0;
      
      if (hasPendingItems || hasDisplayItems) {
        console.log('📝 Salvando itens antes de finalizar pedido...');
        
        // Constrói payload com TODOS os itens (existentes + pendentes)
        const itensPayload = [];
        
        // 1) Adiciona itens já salvos (existentes no pedido)
        if (hasDisplayItems) {
          for (const it of displayItems) {
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
        }

        // 2) Adiciona itens pendentes (selecionados nesta sessão)
        if (hasPendingItems) {
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
        }

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

        // Salvar itens no pedido
        const payload = {
          nome_ponto: orderName || '',
          valor_total: finalItens.reduce((s, i) => s + i.quantidade * i.valor_unitario, 0),
          itens: finalItens,
        };
        
        await api.put(`/pedidos/${estId}/${encodeURIComponent(ident)}`, payload);
        console.log('✅ Itens salvos com sucesso antes de finalizar');
      }
      
      // SEGUNDO: Finalizar o pedido
      console.log('🏁 Finalizando pedido...');
      await api.post(`/pedidos/${estId}/${encodeURIComponent(ident)}/finalizar`, {});
      
      console.log('✅ Pedido finalizado com sucesso');
      
      // Disparar eventos para atualizar listas
      window.dispatchEvent(new CustomEvent('atendimentoChanged'));
      window.dispatchEvent(new CustomEvent('pedidoUpdated'));
      
      // Se deve imprimir, chamar função de impressão
      if (shouldPrint) {
        console.log('🖨️ Imprimindo nota fiscal...');
        console.log('🖨️ shouldPrint:', shouldPrint);
        // Buscar dados completos do pedido para impressão
        try {
          const printResponse = await api.get(`/pedidos/${estId}/${encodeURIComponent(ident)}`);
          console.log('🖨️ Dados do pedido para impressão:', printResponse.data);
          if (printResponse.success && printResponse.data) {
            // Usar a mesma função de impressão do DetalhesPedido com dados completos
            console.log('🖨️ Chamando imprimirNotaFiscal com:', {
              pedido: printResponse.data.pedido,
              itens: printResponse.data.itens_exibicao || printResponse.data.itens || [],
              cliente: printResponse.data.cliente,
              pagamentos: printResponse.data.pagamentos_detalhes || []
            });
            // Buscar dados do estabelecimento
            const estabelecimento = await buscarDadosEstabelecimento();
            
            imprimirNotaFiscal(
              printResponse.data.pedido, 
              printResponse.data.itens_exibicao || printResponse.data.itens || [],
              printResponse.data.cliente,
              printResponse.data.pagamentos_detalhes || [],
              estabelecimento
            );
            console.log('✅ Nota fiscal enviada para impressão');
            
            // Aguardar um pouco antes de redirecionar para dar tempo da impressão
            setTimeout(() => {
              window.location.assign('/home');
            }, 1000);
            return; // Sair da função aqui para não redirecionar imediatamente
          } else {
            console.error('❌ Resposta da API não contém dados válidos:', printResponse);
          }
        } catch (error) {
          console.error('❌ Erro ao buscar dados para impressão:', error);
        }
      } else {
        console.log('🖨️ shouldPrint é false, não imprimindo');
      }
      
      // Redirecionar para home (apenas se não for para imprimir)
      window.location.assign('/home');
      
    } catch (error) {
      console.error('❌ Erro ao finalizar pedido:', error);
      alert('Erro ao finalizar pedido: ' + error.message);
    } finally {
      setFinalizing(false);
      setConfirmFinalizeOpen(false);
    }
  };

  // Função para aplicar desconto
  const handleApplyDiscount = async (value, isPercentage) => {
    try {
      setApplyingDiscount(true);
      
      const estabelecimentoId = localStorage.getItem('estabelecimentoId');
      if (!estabelecimentoId) {
        throw new Error('Estabelecimento não identificado');
      }

      let discountValue = value;
      if (isPercentage && value > 0) {
        discountValue = (subtotal * value) / 100;
      }

      console.log('💾 Aplicando desconto:', { value, isPercentage, discountValue, subtotal });

      // Salvar desconto na tabela pedidos
      const response = await api.put(`/pedidos/${estabelecimentoId}/${encodeURIComponent(identificacao)}/discount`, {
        desconto: discountValue
      });

      if (response.success) {
        setDesconto(discountValue);
        setDescontoIsPercentage(isPercentage);
        setShowDiscountDialog(false);
        console.log('✅ Desconto aplicado com sucesso:', discountValue, isPercentage ? '%' : 'R$');
        
        // Disparar evento para atualizar a listagem de pontos de atendimento
        window.dispatchEvent(new CustomEvent('pedidoUpdated'));
      } else {
        throw new Error(response.message || 'Erro ao aplicar desconto');
      }
    } catch (error) {
      console.error('❌ Erro ao aplicar desconto:', error);
      alert('Erro ao aplicar desconto: ' + error.message);
    } finally {
      setApplyingDiscount(false);
    }
  };

  // Função para aplicar acréscimo
  const handleApplySurcharge = async (value, isPercentage) => {
    try {
      setApplyingSurcharge(true);
      
      const estabelecimentoId = localStorage.getItem('estabelecimentoId');
      if (!estabelecimentoId) {
        throw new Error('Estabelecimento não identificado');
      }

      let surchargeValue = value;
      if (isPercentage && value > 0) {
        surchargeValue = (subtotal * value) / 100;
      }

      console.log('💾 Aplicando acréscimo:', { value, isPercentage, surchargeValue, subtotal });

      // Salvar acréscimo na tabela pedidos
      const response = await api.put(`/pedidos/${estabelecimentoId}/${encodeURIComponent(identificacao)}/surcharge`, {
        acrescimos: surchargeValue
      });

      if (response.success) {
        setAcrescimo(surchargeValue);
        setAcrescimoIsPercentage(isPercentage);
        setShowSurchargeDialog(false);
        console.log('✅ Acréscimo aplicado com sucesso:', surchargeValue, isPercentage ? '%' : 'R$');
        
        // Disparar evento para atualizar a listagem de pontos de atendimento
        window.dispatchEvent(new CustomEvent('pedidoUpdated'));
      } else {
        throw new Error(response.message || 'Erro ao aplicar acréscimo');
      }
    } catch (error) {
      console.error('❌ Erro ao aplicar acréscimo:', error);
      alert('Erro ao aplicar acréscimo: ' + error.message);
    } finally {
      setApplyingSurcharge(false);
    }
  };

  return (
    <aside className={`${mobileVisible ? 'flex md:flex' : 'hidden md:flex'} fixed md:top-4 md:bottom-4 md:left-24 md:w-[35%] lg:w-[30%] top-0 bottom-0 left-0 right-0 w-full bg-white border border-gray-200 md:rounded-2xl shadow-2xl z-50 flex-col`}>
      {/* Header */}
      <div className={`p-2 sm:p-3 md:p-4 ${isBalcao ? 'border-b border-gray-200' : 'border-b border-gray-200'} flex items-center gap-4 sm:gap-4`}>
        <div className="shrink-0">
          <Back onClick={() => {
            // Em telas pequenas (mobile), sempre voltar sem alerta (vai para o painel de itens)
            if (isSmallScreen) {
              onBack?.();
              return;
            }
            
            // Para telas médias e grandes, verificar se há itens pendentes
            if (isBalcao) {
              // Balcão: sair sem confirmação (não salva itens)
              onBack?.();
            } else if (totalPendingQty > 0) {
              setConfirmUnsavedOpen(true);
            } else {
              // Sem itens pendentes, voltar diretamente
              onBack?.();
            }
          }} />
        </div>
        <div className="flex-shrink-0 min-w-0 flex items-center justify-center">
          <div className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-600 truncate whitespace-nowrap px-1 max-w-16 sm:max-w-20 md:max-w-24">{label}</div>
        </div>
        {!isBalcao && (
          <div className="shrink-0 min-w-0">
            <div className="relative">
              <span className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Pencil size={14} className="sm:w-4 sm:h-4" />
              </span>
              <input
                type="text"
                value={orderName}
                onChange={handleOrderNameChange}
                placeholder="Nome do pedido"
                className="h-10 sm:h-12 pl-7 sm:pl-9 pr-2 sm:pr-3 w-56 sm:w-52 md:w-32 lg:w-48 xl:w-60 max-w-full border border-gray-300 rounded-lg sm:rounded-xl bg-white text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 p-3 md:p-4 overflow-y-auto rounded-b-2xl space-y-3 md:space-y-4 scrollbar-hide">
        <ListaItensPedido items={safeItems} onItemsChange={onItemsChange} pendingItems={pendingItems} onPendingDecrementOrDelete={onPendingDecrementOrDelete} />
        <ListaValores 
          subtotal={subtotal} 
          acrescimo={acrescimo} 
          desconto={desconto} 
          pago={valorPago}
          valorPago={valorPago}
          valorRestante={valorRestanteCalculado}
          showAcrescimo={acrescimo > 0}
          showDesconto={desconto > 0}
          mode="details"
        />
        
      </div>

      {/* Footer */}
      <div className="p-3 md:p-4 border-t border-gray-200">
        <div className="flex items-center justify-between gap-2 md:gap-3 mb-2 md:mb-3">
            <Surcharge onClick={() => setShowSurchargeDialog(true)} />
            <Discount onClick={() => setShowDiscountDialog(true)} />
            <KitchenButton />
            <button
              onClick={async () => {
                try {
                  // Verificar se há itens selecionados para imprimir
                  if (!pendingItems || pendingItems.length === 0) {
                    alert('Nenhum item selecionado para imprimir na cozinha');
                    return;
                  }

                  // Buscar dados básicos do pedido
                  const estId = Number(localStorage.getItem('estabelecimentoId')) || null;
                  if (!estId) {
                    alert('Estabelecimento não identificado');
                    return;
                  }
                  
                  const ident = String(identificacao || '').toLowerCase();
                  const printResponse = await api.get(`/pedidos/${estId}/${encodeURIComponent(ident)}`);
                  
                  if (printResponse.success && printResponse.data) {
                    // Buscar dados do vendedor e usuário
                    const vendedor = printResponse.data.pedido?.vendido_por || 'Sistema';
                    const usuarioId = printResponse.data.pedido?.usuario_id || null;
                    
                    // Buscar dados do estabelecimento
                    const estabelecimento = await buscarDadosEstabelecimento();
                    
                    // Imprimir nota de cozinha com itens selecionados
                    imprimirNotaCozinha(
                      printResponse.data.pedido,
                      pendingItems, // Apenas itens selecionados (não salvos)
                      identificacao,
                      orderName || printResponse.data.nome_ponto,
                      vendedor,
                      usuarioId,
                      estabelecimento
                    );
                    console.log('✅ Nota de cozinha enviada para impressão');
                  } else {
                    alert('Erro ao buscar dados do pedido para impressão');
                  }
                } catch (error) {
                  console.error('❌ Erro ao imprimir nota de cozinha:', error);
                  alert('Erro ao imprimir nota de cozinha: ' + error.message);
                }
              }}
              className="w-12 h-12 md:w-14 md:h-14 bg-white hover:bg-gray-50 text-gray-700 rounded-xl border border-gray-200 shadow-sm hover:shadow-md flex items-center justify-center transition-all duration-200"
              title="Imprimir para Cozinha"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </button>
            <DeleteButton square onClick={() => setConfirmOpen(true)} variant="white-red" />
        </div>
        <button
          type="button"
          onClick={() => {
            if (isBalcao) {
              // Balcão: finalizar direto (compra e paga na hora)
              setConfirmFinalizeOpen(true);
            } else if (pagamentoFinalizado && valorRestanteCalculado === 0) {
              // Segunda vez: finalizar o pedido de verdade (só se não houver restante)
              setConfirmFinalizeOpen(true);
            } else {
              // Primeira vez ou ainda há valor restante: abrir painel de pagamentos
              onShowPaymentPanel?.();
            }
          }}
          className="w-full h-11 md:h-12 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold transition-colors"
        >
          {isBalcao ? 'Finalizar pedido' : (pagamentoFinalizado && valorRestanteCalculado === 0 ? 'Finalizar pedido' : 'Adicionar pagamento')}
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
              } catch {
                // Ignore error
              }
            }
            const ident = String(identificacao || '').toLowerCase();
            await api.delete(`/pedidos/${estId}/${encodeURIComponent(ident)}`);
            
            // Disparar eventos para atualizar listas
            window.dispatchEvent(new CustomEvent('atendimentoChanged'));
            window.dispatchEvent(new CustomEvent('pedidoUpdated'));
            
            // Redireciona para home
            window.location.assign('/home');
          } catch {
            // Ignore error
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

      {/* Dialog de Desconto */}
      <DiscountSurchargeDialog
        isOpen={showDiscountDialog}
        onClose={() => setShowDiscountDialog(false)}
        onApply={handleApplyDiscount}
        type="discount"
        currentValue={desconto}
        currentIsPercentage={descontoIsPercentage}
        isLoading={applyingDiscount}
      />

      {/* Dialog de Acréscimo */}
      <DiscountSurchargeDialog
        isOpen={showSurchargeDialog}
        onClose={() => setShowSurchargeDialog(false)}
        onApply={handleApplySurcharge}
        type="surcharge"
        currentValue={acrescimo}
        currentIsPercentage={acrescimoIsPercentage}
        isLoading={applyingSurcharge}
      />

      {/* Modal de confirmação para finalizar pedido */}
      {confirmFinalizeOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Info className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Finalizar pedido</h3>
              </div>
              <button
                onClick={() => {
                  setConfirmFinalizeOpen(false);
                  setShouldPrint(false);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-600">
                Deseja finalizar este pedido? O ponto de atendimento será limpo e o pedido ficará com status 'finalizado'.
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-center gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => {
                  setShouldPrint(false);
                  handleFinalizeOrder();
                }}
                disabled={finalizing}
                className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {finalizing && (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                )}
                Finalizar
              </button>
              
              <button
                onClick={async () => {
                  try {
                    setFinalizing(true);
                    
                    // PRIMEIRO: Imprimir a nota fiscal
                    console.log('🖨️ Imprimindo nota fiscal...');
                    const estId = Number(localStorage.getItem('estabelecimentoId')) || null;
                    if (!estId) {
                      alert('Estabelecimento não identificado');
                      return;
                    }
                    
                    const ident = String(identificacao || '').toLowerCase();
                    const printResponse = await api.get(`/pedidos/${estId}/${encodeURIComponent(ident)}`);
                    
                    if (printResponse.success && printResponse.data) {
                      // Buscar dados do estabelecimento
                      const estabelecimento = await buscarDadosEstabelecimento();
                      
                      imprimirNotaFiscal(
                        printResponse.data.pedido, 
                        printResponse.data.itens_exibicao || printResponse.data.itens || [],
                        printResponse.data.cliente,
                        printResponse.data.pagamentos_detalhes || [],
                        estabelecimento
                      );
                      console.log('✅ Nota fiscal enviada para impressão');
                      
                      // Aguardar um pouco para a impressão processar
                      await new Promise(resolve => setTimeout(resolve, 1000));
                      
                      // SEGUNDO: Finalizar o pedido
                      console.log('🏁 Finalizando pedido...');
                      await handleFinalizeOrder();
                      
                    } else {
                      alert('Erro ao buscar dados do pedido para impressão');
                    }
                  } catch (error) {
                    console.error('❌ Erro ao finalizar e imprimir:', error);
                    alert('Erro ao finalizar e imprimir: ' + error.message);
                  } finally {
                    setFinalizing(false);
                  }
                }}
                disabled={finalizing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {finalizing && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                Finalizar e Imprimir
              </button>
            </div>
          </div>
        </div>
      )}

    </aside>
  );
};

export default PanelDetalhes;
