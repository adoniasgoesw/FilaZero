// src/components/layout/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, History, Truck, Settings } from 'lucide-react';
import Logo from './Logo';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/home', icon: Home, label: 'Home', color: 'text-blue-500' },
    { path: '/historico', icon: History, label: 'Histórico', color: 'text-gray-500' },
    { path: '/delivery', icon: Truck, label: 'Delivery', color: 'text-gray-500' },
    { path: '/ajuste', icon: Settings, label: 'Ajuste', color: 'text-gray-500' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Sidebar para telas grandes */}
      <div className="hidden md:flex flex-col fixed left-0 top-0 h-full w-20 bg-white shadow-lg border-r border-gray-200 z-40">
        {/* Logo do sistema */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200 relative">
          <div className="z-50">
            <Logo />
          </div>
        </div>

        {/* Menu de navegação */}
        <nav className="flex-1 flex flex-col items-center py-6 space-y-8">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group relative flex flex-col items-center p-3 rounded-lg transition-all duration-200 hover:bg-gray-50 ${
                  isActive(item.path) 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon 
                  className={`w-6 h-6 transition-all duration-200 ${
                    isActive(item.path) ? 'text-blue-600' : item.color
                  }`} 
                />
                
                {/* Tooltip */}
                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer para telas pequenas */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <nav className="flex justify-around items-center py-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
                  isActive(item.path) 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon 
                  className={`w-5 h-5 mb-1 transition-all duration-200 ${
                    isActive(item.path) ? 'text-blue-600' : item.color
                  }`} 
                />
                <span className={`text-xs font-medium ${
                  isActive(item.path) ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Espaçamento para o conteúdo */}
      <div className="hidden md:block w-20"></div>
      <div className="md:hidden h-20"></div>
    </>
  );
};

export default Sidebar;
