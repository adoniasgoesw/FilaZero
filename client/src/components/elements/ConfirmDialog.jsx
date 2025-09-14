import React from 'react';
import ReactDOM from 'react-dom';
import { Info, X } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onPrimary,
  onSecondary,
  title = 'Atenção',
  message = '',
  primaryLabel = 'Confirmar',
  secondaryLabel = 'Cancelar',
  isLoading = false,
  variant = 'info', // info | warning | error | success
  rightAlign = false,
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          headerIconBg: 'bg-orange-100',
          headerIconColor: 'text-orange-600',
          primaryBtn: 'bg-orange-600 hover:bg-orange-700 text-white',
          secondaryBtn: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
          wrapperBg: 'bg-orange-50',
          wrapperBorder: 'border border-orange-200',
          headerBorderClass: 'border-b border-orange-200',
          footerBorderClass: 'border-t border-orange-200'
        };
      case 'error':
        return {
          headerIconBg: 'bg-red-100',
          headerIconColor: 'text-red-600',
          primaryBtn: 'bg-red-600 hover:bg-red-700 text-white',
          secondaryBtn: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
          wrapperBg: 'bg-white',
          wrapperBorder: 'border border-gray-200',
          headerBorderClass: 'border-b border-gray-200',
          footerBorderClass: 'border-t border-gray-200'
        };
      case 'success':
        return {
          headerIconBg: 'bg-emerald-100',
          headerIconColor: 'text-emerald-600',
          primaryBtn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          secondaryBtn: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
          wrapperBg: 'bg-white',
          wrapperBorder: 'border border-gray-200',
          headerBorderClass: 'border-b border-gray-200',
          footerBorderClass: 'border-t border-gray-200'
        };
      default:
        return {
          headerIconBg: 'bg-blue-100',
          headerIconColor: 'text-blue-600',
          primaryBtn: 'bg-blue-600 hover:bg-blue-700 text-white',
          secondaryBtn: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
          wrapperBg: 'bg-white',
          wrapperBorder: 'border border-gray-200',
          headerBorderClass: 'border-b border-gray-200',
          footerBorderClass: 'border-t border-gray-200'
        };
    }
  };

  const styles = getVariantStyles();

  const modalContent = (
    <div className="fixed inset-0 flex items-center justify-center z-[1000] p-4">
      <div className={`${styles.wrapperBg} rounded-xl shadow-2xl max-w-md w-full mx-4 ${styles.wrapperBorder}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 ${styles.headerBorderClass}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${styles.headerIconBg} rounded-full flex items-center justify-center`}>
              <Info className={`w-5 h-5 ${styles.headerIconColor}`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {message ? (
            <p className="text-gray-600">{message}</p>
          ) : null}
        </div>

        {/* Footer */}
        <div className={`flex gap-3 p-6 ${styles.footerBorderClass} ${rightAlign ? 'justify-end' : ''}`}>
          <button
            onClick={onSecondary}
            disabled={isLoading}
            className={`${rightAlign ? '' : 'flex-1'} px-4 py-2 ${styles.secondaryBtn} rounded-lg transition-colors disabled:opacity-50`}
          >
            {secondaryLabel}
          </button>
          <button
            onClick={onPrimary}
            disabled={isLoading}
            className={`${rightAlign ? '' : 'flex-1'} px-4 py-2 ${styles.primaryBtn} rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processando...
              </>
            ) : (
              primaryLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ConfirmDialog;


