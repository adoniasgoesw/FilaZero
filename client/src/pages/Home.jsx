import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import SearchBar from '../components/layout/SearchBar';
import ConfigButton from '../components/buttons/ConfigButton';
import { Home as HomeIcon } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="md:ml-20 p-3 sm:p-6">
        <div className="flex items-center w-full">
          {/* Ícone da página */}
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <HomeIcon className="w-6 h-6 text-blue-600" />
          </div>
          
          {/* Espaçamento */}
          <div className="w-4 flex-shrink-0"></div>
          
          {/* Barra de pesquisa */}
          <SearchBar />
          
          {/* Espaçamento */}
          <div className="w-4 flex-shrink-0"></div>
          
          {/* Botão de configuração */}
          <ConfigButton 
            onClick={() => console.log('Config clicked')}
            className="flex-shrink-0"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
