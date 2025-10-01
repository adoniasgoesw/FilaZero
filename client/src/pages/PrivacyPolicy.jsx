import React from 'react';
import BackButton from '../components/buttons/Back';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Política de Privacidade</h1>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 py-6 sm:py-8 w-full">
        <div className="w-full">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">Política de Privacidade</h1>
            <p className="text-sm sm:text-base text-gray-600">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>

          <div className="space-y-8 sm:space-y-10 text-gray-700 w-full">
            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">1. Informações que Coletamos</h2>
              <p className="mb-4 text-sm sm:text-base leading-relaxed">
                Coletamos informações que você nos fornece diretamente, como quando você:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base">
                <li>Cria uma conta em nosso sistema</li>
                <li>Preenche formulários de contato</li>
                <li>Utiliza nossos serviços de PDV e gestão</li>
                <li>Se comunica conosco via WhatsApp ou email</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">2. Como Utilizamos suas Informações</h2>
              <p className="mb-4 text-sm sm:text-base leading-relaxed">Utilizamos suas informações para:</p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base">
                <li>Fornecer e melhorar nossos serviços</li>
                <li>Processar pedidos e transações</li>
                <li>Enviar notificações importantes sobre o sistema</li>
                <li>Oferecer suporte técnico</li>
                <li>Comunicar atualizações e novidades</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">3. Compartilhamento de Informações</h2>
              <p className="text-sm sm:text-base leading-relaxed">
                Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, 
                exceto quando necessário para fornecer nossos serviços ou quando exigido por lei.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">4. Segurança dos Dados</h2>
              <p className="text-sm sm:text-base leading-relaxed">
                Implementamos medidas de segurança técnicas e organizacionais para proteger 
                suas informações contra acesso não autorizado, alteração, divulgação ou destruição.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">5. Seus Direitos</h2>
              <p className="mb-4 text-sm sm:text-base leading-relaxed">Você tem o direito de:</p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base">
                <li>Acessar suas informações pessoais</li>
                <li>Corrigir dados incorretos</li>
                <li>Solicitar a exclusão de seus dados</li>
                <li>Retirar seu consentimento a qualquer momento</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">6. Contato</h2>
              <p className="mb-4 text-sm sm:text-base leading-relaxed">
                Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco:
              </p>
              <div className="space-y-2">
                <p className="text-sm sm:text-base"><strong>Email:</strong> adoniasgoes86@gmail.com</p>
                <p className="text-sm sm:text-base"><strong>WhatsApp:</strong> (43) 99961-8852</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
