import React, { useEffect, useState, useCallback } from 'react';
import { History, Calculator, Clock, User, CreditCard, ShoppingBag } from 'lucide-react';
import SearchBar from '../components/layout/SeachBar';
import OpenButton from '../components/buttons/Open';
import BaseModal from '../components/modals/Base';
import FormCaixa from '../components/forms/FormCaixa';
import FormFecharCaixa from '../components/forms/FormFecharCaixa';
import ListCaixas from '../components/list/ListCaixas';
import ListHistoricoPedidos from '../components/list/ListHistoricoPedidos';
import ListMovimentacoesCaixa from '../components/list/ListMovimentacoesCaixa';
import ListPagamentoHistorico from '../components/list/ListPagamentoHistorico';
import DetalhesPedido from '../components/elements/DetalhesPedido';
import DetalhesCaixa from '../components/elements/DetalhesCaixa';
import api from '../services/api';
import ConfirmDialog from '../components/elements/ConfirmDialog';
import { Plus, Minus, Calendar, Printer, Info } from 'lucide-react';
import { imprimirNotaCaixa } from '../services/notaFiscalPrint';

const formatDateTime = (iso) => {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short'
    }).format(d);
  } catch {
    return iso;
  }
};

function Historic() {
  const [isOpenModalOpen, setIsOpenModalOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const [estabelecimentoId, setEstabelecimentoId] = useState(null);
  const [caixaAbertoInfo, setCaixaAbertoInfo] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [inputValor, setInputValor] = useState('');
  const [inputDescricao, setInputDescricao] = useState('');
  const [isDetalhesModalOpen, setIsDetalhesModalOpen] = useState(false);
  const [detalhesPedido, setDetalhesPedido] = useState(null);
  const [itensPedido, setItensPedido] = useState([]);
  const [clientePedido, setClientePedido] = useState(null);
  const [pagamentosPedido, setPagamentosPedido] = useState([]);
  const [totalVendasPedidos, setTotalVendasPedidos] = useState(0);
  const [isLoadingCaixa, setIsLoadingCaixa] = useState(false);
  const [caixaDetalhes, setCaixaDetalhes] = useState(null);
  const [showCaixaDetalhes, setShowCaixaDetalhes] = useState(false);
  const [printData, setPrintData] = useState(null);
  
  // Estados para controle das abas
  const [activeTab, setActiveTab] = useState('pedidos'); // 'pedidos', 'pagamentos', 'movimentacoes'
  const [search, setSearch] = useState('');

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

  useEffect(() => {
    const id = Number(localStorage.getItem('estabelecimentoId')) || null;
    setEstabelecimentoId(id);
    
    // Verificar se há caixa aberto no localStorage para evitar delay
    const caixaAbertoStorage = localStorage.getItem('caixaAbertoInfo');
    if (caixaAbertoStorage) {
      try {
        const caixaData = JSON.parse(caixaAbertoStorage);
        if (caixaData && caixaData.caixa) {
          setCaixaAbertoInfo(caixaData);
          setIsLoadingCaixa(false);
          console.log('💰 Historic - Caixa aberto carregado do localStorage:', caixaData);
        }
      } catch (error) {
        console.error('Erro ao carregar caixa do localStorage:', error);
      }
    }
  }, []);

  // Abrir modais automaticamente via query params
  useEffect(() => {
    const url = new URL(window.location.href);
    const abrir = url.searchParams.get('abrir_caixa') === '1';
    const fecharAbrir = url.searchParams.get('fechar_abrir') === '1';
    if (abrir) setIsOpenModalOpen(true);
    if (fecharAbrir) setIsCloseModalOpen(true);
  }, []);

  const fetchCaixaAberto = React.useCallback(async () => {
    try {
      if (!estabelecimentoId) {
        setIsLoadingCaixa(false);
        return;
      }

      // Só mostrar loading se não tiver caixa aberto ainda
      if (!caixaAbertoInfo) {
        setIsLoadingCaixa(true);
      }

      const res = await api.get(`/caixas/aberto/${estabelecimentoId}`);
      if (res.success) {
        // Garantir que o saldo_total esteja no objeto caixa
        const caixaData = {
          ...res.data,
          caixa: {
            ...res.data.caixa,
            saldo_total: res.data.saldo_total || res.data.caixa.saldo_total
          }
        };
        setCaixaAbertoInfo(caixaData);
        // Salvar no localStorage para evitar delay na próxima navegação
        localStorage.setItem('caixaAbertoInfo', JSON.stringify(caixaData));
        console.log('💰 Historic - Saldo total do caixa:', caixaData.caixa.saldo_total);
        // Se encontrou caixa aberto, não mostrar loading
        setIsLoadingCaixa(false);
      } else {
        setCaixaAbertoInfo(null);
        setIsLoadingCaixa(false);
      }
    } catch {
      setCaixaAbertoInfo(null);
      setIsLoadingCaixa(false);
    }
  }, [estabelecimentoId, caixaAbertoInfo]);


  useEffect(() => { 
    // Se já tem caixa aberto, não mostrar loading
    if (caixaAbertoInfo && caixaAbertoInfo.caixa) {
      setIsLoadingCaixa(false);
    } else {
      fetchCaixaAberto(); 
    }
  }, [fetchCaixaAberto, caixaAbertoInfo]);

  // Listener para eventos de mudança de caixa
  useEffect(() => {
    const handleCaixaChange = () => {
      console.log('🔄 Evento de mudança de caixa recebido');
      // Só buscar caixa aberto se não estivermos no processo de fechamento
      if (!isCloseModalOpen) {
        fetchCaixaAberto();
      }
    };

    window.addEventListener('caixaChanged', handleCaixaChange);
    window.addEventListener('refreshCaixas', handleCaixaChange);
    
    return () => {
      window.removeEventListener('caixaChanged', handleCaixaChange);
      window.removeEventListener('refreshCaixas', handleCaixaChange);
    };
  }, [estabelecimentoId, fetchCaixaAberto, isCloseModalOpen]);

  const handleCaixaSave = (data) => {
    console.log('Caixa aberto:', data);
    // Atualiza imediatamente a UI para estado "caixa aberto" (troca sem delay)
    const caixaData = { caixa: data, acrescimos: 0, retiradas: 0, total_vendas: 0 };
    setCaixaAbertoInfo(caixaData);
    // Salvar no localStorage para evitar delay na próxima navegação
    localStorage.setItem('caixaAbertoInfo', JSON.stringify(caixaData));
    
    setIsOpenModalOpen(false);
    // Disparar refresh para sincronizar dados das listas
    window.dispatchEvent(new CustomEvent('refreshCaixas'));
  };

  const handleCaixaCancel = () => {
    setIsOpenModalOpen(false);
  };

  const handleVerDetalhes = async (item) => {
    // Verificar se é um caixa primeiro (tem estabelecimento_id e valor_abertura)
    if (item.estabelecimento_id && item.valor_abertura !== undefined) {
      // É um caixa
      console.log('🔍 Caixa selecionado:', item);
      setCaixaDetalhes(item);
      setShowCaixaDetalhes(true);
    } else if (item.pedido_id || item.id) {
      // É um pedido
      console.log('🔍 Pedido selecionado:', item);
      console.log('🔍 ID do pedido:', item?.pedido_id || item?.id);
      console.log('🔍 Tipo do ID:', typeof (item?.pedido_id || item?.id));
      setIsDetalhesModalOpen(true);
      
      // Buscar detalhes do pedido usando pedido_id (se disponível) ou id
      const pedidoId = item?.pedido_id || item?.id;
      if (pedidoId) {
        await fetchDetalhesPedido(pedidoId);
      }
    }
  };

  const fetchDetalhesPedido = async (pedidoId) => {
    try {
      console.log('🔍 Buscando detalhes do pedido ID:', pedidoId);
      
      
      const response = await api.get(`/pedidos/detalhes/${pedidoId}`);
      
      if (response.success) {
        const data = {
          pedido: response.data.pedido,
          itens: response.data.itens,
          cliente: response.data.cliente,
          pagamentos: response.data.pagamentos || []
        };
        
        setDetalhesPedido(data.pedido);
        setItensPedido(data.itens);
        setClientePedido(data.cliente);
        setPagamentosPedido(data.pagamentos);
        
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
    setClientePedido(null);
    setPagamentosPedido([]);
  };

  const handlePedidosLoaded = useCallback((pedidos) => {
    const total = pedidos.reduce((sum, pedido) => {
      return sum + (parseFloat(pedido.valor_total) || 0);
    }, 0);
    setTotalVendasPedidos(total);
  }, []);

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
            <SearchBar 
              placeholder={activeTab === 'pedidos' ? 'Pesquisar pedidos...' : activeTab === 'pagamentos' ? 'Pesquisar pagamentos...' : 'Pesquisar movimentações...'} 
              value={search}
              onChange={setSearch}
            />
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
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 mt-16 md:mt-4">
        {isLoadingCaixa && !caixaAbertoInfo ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[40vh] flex items-center justify-center">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              <span className="ml-3 text-gray-600">Verificando status do caixa...</span>
            </div>
          </div>
        ) : caixaAbertoInfo && caixaAbertoInfo.caixa ? (
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
                  onClick={() => { setInputValor(''); setInputDescricao(''); setShowAddModal(true); }}
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
                  onClick={() => { setInputValor(''); setInputDescricao(''); setShowWithdrawModal(true); }}
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

            {/* Header com abas - mesmo estilo da página de produtos */}
            <div className="mb-6">
              <div className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setActiveTab('pedidos')}
                      className={`py-3 px-1 border-b-2 font-semibold text-sm transition-colors ${
                        activeTab === 'pedidos'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Pedidos
                    </button>
                    <button
                      onClick={() => setActiveTab('pagamentos')}
                      className={`py-3 px-1 border-b-2 font-semibold text-sm transition-colors ${
                        activeTab === 'pagamentos'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Pagamentos
                    </button>
                    <button
                      onClick={() => setActiveTab('movimentacoes')}
                      className={`py-3 px-1 border-b-2 font-semibold text-sm transition-colors ${
                        activeTab === 'movimentacoes'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Movimentações
                    </button>
                  </nav>
                </div>
              </div>
            </div>

            {/* Conteúdo baseado na aba ativa */}
            {activeTab === 'pedidos' && (
              <>
                {console.log('🔍 Historic - Renderizando ListHistoricoPedidos com:', {
                  estabelecimentoId,
                  caixaId: caixaAbertoInfo.caixa?.id,
                  caixaAbertoInfo
                })}
                <ListHistoricoPedidos 
                  estabelecimentoId={estabelecimentoId} 
                  caixaId={caixaAbertoInfo.caixa?.id} 
                  onVerDetalhes={handleVerDetalhes}
                  onPedidosLoaded={handlePedidosLoaded}
                  searchQuery={search}
                />
              </>
            )}
      {activeTab === 'pagamentos' && (
        <ListPagamentoHistorico 
          estabelecimentoId={estabelecimentoId} 
          caixaId={caixaAbertoInfo.caixa?.id} 
          searchQuery={search}
        />
      )}
            {activeTab === 'movimentacoes' && (
              <ListMovimentacoesCaixa 
                estabelecimentoId={estabelecimentoId} 
                caixaId={caixaAbertoInfo.caixa?.id} 
                searchQuery={search}
              />
            )}
          </>
        ) : (
          <ListCaixas 
            estabelecimentoId={estabelecimentoId} 
            onVerDetalhes={handleVerDetalhes}
          />
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
            if (!inputDescricao.trim()) {
              alert('Por favor, informe uma descrição para a entrada');
              return;
            }
            await api.post('/caixas/entrada', { 
              estabelecimento_id: estabelecimentoId, 
              valor: v,
              descricao: inputDescricao.trim()
            });
            setCaixaAbertoInfo((prev) => prev ? { ...prev, entradas: Number(prev.entradas || 0) + v } : prev);
            setShowAddModal(false);
            
            // Disparar evento para atualizar movimentações em tempo real
            window.dispatchEvent(new CustomEvent('movimentacaoChanged'));
          } catch {
            // ignore
          }
        }}
        title="Adicionar Entrada"
        message={
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Descrição da entrada</label>
              <input
                type="text"
                value={inputDescricao}
                onChange={(e) => setInputDescricao(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Ex: Frete, Troco, etc."
                required
              />
            </div>
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
                required
              />
            </div>
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
            if (!inputDescricao.trim()) {
              alert('Por favor, informe uma descrição para a saída');
              return;
            }
            await api.post('/caixas/saida', { 
              estabelecimento_id: estabelecimentoId, 
              valor: v,
              descricao: inputDescricao.trim()
            });
            setCaixaAbertoInfo((prev) => prev ? { ...prev, saidas: Number(prev.saidas || 0) + v } : prev);
            setShowWithdrawModal(false);
            
            // Disparar evento para atualizar movimentações em tempo real
            window.dispatchEvent(new CustomEvent('movimentacaoChanged'));
          } catch {
            // ignore
          }
        }}
        title="Adicionar Saída"
        message={
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Descrição da saída</label>
              <input
                type="text"
                value={inputDescricao}
                onChange={(e) => setInputDescricao(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Ex: Compra de material, Retirada, etc."
                required
              />
            </div>
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
                required
              />
            </div>
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
          caixaData={caixaAbertoInfo?.caixa}
          onSave={async () => {
            // Fechar modal imediatamente
            setIsCloseModalOpen(false);
            
            // Limpar estado do caixa aberto
            setCaixaAbertoInfo(null);
            // Limpar localStorage para evitar delay na próxima navegação
            localStorage.removeItem('caixaAbertoInfo');
            
            // Disparar evento para atualizar outras páginas
            window.dispatchEvent(new CustomEvent('refreshCaixas'));
            
            // NÃO chamar fetchCaixaAberto() aqui para evitar abrir caixa aleatório
            // O estado já foi definido como null acima
            
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
        cliente={clientePedido}
        pagamentos={pagamentosPedido}
        onClose={handleCloseDetalhes}
      />

      {/* Modal de Detalhes do Caixa */}
      <BaseModal
        isOpen={showCaixaDetalhes}
        onClose={() => {
          setShowCaixaDetalhes(false);
          setCaixaDetalhes(null);
        }}
        title="Detalhes do Caixa"
        subtitle={caixaDetalhes ? `${formatDateTime(caixaDetalhes.data_abertura)} - ${formatDateTime(caixaDetalhes.data_fechamento)}` : null}
        icon={Info}
        iconBgColor="bg-gray-100"
        iconColor="text-gray-600"
        showButtons={false}
        printButton={
          <button
            onClick={async () => {
              // Usar os dados completos do componente DetalhesCaixa
              if (printData) {
                // Buscar dados do estabelecimento
                const estabelecimento = await buscarDadosEstabelecimento();
                
                imprimirNotaCaixa(
                  printData.caixa,
                  printData.movimentacoes,
                  printData.pagamentos,
                  printData.usuarioAbertura,
                  printData.usuarioFechamento,
                  estabelecimento
                );
              }
            }}
            className="w-10 h-10 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md"
            title="Imprimir"
          >
            <Printer size={18} />
          </button>
        }
      >
        <DetalhesCaixa 
          caixa={caixaDetalhes} 
          onPrintDataReady={setPrintData}
        />
      </BaseModal>
    </div>
  );
}

export default Historic;
