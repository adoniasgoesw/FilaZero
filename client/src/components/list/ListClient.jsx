import React, { useState, useEffect } from 'react';
import { Search, X, Users } from 'lucide-react';
import { useCache } from '../../providers/CacheProvider';
import api from '../../services/api';

const ListClient = ({ onClientSelect, selectedClientId = null }) => {
  const [estabelecimentoId, setEstabelecimentoId] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Hook do cache
  const { 
    clientes, 
    loadingClientes, 
    errorClientes,
    loadClientes
  } = useCache();

  // Buscar ID do estabelecimento
  useEffect(() => {
    const id = localStorage.getItem('estabelecimentoId');
    if (id) {
      setEstabelecimentoId(Number(id));
    }
  }, []);

  // Carregar dados do cache se necessário (apenas uma vez)
  useEffect(() => {
    if (estabelecimentoId && clientes.length === 0) {
      console.log('🔄 ListClient - Carregando clientes do cache...');
      loadClientes();
    }
  }, [estabelecimentoId]);

  const handleClientSelect = (client) => {
    console.log('🔴 CLIENTE CLICADO:', client);
    if (onClientSelect) {
      console.log('🔴 CHAMANDO onClientSelect...');
      onClientSelect(client);
      console.log('🔴 onClientSelect chamado com sucesso!');
    } else {
      console.log('🔴 onClientSelect não está definido!');
    }
  };

  const toggleSearch = () => {
    setIsSearching(!isSearching);
    if (isSearching) {
      setSearchTerm('');
    }
  };

  const filteredClientes = clientes.filter(client => 
    client.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loadingClientes) {
    return (
      <div className="space-y-4">
        {/* Header cinza com lupa */}
        <div className="bg-gray-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Clientes</h3>
              <p className="text-sm text-gray-600 mt-1">Selecione um cliente para o pedido</p>
            </div>
            <button
              onClick={toggleSearch}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-200"
            >
              <Search size={20} />
            </button>
          </div>
        </div>
        
        {/* Loading */}
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-sm text-gray-600">Carregando clientes...</span>
        </div>
      </div>
    );
  }

  if (errorClientes) {
    return (
      <div className="space-y-4">
        {/* Header cinza com lupa */}
        <div className="bg-gray-100 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Clientes</h3>
              <p className="text-sm text-gray-600 mt-1">Selecione um cliente para o pedido</p>
            </div>
            <button
              onClick={toggleSearch}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-200"
            >
              <Search size={20} />
            </button>
          </div>
        </div>
        
        {/* Error */}
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">{errorClientes}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header cinza com lupa ou barra de pesquisa */}
      <div className="bg-gray-100 rounded-lg p-4 flex-shrink-0">
                  {!isSearching ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">Clientes</h3>
                        <p className="text-sm text-gray-600 mt-1">Selecione um cliente para o pedido</p>
                      </div>
                      <button
                        onClick={toggleSearch}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-200"
                      >
                        <Search size={20} />
                      </button>
                    </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar clientes..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none"
                autoFocus
              />
            </div>
            <button
              onClick={toggleSearch}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-200"
            >
              <X size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Listagem de clientes igual à seleção de complementos */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex-1">
        <div className="h-full overflow-y-auto scrollbar-hide">
          {filteredClientes.length > 0 ? (
            filteredClientes.map((client) => (
              <div key={client.id} className="flex items-center space-x-4 p-4 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0">
                <div className="relative flex-shrink-0 flex items-center">
                  <input
                    type="checkbox"
                    id={`client-${client.id}`}
                    checked={selectedClientId === client.id}
                    onChange={() => handleClientSelect(client)}
                    className="h-5 w-5 appearance-none rounded-full border-2 border-gray-300 checked:bg-blue-600 checked:border-blue-600 cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-blue-200"
                  />
                  {selectedClientId === client.id && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <label 
                  htmlFor={`client-${client.id}`}
                  className="flex-1 text-sm font-light text-gray-500 cursor-pointer tracking-wide flex items-center"
                >
                  {client.nome}
                </label>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h4 className="text-gray-600 font-semibold mb-2">Nenhum cliente encontrado</h4>
              <p className="text-gray-500 text-sm">
                {searchTerm ? 'Tente um termo diferente' : 'Não há clientes cadastrados'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-blue-600 hover:text-blue-800 text-sm mt-2"
                >
                  Limpar pesquisa
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListClient;
