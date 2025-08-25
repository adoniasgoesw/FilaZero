// src/pages/Home.jsx
import React from 'react';
import { User, Building, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

const Home = () => {
  const { user, establishment, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Building className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">FilaZero</h1>
                <p className="text-sm text-gray-500">{establishment?.nome || 'Estabelecimento'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.nome_completo || 'Usuário'}</p>
                <p className="text-xs text-gray-500">{user?.cargo || 'Cargo'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Bem-vindo ao Sistema FilaZero
          </h2>
          <p className="text-lg text-gray-600">
            Sistema de gestão de filas e atendimento
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Estabelecimentos</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <div className="w-6 h-6 text-yellow-600">⏰</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Fila Atual</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <div className="w-6 h-6 text-purple-600">📊</div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Atendimentos Hoje</p>
                <p className="text-2xl font-bold text-gray-900">156</p>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Olá, {user?.nome_completo || 'Usuário'}! 👋
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Você está logado como <strong>{user?.cargo || 'Cargo'}</strong> no estabelecimento{' '}
            <strong>{establishment?.nome || 'Estabelecimento'}</strong>. 
            Use o menu acima para navegar pelo sistema e gerenciar suas operações.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Home;
