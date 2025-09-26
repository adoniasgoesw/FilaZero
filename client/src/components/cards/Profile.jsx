import React, { useState, useEffect } from 'react';
import { Building2, User, CreditCard, Briefcase, Edit } from 'lucide-react';
import LogoutButton from '../buttons/Logout';
import BaseModal from '../modals/Base';
import FormEstabelecimento from '../forms/FormEstabelecimento';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [estabelecimentoData, setEstabelecimentoData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEstabelecimento, setIsLoadingEstabelecimento] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [estabelecimentoCompleto, setEstabelecimentoCompleto] = useState(null);

  // Função para formatar CPF
  const formatCPF = (cpf) => {
    if (!cpf) return 'CPF não disponível';
    const numbers = cpf.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  useEffect(() => {
    // Buscar dados do usuário e estabelecimento do localStorage
    const userId = localStorage.getItem('userId');
    const estabelecimentoId = localStorage.getItem('estabelecimentoId');
    const usuario = localStorage.getItem('usuario');

    if (userId && estabelecimentoId && usuario) {
      try {
        const userInfo = JSON.parse(usuario);
        setUserData(userInfo);
        
        // Se o usuário já tem os dados do estabelecimento na resposta do login
        if (userInfo.nome_estabelecimento) {
          setEstabelecimentoData({
            nome: userInfo.nome_estabelecimento,
            setor: userInfo.setor_estabelecimento
          });
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const buscarDadosEstabelecimento = async () => {
    try {
      setIsLoadingEstabelecimento(true);
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
          // Armazenar dados completos e abrir modal
          setEstabelecimentoCompleto(result.data);
          setShowEditModal(true);
        } else {
          console.error('Erro ao buscar dados do estabelecimento:', result.message);
        }
      } else {
        console.error('Erro na requisição:', response.status);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do estabelecimento:', error);
    } finally {
      setIsLoadingEstabelecimento(false);
    }
  };

  const handleSaveEstabelecimento = async (formData) => {
    try {
      setIsLoadingEstabelecimento(true);
      const token = localStorage.getItem('token');
      
      console.log('🚀 Enviando dados para atualizar estabelecimento:', formData);
      console.log('🔑 Token:', token ? 'Presente' : 'Ausente');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002/api'}/estabelecimento/meu`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log('✅ Estabelecimento atualizado com sucesso:', result.data);
          // Atualizar dados locais se necessário
          if (result.data.nome) {
            setEstabelecimentoData(prev => ({
              ...prev,
              nome: result.data.nome
            }));
          }
          // O modal será fechado automaticamente pelo evento modalSaveSuccess
        } else {
          console.error('Erro ao atualizar estabelecimento:', result.message);
        }
      } else {
        console.error('Erro na requisição:', response.status);
      }
    } catch (error) {
      console.error('Erro ao salvar estabelecimento:', error);
    } finally {
      setIsLoadingEstabelecimento(false);
    }
  };


  const handleCloseModal = () => {
    setShowEditModal(false);
    setEstabelecimentoCompleto(null);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 max-w-md">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 max-w-md">
        <div className="text-center text-gray-500">
          <p>Usuário não autenticado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 max-w-md relative">
      {/* Header do Profile com botão Edit */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">Perfil do Sistema</h2>
        <button
          onClick={buscarDadosEstabelecimento}
          disabled={isLoadingEstabelecimento}
          className="inline-flex items-center justify-center p-1.5 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-700 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Edit className={`w-4 h-4 ${isLoadingEstabelecimento ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Informações do Estabelecimento */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">Estabelecimento</h3>
            <p className="text-gray-600 text-sm">
              {estabelecimentoData?.nome || 'Nome não disponível'}
            </p>
          </div>
        </div>

        {/* Informações do Usuário */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">Usuário</h3>
            <p className="text-gray-600 text-sm">{userData.nome_completo || 'Nome não disponível'}</p>
          </div>
        </div>

        {/* Detalhes do Usuário */}
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <CreditCard className="w-3 h-3 text-gray-400" />
            <span>CPF: {formatCPF(userData.cpf)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-3 h-3 text-gray-400" />
            <span>Cargo: {userData.cargo || 'Cargo não disponível'}</span>
          </div>

        </div>
      </div>

      {/* Botão de sair no canto inferior direito */}
      <div className="absolute bottom-4 right-4">
        <LogoutButton />
      </div>

      {/* Modal de Edição do Estabelecimento */}
      <BaseModal
        isOpen={showEditModal}
        onClose={handleCloseModal}
        title="Alterar Estabelecimento"
        icon={Building2}
        iconBgColor="bg-blue-100"
        iconColor="text-blue-600"
        showButtons={true}
        onSave={handleSaveEstabelecimento}
        saveText="Salvar"
        cancelText="Cancelar"
      >
        <div className="max-h-[600px] overflow-y-auto">
          <FormEstabelecimento
            estabelecimentoData={estabelecimentoCompleto}
            onSave={handleSaveEstabelecimento}
            onCancel={handleCloseModal}
            isLoading={isLoadingEstabelecimento}
          />
        </div>
      </BaseModal>
    </div>
  );
};

export default Profile;
