import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import CancelButton from '../buttons/CancelButton';

const Notification = ({ 
  isOpen, 
  onClose, 
  type = 'info', 
  title, 
  message, 
  onConfirm, 
  confirmText = 'Confirmar', 
  cancelText = 'Cancelar', 
  showConfirm = false 
}) => {
  if (!isOpen) return null;

  const getNotificationStyle = () => {
    switch (type) {
      case 'success':
        return {
          icon: '✅',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          titleColor: 'text-green-800',
          iconBg: 'bg-green-100'
        };
      case 'error':
        return {
          icon: '❌',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          iconBg: 'bg-red-100'
        };
      case 'warning':
        return {
          icon: '⚠️',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-800',
          iconBg: 'bg-yellow-100'
        };
      case 'delete':
        return {
          icon: '⚠️',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          titleColor: 'text-red-800',
          iconBg: 'bg-red-100'
        };
      case 'info':
      default:
        return {
          icon: 'ℹ️',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-800',
          iconBg: 'bg-blue-100'
        };
    }
  };

  const styles = getNotificationStyle();

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className={`${styles.bgColor} ${styles.borderColor} border-2 rounded-xl p-4 max-w-xs w-full shadow-xl relative`}>
        {/* Ícone de aviso em bolinha sobrepondo o topo e lateral esquerda */}
        <div className={`absolute -top-3 -left-3 w-8 h-8 ${styles.iconBg} rounded-full flex items-center justify-center shadow-lg border-2 border-white`}>
          <AlertTriangle className={`w-4 h-4 ${styles.iconColor} transform rotate-12`} />
        </div>

        {/* Header com título e botão fechar */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 pr-8">
            <h3 className={`text-lg font-semibold ${styles.titleColor}`}>
              {title}
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors duration-200 ml-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensagem */}
        <div className="mb-4">
          <p className="text-gray-700 text-base leading-relaxed">
            {message}
          </p>
        </div>

        {/* Botões de ação - apenas se showConfirm for true */}
        {showConfirm && (
          <div className="flex space-x-2">
            <CancelButton onClick={onClose} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white text-base py-2">
              {cancelText}
            </CancelButton>
            <button
              onClick={() => { onConfirm(); onClose(); }}
              className="flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-red-500 hover:bg-red-600 text-white text-base"
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notification;
