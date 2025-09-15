import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ValidationNotification = ({ 
  isOpen, 
  onClose, 
  errors = {}, 
  title = "Campos obrigatórios não preenchidos" 
}) => {
  if (!isOpen || Object.keys(errors).length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            Por favor, preencha os seguintes campos obrigatórios:
          </p>
          
          <ul className="space-y-2">
            {Object.entries(errors).map(([field, message]) => (
              <li key={field} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm text-gray-700">{message}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
};

export default ValidationNotification;




