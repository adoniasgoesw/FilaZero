import React, { useRef, useState, useEffect } from 'react';
import { Home as HomeIcon, Settings } from 'lucide-react';
import SearchBar from '../components/layout/SeachBar';
import ListPontosAtendimento from '../components/list/ListPontosAtendimento';
import ConfigButton from '../components/buttons/Config';
import BaseModal from '../components/modals/Base';
import FormConfig from '../components/forms/FormConfig';
import ConfirmDialog from '../components/elements/ConfirmDialog';
import api from '../services/api';

function Home() {
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const contentRef = useRef(null);
  const [search, setSearch] = useState('');
  const [caixaInfo, setCaixaInfo] = useState({ loading: true, aberto: null });
  const [show24hNotice, setShow24hNotice] = useState(false);

  useEffect(() => {
    // Garantir que o scroll começa no topo ao entrar nesta página (especialmente no mobile)
    if (contentRef.current && typeof contentRef.current.scrollTo === 'function') {
      contentRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []);

  // Checar status do caixa ao entrar na Home
  useEffect(() => {
    async function checkCaixa() {
      try {
        const estabelecimentoId = Number(localStorage.getItem('estabelecimentoId')) || null;
        if (!estabelecimentoId) {
          setCaixaInfo({ loading: false, aberto: null });
          return;
        }
        const res = await api.get(`/caixas/aberto/${estabelecimentoId}`);
        const aberto = res && res.success ? res.data : null;
        setCaixaInfo({ loading: false, aberto });
        
        // Checar 24h apenas se o caixa estiver aberto
        if (aberto) {
          try {
            const abertura = aberto.caixa?.data_abertura || aberto.data_abertura;
            if (abertura) {
              const openedAt = new Date(abertura).getTime();
              const now = Date.now();
              const diffMs = now - openedAt;
              const suppress = sessionStorage.getItem('suppress24hWarning');
              if (diffMs >= 24 * 60 * 60 * 1000 && suppress !== '1') {
                setShow24hNotice(true);
              }
            }
          } catch {
            // ignore
          }
        }
      } catch {
        setCaixaInfo({ loading: false, aberto: null });
      }
    }
    checkCaixa();
  }, []);

  const handleConfigSave = (data) => {
    console.log('Configurações salvas:', data);
    setIsConfigModalOpen(false);
  };

  const handleConfigCancel = () => {
    setIsConfigModalOpen(false);
  };

  // Se o caixa estiver fechado, mostrar apenas o ConfirmDialog centralizado
  if (!caixaInfo.loading && !caixaInfo.aberto) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <ConfirmDialog
          isOpen={true}
          onClose={() => {}} // Não permite fechar
          onSecondary={() => {}} // Remove o botão OK
          onPrimary={() => window.location.assign('/historic?abrir_caixa=1')}
          title="Caixa fechado"
          message="Abra um caixa para anotar pedidos."
          primaryLabel="Abrir caixa"
          secondaryLabel="" // Remove o botão OK
          variant="warning"
          rightAlign={false} // Centralizar
        />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col md:min-h-screen">
      {/* Notificação de 24h quando caixa estiver aberto */}
      {!caixaInfo.loading && caixaInfo.aberto && show24hNotice && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => { setShow24hNotice(false); sessionStorage.setItem('suppress24hWarning', '1'); }}
          onSecondary={() => { setShow24hNotice(false); sessionStorage.setItem('suppress24hWarning', '1'); }}
          onPrimary={() => { setShow24hNotice(false); window.location.assign('/historic?fechar_abrir=1'); }}
          title="Caixa aberto há mais de 24 horas"
          message="Considere fechar e abrir um novo caixa para relatórios mais organizados."
          primaryLabel="Fechar e abrir novo caixa"
          secondaryLabel="Continuar"
          variant="warning"
          rightAlign
        />
      )}
      
      {/* Header - fixo apenas em mobile */}
      <div className="fixed md:relative top-0 left-0 right-0 md:left-auto md:right-auto z-50 md:z-auto bg-white px-4 md:px-6 py-4">
        <div className="flex items-center gap-3 w-full">
          {/* Ícone da página */}
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0">
            <HomeIcon size={24} />
          </div>
          
          {/* Barra de pesquisa */}
          <div className="flex-1 min-w-0">
            <SearchBar placeholder="Pesquisar..." value={search} onChange={setSearch} />
          </div>
          
          {/* Botão de configuração */}
          <ConfigButton onClick={() => setIsConfigModalOpen(true)} />
        </div>
      </div>

      {/* Área de conteúdo com rolagem */}
      <div ref={contentRef} className="flex-1 overflow-y-auto px-4 md:px-6 py-4 mt-16 md:mt-6">
        {/* Mostrar pontos de atendimento apenas quando o caixa estiver aberto */}
        {caixaInfo.aberto && <ListPontosAtendimento search={search} />}
      </div>

      {/* Modal de Configurações */}
      <BaseModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        title="Configurações"
        icon={Settings}
      >
        <FormConfig 
          onCancel={handleConfigCancel}
          onSave={handleConfigSave}
        />
      </BaseModal>
    </div>
  );
}

export default Home;
