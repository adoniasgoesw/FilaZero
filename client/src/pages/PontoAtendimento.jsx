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

      // Constrói payload preservando separação por complementos
      // 1) Começa dos itens já salvos (cada entrada pode ter complementos específicos)
      const itensPayload = [];
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

      // 2) Adiciona pendentes, mantendo complementos selecionados para aquele produto
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
          // Ex.: 2x Pizza Big com borda X e 1x Pizza Big com borda Y => duas entradas
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

      // 3) Normaliza e filtra
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

      const payload = {
        nome_ponto: orderName || '',
        valor_total: finalItens.reduce((s, i) => s + i.quantidade * i.valor_unitario, 0),
        itens: finalItens,
      };
      await api.put(`/pedidos/${estId}/${encodeURIComponent(identificador)}`, payload);
      try {
        await api.put(`/atendimentos/${estId}/${encodeURIComponent(identificador)}/status`, { status: 'ocupada' });
      } catch {}
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
      />
    </div>
  );
}

export default PontoAtendimento;


