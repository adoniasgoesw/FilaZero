import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { useClientes } from '../../contexts/CacheContext';

const ListClient = ({ onClientSelect, selectedClientId = null }) => {
  const [estabelecimentoId, setEstabelecimentoId] = useState(null);
  
  // Usar hook de cache para clientes
  const { clientes, loading, error, loadClientes } = useClientes(estabelecimentoId);

  // Buscar ID do estabelecimento
  useEffect(() => {
    const id = localStorage.getItem('estabelecimentoId');
    if (id) {
      setEstabelecimentoId(Number(id));
    }
  }, []);

  // Carregar clientes do cache
  useEffect(() => {
    if (estabelecimentoId) {
      loadClientes();
    }
  }, [estabelecimentoId, loadClientes]);

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

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Cabeçalho cinza */}
        <div className="bg-gray-100 rounded-lg py-2 px-4">
          <h3 className="text-base font-semibold text-gray-800">Cliente</h3>
        </div>
        
        {/* Loading */}
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-sm text-gray-600">Carregando clientes...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        {/* Cabeçalho cinza */}
        <div className="bg-gray-100 rounded-lg py-2 px-4">
          <h3 className="text-base font-semibold text-gray-800">Cliente</h3>
        </div>
        
        {/* Error */}
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Cabeçalho cinza */}
      <div className="bg-gray-100 rounded-lg py-2 px-4">
        <h3 className="text-base font-semibold text-gray-800">Cliente</h3>
      </div>

      {/* Listagem de clientes com checkboxes */}
      <div className="space-y-2">
        {clientes.length > 0 ? (
          clientes.map((client) => (
            <div 
              key={client.id} 
              className="flex items-center space-x-4 py-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <input
                type="radio"
                id={`client-${client.id}`}
                name="selectedClient"
                checked={selectedClientId === client.id}
                onChange={() => handleClientSelect(client)}
                className="h-5 w-5 appearance-none rounded-full border-2 border-blue-500 checked:bg-blue-600 checked:border-blue-600 cursor-pointer"
              />
              <label 
                htmlFor={`client-${client.id}`}
                className="flex-1 text-sm font-light text-gray-700 cursor-pointer tracking-wide"
              >
                {client.nome}
              </label>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Nenhum cliente encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListClient;
