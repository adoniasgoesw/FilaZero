// src/components/elements/Loading.jsx
import React from 'react';
import LoadingImage from '../../assets/loading.png';
import Accept from '../../assets/accept.png';
import Error from '../../assets/error.png';

const Loading = ({ status, message }) => {
  // status: 'loading', 'success', 'error'
  
  const getStatusImage = () => {
    switch (status) {
      case 'success':
        return Accept;
      case 'error':
        return Error;
      default:
        return LoadingImage;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'success':
        return 'Acesso permitido!';
      case 'error':
        return message || 'Erro no acesso';
      default:
        return 'Verificando credenciais...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="absolute inset-0 bg-white bg-opacity-95 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
      <div className="text-center p-8 max-w-sm">
        {/* Imagem com rotação */}
        <div className="mb-6">
          <img 
            src={getStatusImage()} 
            alt={status}
            className={`w-20 h-20 mx-auto ${
              status === 'loading' ? 'animate-spin' : ''
            }`}
          />
        </div>

        {/* Título do Status */}
        <h3 className={`text-xl font-bold ${getStatusColor()} mb-4`}>
          {getStatusText()}
        </h3>

        {/* Barra de Progresso para Loading */}
        {status === 'loading' && (
          <div className="w-64 mx-auto mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse transition-all duration-1000 ease-out"></div>
            </div>
            <p className="text-sm text-gray-600 mt-3 font-medium">
              Carregando dados do sistema...
            </p>
          </div>
        )}

        {/* Ações para Success/Error */}
        {status !== 'loading' && (
          <div className="space-y-4">
            {status === 'success' ? (
              <div className="text-green-600">
                <p className="text-sm mb-4 font-medium">
                  Redirecionando para o sistema...
                </p>
                <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : (
              <div className="text-red-600">
                <p className="text-sm mb-4 font-medium">
                  Verifique suas credenciais e tente novamente
                </p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Tentar Novamente
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Loading;
