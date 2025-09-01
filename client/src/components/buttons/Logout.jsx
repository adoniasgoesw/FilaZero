import React from 'react';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LogoutButton = ({ className = "" }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Limpar todos os dados de autenticação do localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('userId');
    localStorage.removeItem('estabelecimentoId');
    
    // Redirecionar para a página inicial
    navigate('/');
  };

  return (
    <button
      onClick={handleLogout}
      className={`px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md ${className}`}
      title="Sair do sistema"
    >
      <LogOut size={16} />
      Sair
    </button>
  );
};

export default LogoutButton;
