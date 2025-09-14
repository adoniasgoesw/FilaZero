import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Users, Clock, Flag, DollarSign } from 'lucide-react';
import api from '../../services/api';
import { readCache, writeCache } from '../../services/cache';

// Configuração de status (cores e ícone) no estilo do design fornecido
const STATUS_CONFIG = {
  'disponivel': {
    label: 'Disponível',
    classes: 'bg-gray-100 text-gray-800 border border-gray-200',
    Icon: CheckCircle2,
  },
  'aberto': {
    label: 'Aberto',
    classes: 'bg-blue-100 text-blue-800 border border-blue-200',
    Icon: Clock,
  },
  'ocupada': {
    label: 'Ocupada',
    classes: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    Icon: Users,
  },
  'em-atendimento': {
    label: 'Em Atendimento',
    classes: 'bg-purple-100 text-purple-800 border border-purple-200',
    Icon: Clock,
  },
  'finalizada': {
    label: 'Finalizada',
    classes: 'bg-gray-100 text-gray-800 border border-gray-200',
    Icon: Flag,
  },
};

const normalizeStatus = (status) => {
  const map = {
    'disponivel': 'disponivel',
    'aberto': 'aberto',
    'aberta': 'aberto',
    'ocupada': 'ocupada',
    'em-atendimento': 'em-atendimento',
    'atendimento': 'em-atendimento',
    'finalizada': 'finalizada',
  };
  return map[String(status || '').toLowerCase()] || 'disponivel';
};

const DEFAULT_ITEMS = [
  { id: 1, identificacao: 'Mesa 1', nomePedido: 'João', status: 'disponivel', total: 0 },
  { id: 2, identificacao: 'Mesa 2', nomePedido: 'Família Silva', status: 'aberta', total: 128.9 },
  { id: 3, identificacao: 'Mesa 3', nomePedido: 'Casal', status: 'ocupada', total: 76.5 },
  { id: 4, identificacao: 'Comanda 12', nomePedido: 'André', status: 'atendimento', total: 52.0 },
  { id: 5, identificacao: 'Comanda 50', nomePedido: 'Equipe Mesa', status: 'finalizada', total: 0 },
  { id: 6, identificacao: 'Mesa 7', nomePedido: '—', status: 'finalizada', total: 0 },
];

const formatCurrency = (value) => {
  if (!value) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const parseIdentificacao = (identificacao) => {
  const str = String(identificacao || '').trim();
  const match = str.match(/^(Mesa|Comanda)\s*(.+)$/i);
  if (match) {
    const tipo = match[1];
    const numero = match[2];
    return { tipo: tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase(), numero };
  }
  return { tipo: 'Ponto', numero: String(identificacao || '') };
};

const ListPontosAtendimento = ({ estabelecimentoId: propEstabelecimentoId, search = '' }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const estabId = (propEstabelecimentoId ?? Number(localStorage.getItem('estabelecimentoId'))) || null;
  const [lastClickedId, setLastClickedId] = useState(null);
  const [hintVisibleId, setHintVisibleId] = useState(null);
  const navigate = useNavigate();

  const fetchPoints = useCallback(async () => {
    let isMounted = true;
    try {
      const cacheKey = `pontos:${estabId || 'none'}`;
      const cached = readCache(cacheKey);
      if (cached && Array.isArray(cached)) {
        setItems(cached);
        setLoading(false);
      } else {
        setLoading(true);
      }
      setError(null);
      if (estabId) {
        try {
          const res = await api.get(`/pontos-atendimento/${estabId}`);
          if (res && res.success) {
            if (isMounted) {
              setItems(res.data || []);
              writeCache(cacheKey, res.data || []);
            }
          } else {
            const cfgRes = await api.get(`/pontos-atendimento/config/${estabId}`);
            if (cfgRes && cfgRes.success && cfgRes.data) {
              const cfg = cfgRes.data;
              const generated = [];
              if (cfg.mesasEnabled) {
                for (let i = 1; i <= Number(cfg.quantidadeMesas || 0); i += 1) {
                  generated.push({ id: `mesa-${i}`, identificacao: `Mesa ${i}`, status: 'disponivel', total: 0 });
                }
              }
              if (cfg.comandasEnabled) {
                for (let i = 1; i <= Number(cfg.quantidadeComandas || 0); i += 1) {
                  const label = cfg.prefixoComanda && cfg.prefixoComanda.trim() ? `${cfg.prefixoComanda.trim()} ${i}` : `Comanda ${i}`;
                  generated.push({ id: `comanda-${i}`, identificacao: label, status: 'disponivel', total: 0 });
                }
              }
              if (isMounted) {
                setItems(generated);
                writeCache(cacheKey, generated);
              }
            } else if (isMounted) {
              setItems(DEFAULT_ITEMS);
            }
          }
        } catch (err) {
          console.debug('List fetch error, falling back to config:', err);
          try {
            const cfgRes = await api.get(`/pontos-atendimento/config/${estabId}`);
            if (cfgRes && cfgRes.success && cfgRes.data) {
              const cfg = cfgRes.data;
              const generated = [];
              if (cfg.mesasEnabled) {
                for (let i = 1; i <= Number(cfg.quantidadeMesas || 0); i += 1) {
                  generated.push({ id: `mesa-${i}`, identificacao: `Mesa ${i}`, status: 'disponivel', total: 0 });
                }
              }
              if (cfg.comandasEnabled) {
                for (let i = 1; i <= Number(cfg.quantidadeComandas || 0); i += 1) {
                  const label = cfg.prefixoComanda && cfg.prefixoComanda.trim() ? `${cfg.prefixoComanda.trim()} ${i}` : `Comanda ${i}`;
                  generated.push({ id: `comanda-${i}`, identificacao: label, status: 'disponivel', total: 0 });
                }
              }
              if (isMounted) {
                setItems(generated);
                writeCache(cacheKey, generated);
              }
            } else if (isMounted) {
              setItems(DEFAULT_ITEMS);
            }
          } catch (innerErr) {
            console.debug('Config fetch fallback error:', innerErr);
            if (isMounted) setItems(DEFAULT_ITEMS);
          }
        }
      } else {
        if (isMounted) setItems(DEFAULT_ITEMS);
      }
    } catch (e) {
      setError(e.message || 'Erro ao carregar pontos de atendimento');
      setItems(DEFAULT_ITEMS);
    } finally {
      if (isMounted) setLoading(false);
    }
    return () => { isMounted = false; };
  }, [estabId]);

  useEffect(() => {
    fetchPoints();
  }, [fetchPoints]);

  // Atualizar em tempo real após salvar configurações
  useEffect(() => {
    const onSaved = () => {
      fetchPoints();
    };
    window.addEventListener('modalSaveSuccess', onSaved);
    return () => {
      window.removeEventListener('modalSaveSuccess', onSaved);
    };
  }, [fetchPoints]);

  const filtered = useMemo(() => {
    const q = (search || '').toLowerCase().trim();
    if (!q) return items;
    return items.filter((i) =>
      String(i.identificacao).toLowerCase().includes(q) ||
      String(i.nomePedido || '').toLowerCase().includes(q) ||
      (() => {
        const normalized = normalizeStatus(i.status);
        const label = STATUS_CONFIG[normalized]?.label || String(i.status);
        return String(label).toLowerCase().includes(q);
      })()
    );
  }, [items, search]);

  return (
    <div>
      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-sm text-gray-600">Carregando...</span>
        </div>
      )}

      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      

      {/* Grid responsiva: <390px=1, ≥390px=2, ≥890px=3, ≥1500px=4 */}
      <div className="grid grid-cols-1 [@media(min-width:390px)]:grid-cols-2 [@media(min-width:890px)]:grid-cols-3 [@media(min-width:900px)]:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        {filtered.map((item) => {
          const { tipo, numero } = parseIdentificacao(item.identificacao);
          const normalized = normalizeStatus(item.status);
          const statusInfo = STATUS_CONFIG[normalized] || STATUS_CONFIG['disponivel'];
          const StatusIcon = statusInfo.Icon;
          return (
            <div
              key={item.id}
              className="relative bg-white rounded-xl shadow-lg border border-slate-200 p-3 max-[430px]:p-2.5 md:p-4 lg:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
              onClick={async () => {
                // Bloquear se caixa fechado
                try {
                  if (estabId) {
                    const res = await api.get(`/caixas/aberto/${estabId}`);
                    const aberto = res && res.success ? res.data : null;
                    if (!aberto) {
                      window.location.assign('/home?caixa_fechado=1');
                      return;
                    }
                  }
                } catch {
                  // ignore network errors
                }
                // Se não está disponível (ex.: aberto/ocupada), abre direto
                if (normalized !== 'disponivel') {
                  navigate(`/ponto-atendimento/${encodeURIComponent(item.id)}`);
                  return;
                }
                // Está disponível: primeiro toque mostra dica; segundo toque abre e altera status
                if (lastClickedId === item.id) {
                  try {
                    if (estabId) {
                      await api.post(`/atendimentos/ensure/${estabId}/${encodeURIComponent(item.id)}`, { nome_ponto: '' });
                      await api.put(`/atendimentos/${estabId}/${encodeURIComponent(item.id)}/status`, { status: 'aberto' });
                      setItems((prev) => prev.map((it) => (it.id === item.id ? { ...it, status: 'aberto' } : it)));
                    }
                  } catch {
                    /* ignore */
                  }
                  navigate(`/ponto-atendimento/${encodeURIComponent(item.id)}`);
                } else {
                  setLastClickedId(item.id);
                  setHintVisibleId(item.id);
                  setTimeout(() => {
                    setHintVisibleId((current) => (current === item.id ? null : current));
                    setLastClickedId((current) => (current === item.id ? null : current));
                  }, 1500);
                }
              }}
            >
              {normalized === 'disponivel' && hintVisibleId === item.id && (
                <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center z-10">
                  <span className="px-3 py-1.5 bg-white/95 text-slate-800 text-xs font-medium rounded-full shadow">Toque para abrir</span>
                </div>
              )}
              {/* Header do Card */}
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2.5 md:mb-4 gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-800 text-sm max-[430px]:text-[13px] md:text-base lg:text-lg leading-tight whitespace-nowrap">{tipo} {numero}</h3>
                    <div className={`text-[11px] max-[430px]:text-[10px] md:text-sm font-medium ${item.nomePedido ? 'text-slate-700' : 'text-slate-400 italic'} leading-tight whitespace-nowrap`}>
                      {item.nomePedido || 'Aguardando cliente'}
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] max-[430px]:text-[8.5px] md:text-xs font-medium ${statusInfo.classes} whitespace-nowrap flex-shrink-0`}>
                    <StatusIcon className="w-3 h-3 md:w-3.5 md:h-3.5 mr-1" />
                    {statusInfo.label}
                  </span>
                </div>
              </div>

              {/* Informações do Pedido */}
              <div className="space-y-2 md:space-y-3">
                {/* Valor Total (apenas valor ao lado do ícone) */}
                <div className="flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 md:w-4 md:h-4 text-emerald-500" />
                  <span className="text-sm max-[430px]:text-[13px] md:text-base lg:text-lg font-bold text-emerald-600">{formatCurrency(item.total)}</span>
                </div>

                {/* Tempo (apenas contagem ao lado do ícone) */}
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-500" />
                  <span className="text-[11px] max-[430px]:text-[10px] md:text-sm font-medium text-slate-700">
                    {(item.tempo || item.tempoAtivo || item.tempoAtendimento || '—')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="text-center text-sm text-gray-600 py-8 min-h-[40vh] flex items-center justify-center">
          Nenhum ponto de atendimento encontrado.
        </div>
      )}
    </div>
  );
};

export default ListPontosAtendimento;


