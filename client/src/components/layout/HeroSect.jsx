import React from 'react';
import AccessButton from '../buttons/Access';
import paineisImage from '../../assets/paineis.png';

const HeroSect = ({ onPrimaryClick }) => {
  return (
    <section className="relative min-h-[80vh] bg-gradient-to-br from-slate-50 to-slate-200 overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-16 h-16 bg-white/50 rounded-2xl floating"></div>
      <div className="absolute top-40 right-20 w-12 h-12 bg-white/40 rounded-full floating-delayed"></div>
      <div className="absolute bottom-40 left-20 w-20 h-20 bg-white/40 rounded-3xl floating"></div>
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-white/30 blob"></div>

      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between min-h-[70vh]">
          <div className="lg:w-1/2 text-center lg:text-left mb-12 lg:mb-0">
            <div className="mb-6">
              <div className="flex items-center justify-center lg:justify-start mb-3">
                <svg className="w-10 h-10 mr-3 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <h1 className="text-3xl font-bold text-gray-800">FilaZero</h1>
              </div>
              <div className="w-16 h-0.5 bg-blue-500 mx-auto lg:mx-0"></div>
            </div>

            <h2 className="text-5xl lg:text-6xl font-bold text-gray-800 mb-6 leading-tight">
              Seu cliente <span className="text-blue-500">não espera</span>,<br />
              seu sistema <span className="text-gray-600">também não</span>
            </h2>

            <p className="text-xl text-gray-600 mb-8 max-w-lg leading-relaxed mx-auto lg:mx-0">
              Revolucione seu negócio alimentício com o sistema de gestão mais rápido e intuitivo do mercado
            </p>

            <div className="flex gap-4 justify-center lg:justify-start">
              <AccessButton onClick={onPrimaryClick} variant="blue">Começar Agora</AccessButton>
            </div>
          </div>

          <div className="lg:w-1/2 flex justify-center">
            <div className="relative perspective-1000">
              {/* Moldura do computador/tablet */}
              <div className="relative transform rotate-y-12 rotate-x-6 hover:rotate-y-6 hover:rotate-x-3 transition-transform duration-700 ease-out">
                {/* Tela do computador */}
                <div className="bg-gray-800 rounded-2xl p-4 shadow-2xl">
                  {/* Barra superior do computador */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-white text-sm font-medium">FilaZero - Ponto de Atendimento</div>
                    <div className="text-white text-sm">{new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</div>
                  </div>

                  {/* Conteúdo da tela - Imagem do painel */}
                  <div className="bg-white rounded-lg overflow-hidden h-[420px]">
                    <img 
                      src={paineisImage} 
                      alt="Painel de Atendimento FilaZero" 
                      className="w-full h-full object-cover"
                      style={{ objectPosition: '70% top' }}
                    />
                  </div>
                </div>

                {/* Elementos decorativos */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500/20 rounded-full animate-float" />
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-green-500/20 rounded-full animate-float-delayed" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSect;


