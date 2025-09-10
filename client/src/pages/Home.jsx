import React, { useRef, useState, useEffect } from 'react';
import { Home as HomeIcon, Settings } from 'lucide-react';
import SearchBar from '../components/layout/SeachBar';
import ListPontosAtendimento from '../components/list/ListPontosAtendimento';
import ConfigButton from '../components/buttons/Config';
import BaseModal from '../components/modals/Base';
import FormConfig from '../components/forms/FormConfig';

function Home() {
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const contentRef = useRef(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Garantir que o scroll começa no topo ao entrar nesta página (especialmente no mobile)
    if (contentRef.current && typeof contentRef.current.scrollTo === 'function') {
      contentRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []);

  const handleConfigSave = (data) => {
    console.log('Configurações salvas:', data);
    setIsConfigModalOpen(false);
  };

  const handleConfigCancel = () => {
    setIsConfigModalOpen(false);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col md:min-h-screen">
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
        <ListPontosAtendimento search={search} />
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
