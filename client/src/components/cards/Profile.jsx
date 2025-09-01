import React, { useState, useEffect } from 'react';
import { Building2, User, CreditCard, Briefcase } from 'lucide-react';
import LogoutButton from '../buttons/Logout';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [estabelecimentoData, setEstabelecimentoData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
      {/* Header do Profile */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-800">Perfil do Sistema</h2>
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
            <span>CPF: {userData.cpf || 'CPF não disponível'}</span>
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
    </div>
  );
};

export default Profile;
