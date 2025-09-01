// src/components/elements/CacheStatus.jsx
import React from 'react';
import { Zap, Database, RefreshCw, Clock, AlertCircle } from 'lucide-react';

const CacheStatus = ({ 
  fromCache, 
  lastUpdated, 
  loading, 
  error, 
  onRefresh, 
  onInvalidate,
  showControls = true,
  size = 'default'
}) => {
  // Formatar timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Nunca';
    
    const now = new Date();
    const updated = new Date(timestamp);
    const diffMs = now - updated;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Agora mesmo';
    if (diffMinutes < 60) return `${diffMinutes}min atrás`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h atrás`;
    
    return updated.toLocaleDateString('pt-BR');
  };

  // Determinar cor baseada no status
  const getStatusColor = () => {
    if (error) return 'red';
    if (fromCache) return 'green';
    return 'blue';
  };

  const statusColor = getStatusColor();
  const colorClasses = {
    green: 'text-green-600 bg-green-50 border-green-200',
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    red: 'text-red-600 bg-red-50 border-red-200'
  };

  const iconClasses = {
    green: 'text-green-600',
    blue: 'text-blue-600',
    red: 'text-red-600'
  };

  const sizeClasses = {
    small: 'text-xs px-2 py-1',
    default: 'text-sm px-3 py-2',
    large: 'text-base px-4 py-3'
  };

  return (
    <div className={`flex items-center space-x-3 ${sizeClasses[size]}`}>
      {/* Status principal */}
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${colorClasses[statusColor]}`}>
        {fromCache ? (
          <>
            <Zap className={`w-4 h-4 ${iconClasses[statusColor]}`} />
            <span className="font-medium">Cache</span>
          </>
        ) : error ? (
          <>
            <AlertCircle className={`w-4 h-4 ${iconClasses[statusColor]}`} />
            <span className="font-medium">Erro</span>
          </>
        ) : (
          <>
            <Database className={`w-4 h-4 ${iconClasses[statusColor]}`} />
            <span className="font-medium">API</span>
          </>
        )}
      </div>

      {/* Timestamp */}
      <div className="flex items-center space-x-1 text-gray-500">
        <Clock className="w-3 h-3" />
        <span className={size === 'small' ? 'text-xs' : 'text-sm'}>
          {formatTimestamp(lastUpdated)}
        </span>
      </div>

      {/* Controles */}
      {showControls && (
        <div className="flex items-center space-x-1">
          {/* Botão de refresh */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className={`p-1.5 text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 rounded-md transition-colors disabled:opacity-50 ${
              size === 'small' ? 'p-1' : 'p-1.5'
            }`}
            title="Atualizar dados"
          >
            <RefreshCw className={`${size === 'small' ? 'w-3 h-3' : 'w-4 h-4'} ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          {/* Botão de invalidar cache */}
          <button
            onClick={onInvalidate}
            className={`p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors ${
              size === 'small' ? 'p-1' : 'p-1.5'
            }`}
            title="Limpar cache e recarregar"
          >
            <Database className={size === 'small' ? 'w-3 h-3' : 'w-4 h-4'} />
          </button>
        </div>
      )}

      {/* Indicador de loading */}
      {loading && (
        <div className="flex items-center space-x-2 text-blue-600">
          <RefreshCw className={`${size === 'small' ? 'w-3 h-3' : 'w-4 h-4'} animate-spin`} />
          <span className={size === 'small' ? 'text-xs' : 'text-sm'}>
            {size === 'small' ? '...' : 'Carregando...'}
          </span>
        </div>
      )}
    </div>
  );
};

export default CacheStatus;
