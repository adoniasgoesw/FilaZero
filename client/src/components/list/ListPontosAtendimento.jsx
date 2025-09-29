import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Users, Clock, Flag, DollarSign, Lock } from 'lucide-react';
import api from '../../services/api';

// Configuração de status (cores e ícone) no estilo do design fornecido
const STATUS_CONFIG = {
  'disponivel': {
    label: 'Disponível',
    classes: 'bg-gray-100 text-gray-800',
    borderColor: 'border-gray-300',
    Icon: CheckCircle2,
  },
  'aberto': {
    label: 'Aberto',
    classes: 'bg-blue-100 text-blue-800',
    borderColor: 'border-blue-300',
    Icon: Clock,
  },
  'ocupada': {
    label: 'Ocupada',
    classes: 'bg-emerald-100 text-emerald-800',
    borderColor: 'border-emerald-300',
    Icon: Users,
  },
  'em-atendimento': {
    label: 'Em Atendimento',
    classes: 'bg-purple-100 text-purple-800',
    borderColor: 'border-purple-300',
    Icon: Lock,
  },
  'finalizada': {
    label: 'Finalizada',
    classes: 'bg-gray-100 text-gray-800',
    borderColor: 'border-gray-300',
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



const formatCurrency = (value) => {
  if (!value) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const parseIdentificacao = (identificacao) => {
  const str = String(identificacao || '').trim();
  const match = str.match(/^(Balcão|Mesa|Comanda)\s*(.+)$/i);
  if (match) {
    const tipo = match[1];
    const numero = match[2];
    return { 
      tipo: tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase(), 
      numero: numero.padStart(2, '0') // Garantir formato 01, 02, etc.
    };
  }
  return { tipo: 'Ponto', numero: String(identificacao || '') };
};

const ListPontosAtendimento = ({ estabelecimentoId: propEstabelecimentoId, search = '' }) => {
  const estabId = (propEstabelecimentoId ?? Number(localStorage.getItem('estabelecimentoId'))) || null;
  const [lastClickedId, setLastClickedId] = useState(null);
  const navigate = useNavigate();

  // Usar tempo real para pontos de atendimento (atualização a cada 5 segundos)
  // Estados para pontos de atendimento
  const [pontosAtendimento, setPontosAtendimento] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Função para buscar pontos de atendimento
  const fetchPontosAtendimento = useCallback(async () => {
    if (!estabId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/pontos-atendimento/${estabId}`);
      if (response.success) {
        setPontosAtendimento(response.data || []);
      } else {
        setError(response.message || 'Erro ao carregar pontos de atendimento');
      }
    } catch (err) {
      setError('Erro ao carregar pontos de atendimento');
      console.error('Erro ao buscar pontos de atendimento:', err);
    } finally {
      setIsLoading(false);
    }
  }, [estabId]);

  // Buscar pontos quando o componente montar ou estabelecimentoId mudar
  useEffect(() => {
    fetchPontosAtendimento();
  }, [fetchPontosAtendimento]);

  // Escutar eventos de atualização em tempo real
  useEffect(() => {
    const handleRefreshPontosAtendimento = () => {
      console.log('🔄 ListPontosAtendimento - Evento de atualização recebido, recarregando pontos...');
      fetchPontosAtendimento();
    };

    window.addEventListener('refreshPontosAtendimento', handleRefreshPontosAtendimento);
    
    return () => {
      window.removeEventListener('refreshPontosAtendimento', handleRefreshPontosAtendimento);
    };
  }, [fetchPontosAtendimento]);

  // Filtrar itens baseado na pesquisa
  const filteredItems = useMemo(() => {
    const items = pontosAtendimento.length > 0 ? pontosAtendimento : [];
    if (!search.trim()) return items;
    
    const query = search.toLowerCase().trim();
    return items.filter(item => {
      const identificacao = String(item.identificacao || '').toLowerCase();
      const nomePedido = String(item.nomePedido || '').toLowerCase();
      const status = String(item.status || '').toLowerCase();
      const total = formatCurrency(item.total || 0).toLowerCase();
      
      return identificacao.includes(query) || 
             nomePedido.includes(query) || 
             status.includes(query) || 
             total.includes(query);
    });
  }, [pontosAtendimento, search]);

  const handleItemClick = useCallback((item) => {
    setLastClickedId(item.id);
    
    // Navegar para o ponto de atendimento
    navigate(`/ponto-atendimento/${item.id}`);
  }, [navigate]);



  // Mostrar loading
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[40vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando pontos de atendimento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[40vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-emerald-500 mb-4">
            <Users className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar pontos</h3>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button onClick={fetchPontosAtendimento} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!filteredItems.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 min-h-[40vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <Users className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-600">
            {search ? 'Nenhum ponto encontrado' : 'Nenhum ponto de atendimento encontrado'}
          </p>
          <p className="text-gray-500 text-sm">
            {search ? 'Tente ajustar os termos de pesquisa.' : 'Configure os pontos de atendimento para começar.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mt-4 mb-10 sm:mt-6 sm:mb-10 md:mt-0 md:mb-6">
      {filteredItems.map((item) => {
        const status = normalizeStatus(item.status);
        const config = STATUS_CONFIG[status];
        const { tipo, numero } = parseIdentificacao(item.identificacao);
        const isLastClicked = lastClickedId === item.id;
        
          return (
          <div
            key={item.id}
            onClick={() => handleItemClick(item)}
            className={`
              relative bg-white rounded-lg sm:rounded-xl shadow-sm border-2 p-2 sm:p-3 md:p-4 cursor-pointer transition-all duration-200
              hover:shadow-md hover:-translate-y-1 hover:border-emerald-300
              ${isLastClicked ? 'border-green-500' : config.borderColor}
            `}
          >
            {/* Header com tipo e número */}
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <div>
                <h3 className="font-bold text-gray-600 text-sm sm:text-base">{tipo} {numero}</h3>
              </div>
              
              {/* Status badge com ícone */}
              <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium flex items-center gap-1 ${config.classes}`}>
                <config.Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span className="hidden sm:inline">{config.label}</span>
              </span>
            </div>

            {/* Conteúdo do card */}
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Users className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                <span className={`text-xs sm:text-sm truncate font-medium ${
                  item.nomePedido && item.nomePedido !== 'Aguardando o cliente' 
                    ? 'text-gray-700' 
                    : 'text-gray-500 font-semibold italic'
                }`}>
                  {item.nomePedido || 'Aguardando cliente'}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 sm:gap-2">
                <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                <span className="text-xs sm:text-sm font-medium text-emerald-600">
                  {formatCurrency(item.total || 0)}
                </span>
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
};

export default ListPontosAtendimento;