import React from 'react';

const Base = ({ icon: Icon, title, description, onClick, className = "", iconColor = "blue" }) => {
  const getIconBgColor = (color) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600",
      purple: "bg-purple-100 text-purple-600",
      orange: "bg-orange-100 text-orange-600",
      red: "bg-red-100 text-red-600",
      indigo: "bg-indigo-100 text-indigo-600",
      teal: "bg-teal-100 text-teal-600",
      cyan: "bg-cyan-100 text-cyan-600",
      amber: "bg-amber-100 text-amber-600",
      slate: "bg-slate-100 text-slate-600",
      violet: "bg-violet-100 text-violet-600",
      emerald: "bg-emerald-100 text-emerald-600"
    };
    return colors[color] || colors.blue;
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-lg p-4 border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer max-w-xs ${className}`}
      onClick={onClick}
    >
      <div className="flex flex-col items-center text-center space-y-3">
        {/* Ícone */}
        <div className={`w-12 h-12 ${getIconBgColor(iconColor)} rounded-xl flex items-center justify-center`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
        
        {/* Conteúdo */}
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-1">{title}</h3>
          {description && (
            <p className="text-xs text-gray-600 leading-tight">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Base;
