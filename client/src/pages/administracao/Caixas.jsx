import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, Calendar, Printer, Info } from 'lucide-react';
import BackButton from '../../components/buttons/Back';
import MarginButton from '../../components/buttons/MarginButton';
import SearchBar from '../../components/layout/SeachBar';
import ListCaixas from '../../components/list/ListCaixas';
import DetalhesCaixa from '../../components/elements/DetalhesCaixa';
import BaseModal from '../../components/modals/Base';
import { imprimirNotaCaixa } from '../../services/notaFiscalPrint';

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

const Caixas = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [estabelecimentoId, setEstabelecimentoId] = useState(null);
  const [caixaDetalhes, setCaixaDetalhes] = useState(null);
  const [showCaixaDetalhes, setShowCaixaDetalhes] = useState(false);
  const [printData, setPrintData] = useState(null);

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
    const id = Number(localStorage.getItem('estabelecimentoId'));
    setEstabelecimentoId(id);
  }, []);

  const handleBack = () => {
    navigate('/home');
  };

  const handleVerDetalhes = (caixa) => {
    console.log('Ver detalhes do caixa:', caixa);
    setCaixaDetalhes(caixa);
    setShowCaixaDetalhes(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com botão voltar e barra de pesquisa */}
      <div className="bg-white sticky top-0 z-40">
        <div className="px-4 md:px-6 py-4">
          <div className="flex items-center gap-4">
            <BackButton onClick={handleBack} />
            <SearchBar 
              placeholder="Pesquisar caixas..."
              value={search}
              onChange={setSearch}
            />
            <MarginButton 
              onClick={() => {
                // Função para margem - implementar conforme necessário
                console.log('Botão Margem clicado');
              }}
            />
          </div>
        </div>
      </div>

      {/* Título com ícone */}
      <div className="px-4 md:px-6 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center shadow-sm">
            <Calculator className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Caixas</h1>
            <p className="text-sm text-gray-500">Histórico de caixas fechados</p>
          </div>
        </div>

        {/* Listagem */}
        {estabelecimentoId && (
          <ListCaixas 
            estabelecimentoId={estabelecimentoId}
            apenasFechados={true}
            searchQuery={search}
            onVerDetalhes={handleVerDetalhes}
          />
        )}
      </div>

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
};

export default Caixas;
