import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import PanelDetalhes from '../components/panels/PanelDetalhes';
import PanelPagamentos from '../components/panels/PanelPagamentos';
import PanelItens from '../components/panels/PanelItens';
// import { useCache } from '../providers/CacheProvider'; // Removido - não está sendo usado
import api from '../services/api';

function PontoAtendimento() {
  const { id } = useParams();
  const [orderName, setOrderName] = useState('');
  const [isSmallScreen, setIsSmallScreen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 899;
  });
  const [mobileDetailsOpen, setMobileDetailsOpen] = useState(false);
  const [showPaymentPanel, setShowPaymentPanel] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPedido, setCurrentPedido] = useState(null);
  
  // Hook do cache (apenas para categorias e produtos)
  // const { } = useCache(); // Removido - não está sendo usado
  // Itens persistidos (carregados do banco)
  const [orderItems, setOrderItems] = useState([]);
  // Seleções pendentes nesta sessão (contadores)
  const [pendingCounts, setPendingCounts] = useState({}); // { [produtoId]: qty }
  const [pendingPricesById, setPendingPricesById] = useState({}); // { [produtoId]: unitPrice }
  const [pendingNamesById, setPendingNamesById] = useState({}); // { [produtoId]: name }
  // Para cada clique/adicao, guardamos o conjunto de complementos escolhido ("combo")
  // { [produtoId]: Array<Array<{ id, name, unitPrice, qty }>> }
  const [pendingCombosByProductId, setPendingCombosByProductId] = useState({});

  const selectedCounts = pendingCounts;
  const totalItemsCount = Object.values(pendingCounts).reduce((a, b) => a + (Number(b) || 0), 0);

  const orderSubtotal = React.useMemo(() => {
    // Subtotal mostrado no detalhe pode ser só dos itens persistidos; o backend recalcula total no salvar
    return orderItems.reduce((sum, it) => sum + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0), 0);
  }, [orderItems]);

  useEffect(() => {
    function handleResize() {
      const small = window.innerWidth <= 899;
      setIsSmallScreen(small);
      if (!small) setMobileDetailsOpen(false);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // Carregar usuário atual do localStorage
  useEffect(() => {
    try {
      const usuarioRaw = localStorage.getItem('usuario');
      if (usuarioRaw) {
        const usuario = JSON.parse(usuarioRaw);
        setCurrentUser(usuario);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário do localStorage:', error);
    }
  }, []);

  // Escutar evento de pagamento atualizado para limpar itens pendentes
  useEffect(() => {
    const handlePaymentUpdated = () => {
      console.log('🧹 Pagamento atualizado - limpando itens pendentes');
      setPendingCounts({});
      setPendingPricesById({});
      setPendingNamesById({});
      setPendingCombosByProductId({});
    };

    window.addEventListener('paymentUpdated', handlePaymentUpdated);
    return () => window.removeEventListener('paymentUpdated', handlePaymentUpdated);
  }, []);

  // Garantir atendimento e pedido criados na primeira abertura
  useEffect(() => {
    let isMounted = true;
    async function ensureAtendimentoAndPedido() {
      try {
        // Resolver estabelecimentoId numericamente (similar a PanelItens)
        let estId = null;
        const parsed = parseInt(id, 10);
        if (!Number.isNaN(parsed)) estId = parsed;
        if (estId === null) {
          const fromStorage = localStorage.getItem('estabelecimentoId');
          const parsedStorage = parseInt(fromStorage, 10);
          if (!Number.isNaN(parsedStorage)) estId = parsedStorage;
        }
        if (estId === null) return;
        
        // Verificar se há caixa aberto; se não, redirecionar para Home com aviso
        try {
          const res = await api.get(`/caixas/aberto/${estId}`);
          const aberto = res && res.success ? res.data : null;
          if (!aberto) {
            window.location.assign('/home?caixa_fechado=1');
            return;
          }
        } catch {
          // Se falhar, por segurança não permite prosseguir
          window.location.assign('/home?caixa_fechado=1');
          return;
        }

        const identificador = String(id || '').toLowerCase();
        if (!identificador) return;
        
        console.log(`🚀 Acessando ponto de atendimento: ${identificador} (Estabelecimento: ${estId})`);
        
        // Criar atendimento e pedido vazio automaticamente (sem sobrescrever nome existente)
        console.log('📝 Criando atendimento...');
        const atendimentoResponse = await api.post(`/atendimentos/ensure/${estId}/${encodeURIComponent(identificador)}`, {});
        console.log('Atendimento response:', atendimentoResponse);
        
        console.log('📝 Criando/obtendo pedido...');
        const pedidoResponse = await api.post(`/pedidos/${estId}/${encodeURIComponent(identificador)}/criar`, {});
        console.log('Pedido response:', pedidoResponse);
        
        if (pedidoResponse.success) {
          console.log('✅ Pedido processado com sucesso:', pedidoResponse.data);
          if (pedidoResponse.data.created) {
            console.log('🆕 Novo pedido criado');
          } else {
            console.log('📋 Usando pedido existente');
          }
        } else {
          console.error('❌ Erro ao processar pedido:', pedidoResponse);
        }
        
        // Carregar itens do pedido existente após criar
        if (isMounted) {
          await loadExistingOrderItems(estId, identificador);
        }
        
        console.log('✅ Atendimento e pedido processados automaticamente');
      } catch (e) {
        // Silenciar falhas de ensure para não travar a UI
        console.warn('Falha ao garantir atendimento e pedido', e);
        // Liberar para tentar novamente em caso de erro
        try {
          const estId = parseInt(id, 10);
          const identificador = String(id || '').toLowerCase();
          const key = `att:ensure:${estId}:${identificador}`;
          sessionStorage.removeItem(key);
        } catch {}
      }
    }
    ensureAtendimentoAndPedido();
    return () => { 
      isMounted = false;
    };
  }, [id]);

  // Função para carregar itens do pedido existente
  const loadExistingOrderItems = async (estId, identificador) => {
    try {
      // Usar a nova rota que busca diretamente do banco
      const res = await api.get(`/pedidos/${estId}/${encodeURIComponent(identificador)}/itens`);
      if (res.success && res.data) {
        const itens = Array.isArray(res.data.itens) ? res.data.itens : [];
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
        setOrderItems(itensMapped);
        
        // Carregar dados do pedido se disponível
        if (res.data.pedido) {
          setCurrentPedido(res.data.pedido);
        }
        
        // Carregar nome do pedido se existir (vem direto do res.data)
        if (res.data.nome_ponto && res.data.nome_ponto !== '') {
          setOrderName(res.data.nome_ponto);
          console.log('✅ PontoAtendimento - Nome do pedido carregado:', res.data.nome_ponto);
        }
        
        console.log('✅ Itens do pedido carregados diretamente do banco:', itensMapped);
      }
    } catch (e) {
      console.warn('Erro ao carregar itens do pedido existente:', e);
    }
  };

  const handleSave = async () => {
    try {
      // Bloquear salvar se caixa fechado
      let estIdCheck = null;
      const parsedA = parseInt(id, 10);
      if (!Number.isNaN(parsedA)) estIdCheck = parsedA;
      if (estIdCheck === null) {
        const fromStorageA = localStorage.getItem('estabelecimentoId');
        const parsedStorageA = parseInt(fromStorageA, 10);
        if (!Number.isNaN(parsedStorageA)) estIdCheck = parsedStorageA;
      }
      if (estIdCheck) {
        try {
          const res = await api.get(`/caixas/aberto/${estIdCheck}`);
          const aberto = res && res.success ? res.data : null;
          if (!aberto) {
            window.location.assign('/home?caixa_fechado=1');
            return;
          }
        } catch {
          window.location.assign('/home?caixa_fechado=1');
          return;
        }
      }
      // Resolve establishment id and identificador
      let estId = null;
      const parsed = parseInt(id, 10);
      if (!Number.isNaN(parsed)) estId = parsed;
      if (estId === null) {
        const fromStorage = localStorage.getItem('estabelecimentoId');
        const parsedStorage = parseInt(fromStorage, 10);
        if (!Number.isNaN(parsedStorage)) estId = parsedStorage;
      }
      if (estId === null) return;
      const identificador = String(id || '').toLowerCase();

      // Constrói payload com TODOS os itens (existentes + pendentes)
      const itensPayload = [];
      
      // 1) Adiciona itens já salvos (existentes no pedido)
      for (const it of orderItems) {
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

      // 2) Adiciona itens pendentes (selecionados nesta sessão)
      for (const [pidStr, addQtyRaw] of Object.entries(pendingCounts)) {
        const pid = Number(pidStr);
        const addQty = Math.max(1, Number(addQtyRaw) || 0);
        const unitPrice = Number(pendingPricesById[pid]) || 0;
        const combos = Array.isArray(pendingCombosByProductId[pid]) ? pendingCombosByProductId[pid] : [];
        if (combos.length === 0) {
          itensPayload.push({
            produto_id: pid,
            quantidade: addQty,
            valor_unitario: unitPrice,
            complementos: []
          });
        } else {
          // Quando há complementos, divide em unidades por complemento selecionado
          for (const combo of combos) {
            itensPayload.push({
              produto_id: pid,
              quantidade: 1,
              valor_unitario: unitPrice,
              complementos: Array.isArray(combo)
                ? combo.map((c) => ({
                    complemento_id: Number(c.id),
                    nome_complemento: String(c.name || ''),
                    quantidade: Math.max(1, Number(c.qty) || 1),
                    valor_unitario: Number(c.unitPrice) || 0
                  }))
                : []
            });
          }
          // Se sobrar quantidade sem complemento, registra também
          const remaining = Math.max(0, addQty - combos.length);
          if (remaining > 0) {
            itensPayload.push({
              produto_id: pid,
              quantidade: remaining,
              valor_unitario: unitPrice,
              complementos: []
            });
          }
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

      // Atualiza o pedido com todos os itens (existentes + novos)
      const payload = {
        nome_ponto: orderName || '',
        valor_total: finalItens.reduce((s, i) => s + i.quantidade * i.valor_unitario, 0),
        itens: finalItens,
      };
      await api.put(`/pedidos/${estId}/${encodeURIComponent(identificador)}`, payload);
      await api.put(`/atendimentos/${estId}/${encodeURIComponent(identificador)}/status`, { status: 'ocupada' });
      console.log('✅ Pedido atualizado com todos os itens');
      
      // Disparar eventos para atualizar lista de pontos de atendimento
      console.log('🔄 Disparando eventos de atualização...');
      window.dispatchEvent(new CustomEvent('atendimentoChanged'));
      window.dispatchEvent(new CustomEvent('pedidoUpdated'));
      window.dispatchEvent(new CustomEvent('refreshPontosAtendimento'));
      
      // Zerar contadores (seleções pendentes) após salvar
      setPendingCounts({});
      setPendingPricesById({});
      setPendingNamesById({});
      setPendingCombosByProductId({});
      
      // Voltar para Home ao salvar
      window.location.assign('/home');
    } catch (e) {
      console.warn('Falha ao salvar pedido', e);
    }
  };

  const handleShowPaymentPanel = () => {
    setShowPaymentPanel(true);
  };

  const handleBackFromPayment = () => {
    setShowPaymentPanel(false);
  };

  const handleFinalizeOrder = () => {
    // Limpar tudo e voltar ao painel de itens
    setOrderItems([]);
    setOrderName('');
    setPendingCounts({});
    setPendingPricesById({});
    setPendingNamesById({});
    setPendingCombosByProductId({});
    setShowPaymentPanel(false);
    setMobileDetailsOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar hideMobileFooter />
      <PanelItens 
        estabelecimentoId={id}
        onOpenDetails={() => setMobileDetailsOpen(true)}
        onAddItem={(produto, complements = []) => {
          setPendingCounts((prev) => ({ ...prev, [produto.id]: (prev[produto.id] || 0) + 1 }));
          setPendingPricesById((prev) => ({ ...prev, [produto.id]: Number(produto.valor_venda) || 0 }));
          setPendingNamesById((prev) => ({ ...prev, [produto.id]: produto.nome }));
          // Armazena um combo (um item com seu conjunto de complementos escolhido nesta adicao)
          setPendingCombosByProductId((prev) => {
            const next = { ...prev };
            const arr = Array.isArray(next[produto.id]) ? [...next[produto.id]] : [];
            const combo = Array.isArray(complements) ? complements.map((c) => ({
              id: Number(c.id),
              name: String(c.name || ''),
              unitPrice: Number(c.unitPrice) || 0,
              qty: Math.max(1, Number(c.qty) || 1)
            })) : [];
            arr.push(combo);
            next[produto.id] = arr;
            return next;
          });
        }}
        onSave={handleSave}
        selectedCounts={selectedCounts}
        totalSelectedCount={totalItemsCount}
        mobileHidden={isSmallScreen && mobileDetailsOpen}
        disabled={showPaymentPanel}
        isBalcao={String(id || '').toLowerCase().startsWith('balcao-')}
        identificacao={id}
        nomePonto={orderName}
        vendedor={currentUser?.nome || 'Sistema'}
        usuarioId={currentUser?.id}
        pedido={currentPedido}
        pendingCombosByProductId={pendingCombosByProductId}
      />
      {!showPaymentPanel ? (
        <PanelDetalhes 
          identificacao={id}
          onBack={() => {
            if (isSmallScreen) {
              setMobileDetailsOpen(false);
            } else {
              // Para telas médias e grandes, voltar para home sem recarregar
              window.history.back();
            }
          }}
          onSave={handleSave}
          mobileVisible={isSmallScreen && mobileDetailsOpen}
          orderName={orderName}
          onOrderNameChange={setOrderName}
          items={orderItems}
          pendingItems={(() => {
            const list = [];
            for (const [pidStr, combos] of Object.entries(pendingCombosByProductId)) {
              const pid = Number(pidStr);
              const name = pendingNamesById[pid] || `Produto ${pid}`;
              const unitPrice = pendingPricesById[pid] || 0;
              const arr = Array.isArray(combos) ? combos : [];
              for (const combo of arr) {
                list.push({
                  id: pid,
                  qty: 1,
                  name,
                  unitPrice,
                  complements: Array.isArray(combo) ? combo : []
                });
              }
            }
            return list;
          })()}
          displayItems={orderItems}
          onPendingDecrementOrDelete={(produtoId, signature) => {
            // Remove um combo que corresponda a esta assinatura
            const buildSignature = (complements) => {
              const list = Array.isArray(complements) ? complements : [];
              const normalized = list
                .map((c) => ({ id: Number(c.id), qty: Math.max(1, Number(c.qty) || 1) }))
                .filter((c) => c.id)
                .sort((a, b) => a.id - b.id)
                .map((c) => `${c.id}x${c.qty}`);
              return normalized.length ? normalized.join(',') : 'none';
            };
            setPendingCombosByProductId((prev) => {
              const next = { ...prev };
              const arr = Array.isArray(next[produtoId]) ? [...next[produtoId]] : [];
              const idx = arr.findIndex((combo) => buildSignature(combo) === signature);
              if (idx !== -1) arr.splice(idx, 1);
              if (arr.length === 0) delete next[produtoId]; else next[produtoId] = arr;
              return next;
            });
            setPendingCounts((prev) => {
              const next = { ...prev };
              const current = Number(next[produtoId] || 0);
              if (current <= 1) delete next[produtoId]; else next[produtoId] = current - 1;
              return next;
            });
          }}
          onItemsChange={setOrderItems}
          isSmallScreen={isSmallScreen}
          onShowPaymentPanel={handleShowPaymentPanel}
        />
      ) : (
        <PanelPagamentos
          identificacao={id}
          onBack={handleBackFromPayment}
          mobileVisible={isSmallScreen && mobileDetailsOpen}
          orderName={orderName}
          items={orderItems}
          displayItems={orderItems}
          pendingItems={(() => {
            const list = [];
            for (const [pidStr, combos] of Object.entries(pendingCombosByProductId)) {
              const pid = Number(pidStr);
              const name = pendingNamesById[pid] || `Produto ${pid}`;
              const unitPrice = pendingPricesById[pid] || 0;
              const arr = Array.isArray(combos) ? combos : [];
              for (const combo of arr) {
                list.push({
                  id: pid,
                  qty: 1,
                  name,
                  unitPrice,
                  complements: Array.isArray(combo) ? combo : []
                });
              }
            }
            return list;
          })()}
          isSmallScreen={isSmallScreen}
          onFinalizeOrder={handleFinalizeOrder}
        />
      )}
    </div>
  );
}

export default PontoAtendimento;


