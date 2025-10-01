import React from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ShoppingCart, FileText, DollarSign, Truck } from 'lucide-react';
import DesktopMoldura from '../elements/DesktopMoldura';

const HeroSection = () => {

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-white via-gray-50 to-white overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-100 rounded-full blur-xl animate-float" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-gray-100 rounded-full blur-lg animate-float-delayed" />
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-blue-50 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-gray-50 rounded-full blur-xl animate-float-delayed" />
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-10 md:py-14 lg:py-18 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-10 items-center">
          <div className="space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8">
            <div className="space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-6">
              <Badge variant="secondary" className="text-sm px-4 py-2">
                Sistema de Pedidos Digitais
              </Badge>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="block sm:inline">Seu cliente não espera,</span>
                <span className="block sm:inline"> <span className="text-gray-900">seu sistema</span> também não</span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-lg">
                Transforme seu restaurante com o sistema de pedidos mais rápido e intuitivo do mercado. Gerencie tudo em
                tempo real.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 p-1.5 sm:p-2 md:p-3 lg:p-4 rounded-lg bg-white border border-gray-200 hover:shadow-md transition-shadow h-16 sm:h-18 md:h-20">
                <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100">
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-xs sm:text-base">Pedidos Digitais</h3>
                  <p className="text-xs sm:text-sm text-gray-600">PDVs e sistemas de gestão</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 p-1.5 sm:p-2 md:p-3 lg:p-4 rounded-lg bg-white border border-gray-200 hover:shadow-md transition-shadow h-16 sm:h-18 md:h-20">
                <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-xs sm:text-base">Relatórios</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Dashboards, NFe e NFCe</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 p-1.5 sm:p-2 md:p-3 lg:p-4 rounded-lg bg-white border border-gray-200 hover:shadow-md transition-shadow h-16 sm:h-18 md:h-20">
                <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-xs sm:text-base">Painel Administrativo</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Controle de estoque e financeiro</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 p-1.5 sm:p-2 md:p-3 lg:p-4 rounded-lg bg-white border border-gray-200 hover:shadow-md transition-shadow h-16 sm:h-18 md:h-20">
                <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-xs sm:text-base">Delivery</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Sistema próprio</p>
                </div>
              </div>
            </div>

            <Button 
              size="lg" 
              className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 animate-pulse-glow w-full sm:w-auto mt-4 sm:mt-0"
              onClick={() => {
                // Disparar evento para abrir modal de registro
                window.dispatchEvent(new CustomEvent('openRegisterModal'));
              }}
            >
              Começar Agora
            </Button>
          </div>

          <div className="relative">
            <DesktopMoldura />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
