import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Logo from '../layout/Logo';
import LogoutButton from '../buttons/LogoutButton';
import API from '../../services/api.js';

const ProfileCard = () => {
  const { user, establishment } = useAuth();
  const [userData, setUserData] = useState({
    estabelecimento: 'Carregando...',
    usuario: 'Carregando...',
    cargo: 'Carregando...',
    cpf: 'Carregando...'
  });

  // Função para formatar CPF
  const formatCPF = (cpf) => {
    if (!cpf || cpf === 'Carregando...') return cpf;
    const cleanCPF = cpf.replace(/\D/g, '');
    return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user || !establishment) {
        return;
      }

      try {
        const response = await API.get(`/user/${user.id}/${establishment.id}`);
        
        if (response.data.success) {
          const data = response.data.data;
          setUserData({
            estabelecimento: data.estabelecimento.nome,
            usuario: data.usuario.nome_completo,
            cargo: data.usuario.cargo,
            cpf: data.usuario.cpf
          });
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        // Em caso de erro, usar dados do contexto como fallback
        if (user && establishment) {
          setUserData({
            estabelecimento: establishment.nome || 'Estabelecimento',
            usuario: user.nome_completo || 'Usuário',
            cargo: user.cargo || 'Cargo',
            cpf: user.cpf || 'CPF'
          });
        }
      }
    };

    fetchUserData();
  }, [user, establishment]);

  return (
    <div className="bg-white rounded-2xl shadow-lg w-82 overflow-hidden">
      {/* Header com Logo */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Logo SVG */}
          <div className="bg-white rounded-lg p-1.5">
            <div className="w-6 h-6 text-blue-600 flex items-center justify-center">
              <Logo />
            </div>
          </div>
          <div>
            <h3 className="text-white font-semibold text-base">{userData.estabelecimento}</h3>
          </div>
        </div>
      </div>

      {/* Foto do Perfil */}
      <div className="relative -mt-6 flex justify-center">
        <div className="bg-white rounded-full p-1.5">
          <div className="w-14 h-14 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-105">
            <svg className="w-7 h-7 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Informações do Usuário */}
      <div className="px-4 py-2 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-1">{userData.usuario}</h2>
        <p className="text-blue-600 font-medium mb-2">{userData.cargo}</p>
      </div>

      {/* Detalhes */}
      <div className="px-4 pb-3 space-y-2">
        {/* CPF */}
        <div className="bg-gray-50 rounded-lg p-2.5">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 rounded-full p-1.5">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-4 0v2m4-2v2"/>
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">CPF</p>
              <p className="text-sm text-gray-800 font-semibold">{formatCPF(userData.cpf)}</p>
            </div>
          </div>
        </div>

        {/* Estabelecimento */}
        <div className="bg-gray-50 rounded-lg p-2.5">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 rounded-full p-1.5">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Estabelecimento</p>
              <p className="text-sm text-gray-800 font-semibold">{userData.estabelecimento}</p>
            </div>
          </div>
        </div>

        {/* Botão de Logout */}
        <div className="mt-3">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
