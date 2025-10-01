import React from 'react';
import BackButton from '../components/buttons/Back';

const TermsOfUse = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <BackButton />
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Termos de Uso</h1>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 py-6 sm:py-8 w-full">
        <div className="w-full">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">Termos de Uso</h1>
            <p className="text-sm sm:text-base text-gray-600">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>

          <div className="space-y-8 sm:space-y-10 text-gray-700 w-full">
            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">1. Aceitação dos Termos</h2>
              <p className="text-sm sm:text-base leading-relaxed">
                Ao utilizar o sistema FilaZero, você concorda em cumprir e estar vinculado a estes 
                Termos de Uso. Se você não concordar com qualquer parte destes termos, 
                não deve utilizar nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">2. Descrição do Serviço</h2>
              <p className="mb-4 text-sm sm:text-base leading-relaxed">
                O FilaZero é um sistema completo de gestão para restaurantes que inclui:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base">
                <li>Sistema de PDV (Ponto de Venda)</li>
                <li>Gestão de estoque e produtos</li>
                <li>Controle financeiro</li>
                <li>Relatórios e dashboards</li>
                <li>Sistema de delivery</li>
                <li>Emissão de NFe e NFCe</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">3. Conta do Usuário</h2>
              <p className="mb-4 text-sm sm:text-base leading-relaxed">
                Para utilizar nossos serviços, você deve:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base">
                <li>Fornecer informações verdadeiras e atualizadas</li>
                <li>Manter a confidencialidade de sua senha</li>
                <li>Ser responsável por todas as atividades em sua conta</li>
                <li>Notificar-nos imediatamente sobre uso não autorizado</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">4. Uso Aceitável</h2>
              <p className="mb-4 text-sm sm:text-base leading-relaxed">Você concorda em não:</p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base">
                <li>Usar o sistema para atividades ilegais</li>
                <li>Tentar acessar contas de outros usuários</li>
                <li>Interferir no funcionamento do sistema</li>
                <li>Distribuir vírus ou código malicioso</li>
                <li>Fazer engenharia reversa do software</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">5. Propriedade Intelectual</h2>
              <p className="text-sm sm:text-base leading-relaxed">
                Todo o conteúdo do sistema FilaZero, incluindo software, design, textos, 
                imagens e funcionalidades, é propriedade da FilaZero e está protegido por 
                leis de direitos autorais e propriedade intelectual.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">6. Limitação de Responsabilidade</h2>
              <p className="text-sm sm:text-base leading-relaxed">
                O FilaZero não será responsável por danos diretos, indiretos, incidentais 
                ou consequenciais resultantes do uso ou impossibilidade de uso de nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">7. Modificações</h2>
              <p className="text-sm sm:text-base leading-relaxed">
                Reservamo-nos o direito de modificar estes termos a qualquer momento. 
                As alterações entrarão em vigor imediatamente após a publicação. 
                O uso continuado do serviço constitui aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">8. Contato</h2>
              <p className="mb-4 text-sm sm:text-base leading-relaxed">
                Para questões relacionadas a estes Termos de Uso, entre em contato:
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

export default TermsOfUse;
