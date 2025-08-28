import React from 'react';
import { Database, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

// Componente para mostrar status do cache
const CacheStatus = ({ 
  fromCache, 
  lastUpdated, 
  onRefresh, 
  loading = false,
  className = ''
}) => {
  if (!fromCache && !lastUpdated) {
    return null;
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'agora mesmo';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m atrás`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`;
    return `${Math.floor(diff / 86400000)}d atrás`;
  };

  const getStatusColor = () => {
    if (fromCache) return 'text-green-600 bg-green-50 border-green-200';
    return 'text-blue-600 bg-blue-50 border-blue-200';
  };

  const getStatusIcon = () => {
    if (fromCache) return <CheckCircle className="w-4 h-4" />;
    return <Database className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (fromCache) return 'Dados do cache';
    return 'Dados da API';
  };

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor()} ${className}`}>
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {getStatusText()}
          </span>
          {lastUpdated && (
            <span className="text-xs opacity-75">
              Atualizado {formatTime(lastUpdated)}
            </span>
          )}
        </div>
      </div>
      
      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={loading}
          className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
            loading 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-white hover:bg-opacity-50'
          }`}
        >
          {loading ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <RefreshCw className="w-3 h-3" />
          )}
          <span>{loading ? 'Atualizando...' : 'Atualizar'}</span>
        </button>
      )}
    </div>
  );
};

export default CacheStatus;
