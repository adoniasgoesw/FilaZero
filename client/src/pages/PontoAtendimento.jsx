import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import PanelDetalhes from '../components/panels/PanelDetalhes';
import PanelItens from '../components/panels/PanelItens';
import api from '../services/api';

function PontoAtendimento() {
  const { id } = useParams();
  const [orderName, setOrderName] = useState('');
  const [isSmallScreen, setIsSmallScreen] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 899;
  });
  const [mobileDetailsOpen, setMobileDetailsOpen] = useState(false);
  // Itens persistidos (carregados do banco)
  const [orderItems, setOrderItems] = useState([]);
  // Seleções pendentes nesta sessão (contadores)
  const [pendingCounts, setPendingCounts] = useState({}); // { [produtoId]: qty }
  const [pendingPricesById, setPendingPricesById] = useState({}); // { [produtoId]: unitPrice }
  const [pendingNamesById, setPendingNamesById] = useState({}); // { [produtoId]: name }

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

  // Garantir atendimento criado na primeira abertura
  useEffect(() => {
    async function ensureAtendimento() {
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

        const identificador = String(id || '').toLowerCase();
        if (!identificador) return;
        const key = `att:ensure:${estId}:${identificador}`;
        if (sessionStorage.getItem(key)) return;
        sessionStorage.setItem(key, 'inflight');
        await api.post(`/atendimentos/ensure/${estId}/${encodeURIComponent(identificador)}`, { nome_ponto: '' });
        await api.put(`/atendimentos/${estId}/${encodeURIComponent(identificador)}/status`, { status: 'aberto' });
        sessionStorage.setItem(key, 'done');
      } catch (e) {
        // Silenciar falhas de ensure para não travar a UI
        console.warn('Falha ao garantir atendimento', e);
        // Liberar para tentar novamente em caso de erro
        try {
          const estId = parseInt(id, 10);
          const identificador = String(id || '').toLowerCase();
          const key = `att:ensure:${estId}:${identificador}`;
          sessionStorage.removeItem(key);
        } catch {}
      }
    }
    ensureAtendimento();
  }, [id]);

  const handleSave = async () => {
    try {
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

      // Mesclar persistidos + pendentes para enviar quantidades finais
      const mergedById = new Map();
      for (const it of orderItems) {
        mergedById.set(it.id, { qty: Number(it.qty) || 0, unitPrice: Number(it.unitPrice) || 0 });
      }
      for (const [pidStr, addQty] of Object.entries(pendingCounts)) {
        const pid = Number(pidStr);
        const base = mergedById.get(pid) || { qty: 0, unitPrice: pendingPricesById[pid] || 0 };
        mergedById.set(pid, { qty: (base.qty || 0) + (Number(addQty) || 0), unitPrice: base.unitPrice || (pendingPricesById[pid] || 0) });
      }
      const itensPayload = Array.from(mergedById.entries()).map(([pid, v]) => ({
        produto_id: Number(pid),
        quantidade: Number(v.qty) || 0,
        valor_unitario: Number(v.unitPrice) || 0,
      })).filter((i) => i.quantidade > 0);

      const payload = {
        nome_ponto: orderName || '',
        valor_total: itensPayload.reduce((s, i) => s + i.quantidade * i.valor_unitario, 0),
        itens: itensPayload,
      };
      await api.put(`/pedidos/${estId}/${encodeURIComponent(identificador)}`, payload);
      await api.put(`/atendimentos/${estId}/${encodeURIComponent(identificador)}/status`, { status: 'ocupada' });
      // Zerar contadores (seleções pendentes) após salvar
      setPendingCounts({});
      setPendingPricesById({});
      setPendingNamesById({});
      // Voltar para Home ao salvar
      window.location.assign('/home');
    } catch (e) {
      console.warn('Falha ao salvar pedido', e);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <PanelItens 
        estabelecimentoId={id}
        onOpenDetails={() => setMobileDetailsOpen(true)}
        onAddItem={(produto) => {
          setPendingCounts((prev) => ({ ...prev, [produto.id]: (prev[produto.id] || 0) + 1 }));
          setPendingPricesById((prev) => ({ ...prev, [produto.id]: Number(produto.valor_venda) || 0 }));
          setPendingNamesById((prev) => ({ ...prev, [produto.id]: produto.nome }));
        }}
        onSave={handleSave}
        selectedCounts={selectedCounts}
        totalSelectedCount={totalItemsCount}
        mobileHidden={isSmallScreen && mobileDetailsOpen}
      />
      <PanelDetalhes 
        identificacao={id}
        onBack={() => {
          if (isSmallScreen) setMobileDetailsOpen(false);
          else window.history.back();
        }}
        onSave={handleSave}
        mobileVisible={isSmallScreen && mobileDetailsOpen}
        orderName={orderName}
        onOrderNameChange={setOrderName}
        items={orderItems}
        pendingItems={(() => {
          const list = [];
          for (const [pidStr, qty] of Object.entries(pendingCounts)) {
            const pid = Number(pidStr);
            list.push({ id: pid, qty: Number(qty) || 0, name: pendingNamesById[pid] || `Produto ${pid}`, unitPrice: pendingPricesById[pid] || 0 });
          }
          return list.filter((i) => i.qty > 0);
        })()}
        displayItems={orderItems}
        onPendingDecrementOrDelete={(produtoId) => {
          setPendingCounts((prev) => {
            const next = { ...prev };
            const current = Number(next[produtoId] || 0);
            if (current <= 1) {
              delete next[produtoId];
            } else {
              next[produtoId] = current - 1;
            }
            return next;
          });
        }}
        onItemsChange={setOrderItems}
        isSmallScreen={isSmallScreen}
      />
    </div>
  );
}

export default PontoAtendimento;


