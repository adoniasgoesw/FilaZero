import React, { useEffect, useState } from 'react';
import { History, Calculator, Calendar, Clock, User, CreditCard, ShoppingBag } from 'lucide-react';
import SearchBar from '../components/layout/SeachBar';
import OpenButton from '../components/buttons/Open';
import BaseModal from '../components/modals/Base';
import FormCaixa from '../components/forms/FormCaixa';
import FormFecharCaixa from '../components/forms/FormFecharCaixa';
import ListCaixas from '../components/list/ListCaixas';
import ListHistoricoPedidos from '../components/list/ListHistoricoPedidos';
import DetalhesPedido from '../components/elements/DetalhesPedido';
import api from '../services/api';
import ConfirmDialog from '../components/elements/ConfirmDialog';
import { Plus, Minus } from 'lucide-react';

function Historic() {
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [estabelecimentoId, setEstabelecimentoId] = useState(null);
  const [caixaAbertoInfo, setCaixaAbertoInfo] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [inputValor, setInputValor] = useState('');
  const [isDetalhesModalOpen, setIsDetalhesModalOpen] = useState(false);
  const [detalhesPedido, setDetalhesPedido] = useState(null);
  const [itensPedido, setItensPedido] = useState([]);
  const [totalVendasPedidos, setTotalVendasPedidos] = useState(0);

  useEffect(() => {
    const id = Number(localStorage.getItem('estabelecimentoId')) || null;
    setEstabelecimentoId(id);
  }, []);

  // Abrir modais automaticamente via query params
  useEffect(() => {
    const url = new URL(window.location.href);
    const abrir = url.searchParams.get('abrir_caixa') === '1';
    const fecharAbrir = url.searchParams.get('fechar_abrir') === '1';
    if (abrir) setIsOpenModalOpen(true);
    if (fecharAbrir) setIsCloseModalOpen(true);
  }, []);

  const fetchCaixaAberto = async () => {
    try {
      if (!estabelecimentoId) return;
      const res = await api.get(`/caixas/aberto/${estabelecimentoId}`);
      if (res.success) {
        setCaixaAbertoInfo(res.data);
      }
    } catch {
      setCaixaAbertoInfo(null);
    }
  };

  useEffect(() => { fetchCaixaAberto(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estabelecimentoId]);

  const handleCaixaSave = (data) => {
    console.log('Caixa aberto:', data);
    // Atualiza imediatamente a UI para estado "caixa aberto" (troca sem delay)
    setCaixaAbertoInfo({ caixa: data, acrescimos: 0, retiradas: 0, total_vendas: 0 });
    setIsOpenModalOpen(false);
    // Disparar refresh para sincronizar dados das listas
    window.dispatchEvent(new CustomEvent('refreshCaixas'));
  };

  const handleCaixaCancel = () => {
    setIsOpenModalOpen(false);
  };

  const handleVerDetalhes = async (pedido) => {
    console.log('🔍 Pedido selecionado:', pedido);
    console.log('🔍 ID do pedido:', pedido?.pedido_id || pedido?.id);
    console.log('🔍 Tipo do ID:', typeof (pedido?.pedido_id || pedido?.id));
    setIsDetalhesModalOpen(true);
    
    // Buscar detalhes do pedido usando pedido_id (se disponível) ou id
    const pedidoId = pedido?.pedido_id || pedido?.id;
    if (pedidoId) {
      await fetchDetalhesPedido(pedidoId);
    }
  };

  const fetchDetalhesPedido = async (pedidoId) => {
    try {
      console.log('🔍 Buscando detalhes do pedido ID:', pedidoId);
      
      const response = await api.get(`/pedidos/detalhes/${pedidoId}`);
      
      if (response.success) {
        setDetalhesPedido(response.data.pedido);
        setItensPedido(response.data.itens);
      } else {
        console.error('Erro ao carregar detalhes do pedido:', response.message);
      }
    } catch (err) {
      console.error('Erro ao buscar detalhes do pedido:', err);
    }
  };

  const handleCloseDetalhes = () => {
    setIsDetalhesModalOpen(false);
    setDetalhesPedido(null);
    setItensPedido([]);
  };

  const handlePedidosLoaded = (pedidos) => {
    const total = pedidos.reduce((sum, pedido) => {
      return sum + (parseFloat(pedido.valor_total) || 0);
    }, 0);
    setTotalVendasPedidos(total);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col md:min-h-screen">
      {/* Header - fixo apenas em mobile */}
      <div className="fixed md:relative top-0 left-0 right-0 md:left-auto md:right-auto z-50 md:z-auto bg-white px-4 md:px-6 py-4">
        <div className="flex items-center gap-3 w-full">
          {/* Ícone da página */}
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0">
            <History size={24} />
          </div>
          
          {/* Barra de pesquisa */}
          <div className="flex-1 min-w-0">
            <SearchBar placeholder="Pesquisar histórico..." />
          </div>
          
          {/* Botão Open reduzido */}
          {caixaAbertoInfo && caixaAbertoInfo.caixa ? (
            <OpenButton variant="close" onClick={() => setIsCloseModalOpen(true)} />
          ) : (
            <OpenButton onClick={() => setIsOpenModalOpen(true)} />
          )}
        </div>
      </div>

      {/* Área de conteúdo com rolagem */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 mt-16 md:mt-8">
        {caixaAbertoInfo && caixaAbertoInfo.caixa ? (
          <>
            {/* Cards de agregados */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="text-xs text-gray-500 mb-1">Valor de Abertura</div>
                <div className="text-lg font-bold text-emerald-700">{new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(caixaAbertoInfo.caixa.valor_abertura || 0)}</div>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm relative">
                <div className="text-xs text-gray-500 mb-1">Entradas</div>
                <div className="text-lg font-bold text-emerald-700">{new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(caixaAbertoInfo.entradas || 0)}</div>
                <button
                  onClick={() => { setInputValor(''); setShowAddModal(true); }}
                  className="absolute bottom-2 right-2 w-10 h-10 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center"
                  title="Adicionar entrada"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm relative">
                <div className="text-xs text-gray-500 mb-1">Saídas</div>
                <div className="text-lg font-bold text-orange-700">{new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(caixaAbertoInfo.saidas || 0)}</div>
                <button
                  onClick={() => { setInputValor(''); setShowWithdrawModal(true); }}
                  className="absolute bottom-2 right-2 w-10 h-10 rounded-lg bg-orange-600 hover:bg-orange-700 text-white flex items-center justify-center"
                  title="Adicionar saída"
                >
                  <Minus className="w-5 h-5" />
                </button>
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="text-xs text-gray-500 mb-1">Total de Vendas</div>
                <div className="text-lg font-bold text-emerald-700">{new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(totalVendasPedidos)}</div>
              </div>
            </div>
            <ListHistoricoPedidos 
              estabelecimentoId={estabelecimentoId} 
              caixaId={caixaAbertoInfo.caixa?.id} 
              onVerDetalhes={handleVerDetalhes}
              onPedidosLoaded={handlePedidosLoaded}
            />
          </>
        ) : (
          <ListCaixas estabelecimentoId={estabelecimentoId} />
        )}
      </div>

      {/* Modal de Abrir Caixa */}
      <BaseModal
        isOpen={isOpenModalOpen}
        onClose={() => setIsOpenModalOpen(false)}
        title="Abrir Caixa"
        icon={Calculator}
        iconBgColor="bg-emerald-100"
        iconColor="text-emerald-600"
      >
        <FormCaixa
          onCancel={handleCaixaCancel}
          onSave={handleCaixaSave}
        />
      </BaseModal>

      {/* Dialog Acréscimo */}
      <ConfirmDialog
        isOpen={!!showAddModal}
        onClose={() => setShowAddModal(false)}
        onSecondary={() => setShowAddModal(false)}
        onPrimary={async () => {
          try {
            const v = Number(inputValor);
            if (Number.isNaN(v) || v <= 0) return;
            await api.post('/caixas/entrada', { estabelecimento_id: estabelecimentoId, valor: v });
            setCaixaAbertoInfo((prev) => prev ? { ...prev, entradas: Number(prev.entradas || 0) + v } : prev);
            setShowAddModal(false);
          } catch {
            // ignore
          }
        }}
        title="Adicionar Entrada"
        message={
          <div>
            <label className="block text-sm text-gray-700 mb-1">Valor da entrada</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={inputValor}
              onChange={(e) => setInputValor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="0,00"
            />
          </div>
        }
        primaryLabel="Salvar"
        secondaryLabel="Cancelar"
        variant="success"
        rightAlign
      />

      {/* Dialog Retirada */}
      <ConfirmDialog
        isOpen={!!showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onSecondary={() => setShowWithdrawModal(false)}
        onPrimary={async () => {
          try {
            const v = Number(inputValor);
            if (Number.isNaN(v) || v <= 0) return;
            await api.post('/caixas/saida', { estabelecimento_id: estabelecimentoId, valor: v });
            setCaixaAbertoInfo((prev) => prev ? { ...prev, saidas: Number(prev.saidas || 0) + v } : prev);
            setShowWithdrawModal(false);
          } catch {
            // ignore
          }
        }}
        title="Adicionar Saída"
        message={
          <div>
            <label className="block text-sm text-gray-700 mb-1">Valor da saída</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={inputValor}
              onChange={(e) => setInputValor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="0,00"
            />
          </div>
        }
        primaryLabel="Salvar"
        secondaryLabel="Cancelar"
        variant="warning"
        rightAlign
      />

      {/* Modal de Fechar Caixa */}
      <BaseModal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        title="Fechar Caixa"
        icon={Calculator}
        iconBgColor="bg-orange-100"
        iconColor="text-orange-600"
      >
        <FormFecharCaixa
          onSave={async () => {
            // Troca imediata para estado "sem caixa aberto" (sem delay)
            setCaixaAbertoInfo(null);
            setIsCloseModalOpen(false);
            // Sincroniza em background
            fetchCaixaAberto();
            window.dispatchEvent(new CustomEvent('refreshCaixas'));
            // Se vier da intenção de "fechar e abrir", abrir o modal de abertura em seguida
            const url = new URL(window.location.href);
            const fecharAbrir = url.searchParams.get('fechar_abrir') === '1';
            if (fecharAbrir) {
              // Limpa o param e abre modal de abrir
              url.searchParams.delete('fechar_abrir');
              window.history.replaceState(null, '', url.toString());
              setIsOpenModalOpen(true);
            }
          }}
        />
      </BaseModal>

      {/* Modal de Detalhes do Pedido */}
      <DetalhesPedido
        isOpen={isDetalhesModalOpen}
        pedido={detalhesPedido}
        itens={itensPedido}
        onClose={handleCloseDetalhes}
      />
    </div>
  );
}

export default Historic;
