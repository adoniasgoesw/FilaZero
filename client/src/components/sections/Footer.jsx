import React from 'react';
import { Mail, Phone, MapPin, Instagram, Youtube } from 'lucide-react';
import { Button } from '../ui/Button';
import Logo from '../../assets/logo';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'Instagram',
      icon: Instagram,
      url: 'https://instagram.com/filazero',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500'
    },
    {
      name: 'TikTok',
      icon: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      ),
      url: 'https://tiktok.com/@filazero',
      color: 'bg-black'
    },
    {
      name: 'YouTube',
      icon: Youtube,
      url: 'https://youtube.com/@filazero',
      color: 'bg-red-600'
    }
  ];

  const handleSocialClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleLinkClick = (path) => {
    window.location.href = path;
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* Logo e Descrição */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <Logo 
                size="small" 
                className="bg-white hover:bg-gray-100 rounded-lg"
              />
              <span className="text-xl font-bold">FilaZero</span>
            </div>
            <p className="text-gray-300 text-sm mb-6 leading-relaxed">
              Sistema completo de gestão para restaurantes. PDV, delivery, 
              estoque e muito mais em uma única plataforma.
            </p>
            
            {/* Redes Sociais */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-200 mb-3">Siga-nos</h4>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <button
                      key={social.name}
                      onClick={() => handleSocialClick(social.url)}
                      className={`w-10 h-10 ${social.color} rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200 group`}
                      title={social.name}
                    >
                      {typeof IconComponent === 'function' ? (
                        <IconComponent />
                      ) : (
                        <IconComponent className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => handleLinkClick('/#hero')}
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Início
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('/#pricing')}
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Preços
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('/#contact')}
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Contato
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('/privacy-policy')}
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Política de Privacidade
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleLinkClick('/terms-of-use')}
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Termos de Uso
                </button>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contato</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">adoniasgoes86@gmail.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">(43) 99961-8852</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-300 text-sm block">Ortigueira, PR</span>
                  <span className="text-gray-300 text-sm">Brasil</span>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
            <p className="text-gray-300 text-sm mb-4">
              Receba novidades e dicas sobre gestão de restaurantes.
            </p>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Seu email"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <Button 
                size="sm" 
                className="w-full text-sm"
                onClick={() => {
                  // Disparar evento para abrir modal de registro
                  window.dispatchEvent(new CustomEvent('openRegisterModal'));
                }}
              >
                Inscrever-se
              </Button>
            </div>
          </div>
        </div>

        {/* Linha Divisória */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm text-center sm:text-left">
              © {currentYear} FilaZero. Todos os direitos reservados.
            </div>
            <div className="flex items-center gap-6 text-sm">
              <button
                onClick={() => handleLinkClick('/privacy-policy')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Privacidade
              </button>
              <button
                onClick={() => handleLinkClick('/terms-of-use')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Termos
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
