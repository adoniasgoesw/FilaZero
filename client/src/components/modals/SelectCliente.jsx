import React, { useState, useEffect } from 'react';
import { Users, Search } from 'lucide-react';
import BaseModal from './Base';
import SearchBar from '../layout/SeachBar';
import ListClientes from '../list/ListClientes';
import api from '../../services/api';

const SelectCliente = ({ isOpen, onClose, onSelectCliente, identificacao, onSaveCliente }) => {
  const [search, setSearch] = useState('');
  const [clientes, setClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Carregar clientes quando o modal abre
  useEffect(() => {
    if (isOpen) {
      fetchClientes();
    }
  }, [isOpen]);

  const fetchClientes = async () => {
    try {
      const estabelecimentoId = localStorage.getItem('estabelecimentoId');
      if (!estabelecimentoId) return;


      setLoading(true);
      const response = await api.get(`/clientes/${estabelecimentoId}`);
      if (response.success) {
        const data = response.data || [];
        setClientes(data);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClienteSelect = (cliente) => {
    // Se o cliente já está selecionado, desmarcar
    if (selectedCliente?.id === cliente.id) {
      console.log('❌ Cliente desmarcado:', cliente.nome);
      setSelectedCliente(null);
    } else {
      // Caso contrário, selecionar o cliente
      console.log('✅ Cliente selecionado:', cliente.nome);
      console.log('📋 DADOS DO CLIENTE SELECIONADO NO MODAL:');
      console.log('==========================================');
      console.log('🆔 ID:', cliente.id);
      console.log('🏢 Estabelecimento ID:', cliente.estabelecimento_id);
      console.log('👤 Nome:', cliente.nome);
      console.log('📄 CPF:', cliente.cpf || 'Não informado');
      console.log('🏢 CNPJ:', cliente.cnpj || 'Não informado');
      console.log('📍 Endereço:', cliente.endereco || 'Não informado');
      console.log('📱 WhatsApp:', cliente.whatsapp || 'Não informado');
      console.log('📧 Email:', cliente.email || 'Não informado');
      console.log('💰 Taxa de Entrega:', cliente.taxa_entrega || '0.00');
      console.log('📅 Criado em:', cliente.criado_em || 'Não informado');
      console.log('🔄 Atualizado em:', cliente.updated_at || 'Não informado');
      console.log('✅ Status:', cliente.status ? 'Ativo' : 'Inativo');
      console.log('==========================================');
      setSelectedCliente(cliente);
    }
  };

  const handleSave = async () => {
    console.log('🔄 Iniciando salvamento do cliente...', selectedCliente);
    
    if (!selectedCliente) {
      console.log('❌ Nenhum cliente selecionado');
      alert('Por favor, selecione um cliente');
      return;
    }

    if (!onSelectCliente) {
      console.log('❌ Função onSelectCliente não fornecida');
      return;
    }

    try {
      // Salvar cliente no banco de dados se a função onSaveCliente foi fornecida
      if (onSaveCliente && identificacao) {
        console.log('💾 Salvando cliente no banco de dados...', identificacao);
        await onSaveCliente(selectedCliente, identificacao);
        console.log('✅ Cliente salvo no banco com sucesso');
      } else {
        console.log('⚠️ Função onSaveCliente não fornecida ou identificacao ausente');
      }
      
      // Atualizar estado local
      console.log('🔄 Atualizando estado local...');
      onSelectCliente(selectedCliente);
      
      // Fechar modal
      console.log('🔄 Fechando modal...');
      onClose();
      
      console.log('✅ Processo concluído com sucesso');
    } catch (error) {
      console.error('❌ Erro ao salvar cliente:', error);
      alert('Erro ao salvar cliente: ' + error.message);
      // Mesmo com erro, atualizar o estado local e fechar modal
      onSelectCliente(selectedCliente);
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedCliente(null);
    onClose();
  };

  // Filtrar clientes baseado na pesquisa
  const filteredClientes = clientes.filter(cliente =>
    cliente.nome?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleCancel}
      title=""
      icon={Users}
      iconBgColor="bg-blue-100"
      iconColor="text-blue-600"
      onSave={handleSave}
      showButtons={true}
      saveText="Salvar"
      cancelText="Cancelar"
    >
      <div className="space-y-6 p-2 sm:p-4">
        {/* Header cinza com lupa - igual aos complementos */}
        <div className="bg-gray-100 rounded-lg p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Clientes</h3>
              <p className="text-sm text-gray-600 mt-1">Selecione um cliente para o pedido</p>
            </div>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-200"
            >
              <Search size={20} />
            </button>
          </div>
        </div>

        {/* Barra de pesquisa */}
        {showSearch && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <input
              type="text"
              placeholder="Pesquisar clientes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none"
            />
          </div>
        )}

        {/* Listagem de clientes */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Carregando clientes...</span>
            </div>
          ) : filteredClientes.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Nenhum cliente encontrado</p>
            </div>
          ) : (
            filteredClientes.map((cliente) => (
              <div 
                key={cliente.id} 
                className="flex items-center space-x-4 p-4 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                onClick={() => handleClienteSelect(cliente)}
              >
                <div className="relative flex-shrink-0 flex items-center">
                  <input
                    type="checkbox"
                    id={`cliente-${cliente.id}`}
                    checked={selectedCliente?.id === cliente.id}
                    onChange={() => handleClienteSelect(cliente)}
                    className="h-5 w-5 appearance-none rounded-full border-2 border-gray-300 checked:bg-blue-600 checked:border-blue-600 cursor-pointer transition-all duration-200 focus:ring-2 focus:ring-blue-200"
                  />
                  {selectedCliente?.id === cliente.id && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <label 
                  htmlFor={`cliente-${cliente.id}`}
                  className="flex-1 text-sm font-light text-gray-500 cursor-pointer tracking-wide flex items-center"
                >
                  {cliente.nome}
                </label>
                {cliente.telefone && (
                  <span className="text-xs text-gray-500 hidden sm:block">
                    {cliente.telefone}
                  </span>
                )}
              </div>
            ))
          )}
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default SelectCliente;
