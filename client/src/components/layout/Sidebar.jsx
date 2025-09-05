import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, History, Truck, Settings } from 'lucide-react';

function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/historic', icon: History, label: 'Histórico' },
    { path: '/delivery', icon: Truck, label: 'Delivery' },
    { path: '/config', icon: Settings, label: 'Ajuste' },
  ];

  return (
    <>
      {/* Sidebar para telas médias e grandes (>= 900px) */}
      <div className="hidden md:flex fixed left-0 top-4 h-full w-20 bg-white border-r border-gray-200 flex-col items-center py-4 z-50 shadow-lg">
        {/* Logo */}
        <div className="mb-12">
          <Link to="/home" className="block">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
              FZ
            </div>
          </Link>
        </div>

        {/* Menu Items */}
        <div className="flex flex-col space-y-8">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  isActive
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-200 scale-110'
                    : 'text-gray-500 hover:text-blue-500 hover:bg-blue-50 hover:scale-105'
                }`}
                title={item.label}
              >
                <IconComponent 
                  size={20} 
                  className={`transition-all duration-300 ${
                    isActive ? 'text-white' : 'group-hover:text-blue-500'
                  }`}
                />
              </Link>
            );
          })}
        </div>

        {/* Decoração inferior */}
        <div className="mt-auto">
          <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full opacity-60"></div>
        </div>
      </div>

      {/* Footer para telas pequenas (< 900px) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
        <div className="flex items-center justify-around py-3 px-4">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center space-y-1 transition-all duration-200 ${
                  isActive
                    ? 'text-blue-500'
                    : 'text-gray-500 hover:text-blue-500'
                }`}
                title={item.label}
              >
                <IconComponent 
                  size={20} 
                  className={`transition-all duration-200 ${
                    isActive ? 'text-blue-500' : 'text-gray-500 group-hover:text-blue-500'
                  }`}
                />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default Sidebar;
