import React from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Check, Star } from 'lucide-react';

const PricingSection = () => {
  const plans = [
    {
      name: "Gratuito",
      price: "R$ 0",
      period: "/mês",
      description: "Perfeito para começar",
      features: [
        "PDV e pontos de atendimento",
        "Sistema de gestão",
        "Controle de estoque",
        "Controle financeiro",
        "Relatórios",
        "Emissões de NFE e NFC",
        "Suporte prioritário",
      ],
      popular: false,
      cta: "Começar Grátis",
      testPeriod: null,
    },
    {
      name: "Pró",
      price: "R$ 30",
      period: "/mês",
      description: "Funcionalidades completas",
      features: [
        "Tudo do plano Gratuito",
        "Sistema de cozinha digital",
        "Sistema de delivery",
        "Cardápio digital",
      ],
      popular: true,
      cta: "Teste Grátis",
      testPeriod: "30 dias",
    },
    {
      name: "Anual",
      price: "R$ 288",
      period: "/ano",
      description: "20% de desconto no plano anual",
      originalPrice: "R$ 360",
      features: [
        "Tudo do plano Pró",
        "Pagamento único anual",
        "Desconto de 20%",
        "Suporte Prioritário",
        "Todas as funcionalidades",
      ],
      popular: false,
      cta: "Teste Grátis",
      testPeriod: "30 dias",
    },
    {
      name: "Vitalício",
      price: "R$ 399",
      period: "pagamento único",
      description: "Licença vitalícia permanente",
      features: [
        "Todas as funcionalidades do Pró",
        "Licença vitalícia",
        "Sem mensalidades",
        "Uso ilimitado",
      ],
      popular: false,
      cta: "Comprar Licença",
      testPeriod: null,
    },
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Preços Transparentes
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-center sm:text-left">
            Escolha o plano ideal para seu <span className="text-gray-900">restaurante</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Comece grátis e evolua conforme seu negócio cresce. Sem taxas ocultas, sem surpresas.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-6 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative p-3 sm:p-4 md:p-6 flex flex-col ${
                plan.popular ? "border-blue-500 shadow-lg scale-105 bg-blue-50" : "hover:shadow-md"
              } transition-all duration-300`}
            >
              {plan.popular && (
                <Badge className="absolute -top-2 sm:-top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-xs">
                  <Star className="w-2 h-2 sm:w-3 sm:h-3 mr-1" />
                  <span className="hidden sm:inline">Mais Popular</span>
                  <span className="sm:hidden">Popular</span>
                </Badge>
              )}

              <div className="text-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-2">
                  <span className="text-2xl sm:text-3xl font-bold">{plan.price}</span>
                  <span className="text-sm sm:text-base text-gray-600">{plan.period}</span>
                </div>
                {plan.originalPrice && (
                  <p className="text-xs sm:text-sm text-gray-500 line-through">Era {plan.originalPrice}/ano</p>
                )}
                {plan.testPeriod && (
                  <div className="mb-2">
                    <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">
                      {plan.testPeriod} de teste grátis
                    </span>
                  </div>
                )}
                <p className="text-xs sm:text-sm text-gray-600">{plan.description}</p>
              </div>

              <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 flex-1">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-1.5 sm:gap-2">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <Button 
                  className="w-full text-xs sm:text-sm py-2 sm:py-3" 
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => {
                    // Disparar evento para abrir modal de registro
                    window.dispatchEvent(new CustomEvent('openRegisterModal'));
                  }}
                >
                  {plan.cta}
                </Button>
              </div>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
};

export default PricingSection;
