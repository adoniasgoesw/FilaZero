import React from 'react';
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';

const Notification = ({ 
  isOpen, 
  onClose, 
  type = "success", // success, error, warning, info
  title = "",
  message = "",
  duration = 5000 // auto close after 5 seconds
}) => {
  // Auto close after duration
  React.useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  // Get icon and colors based on type
  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          iconColor: 'text-green-600',
          iconBg: 'bg-green-100',
          borderColor: 'border-green-200',
          bgColor: 'bg-green-50'
        };
      case 'error':
        return {
          icon: XCircle,
          iconColor: 'text-red-600',
          iconBg: 'bg-red-100',
          borderColor: 'border-red-200',
          bgColor: 'bg-red-50'
        };
      case 'warning':
        return {
          icon: AlertCircle,
          iconColor: 'text-yellow-600',
          iconBg: 'bg-yellow-100',
          borderColor: 'border-yellow-200',
          bgColor: 'bg-yellow-50'
        };
      case 'info':
        return {
          icon: Info,
          iconColor: 'text-blue-600',
          iconBg: 'bg-blue-100',
          borderColor: 'border-blue-200',
          bgColor: 'bg-blue-50'
        };
      default:
        return {
          icon: CheckCircle,
          iconColor: 'text-green-600',
          iconBg: 'bg-green-100',
          borderColor: 'border-green-200',
          bgColor: 'bg-green-50'
        };
    }
  };

  const config = getTypeConfig();
  const IconComponent = config.icon;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full mx-4">
      <div className={`${config.bgColor} ${config.borderColor} border rounded-xl shadow-lg p-4 transform transition-all duration-300 ease-in-out`}>
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={`w-8 h-8 ${config.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
            <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                {title}
              </h4>
            )}
            {message && (
              <p className="text-sm text-gray-700">
                {message}
              </p>
            )}
          </div>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;
