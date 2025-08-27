import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import SearchBar from '../components/layout/SearchBar';
import AddButton from '../components/buttons/AddButton';
import { History as HistoryIcon } from 'lucide-react';

const Historico = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="md:ml-20 p-3 sm:p-6">
        <div className="flex items-center w-full">
          {/* Ícone da página */}
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <HistoryIcon className="w-6 h-6 text-orange-600" />
          </div>
          
          {/* Espaçamento */}
          <div className="w-4 flex-shrink-0"></div>
          
          {/* Barra de pesquisa */}
          <SearchBar />
          
          {/* Espaçamento */}
          <div className="w-4 flex-shrink-0"></div>
          
          {/* Botão de adicionar */}
          <AddButton 
            onClick={() => console.log('Add clicked')}
            className="flex-shrink-0"
          >
            Abrir Caixa
          </AddButton>
        </div>
      </div>
    </div>
  );
};

export default Historico;
