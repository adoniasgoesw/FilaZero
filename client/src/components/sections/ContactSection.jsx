import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Mail, Phone, MapPin, MessageCircle, Loader2, Bot, Smile } from 'lucide-react';
import api from '../../services/api';
import ConfirmDialog from '../elements/ConfirmDialog';
import Zerinho from '../ia/Zerinho';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    whatsapp: '',
    restaurante: '',
    mensagem: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await api.post('/contato', formData);
      
      if (response.success) {
        setShowConfirmDialog(true);
        setFormData({
          nome: '',
          email: '',
          whatsapp: '',
          restaurante: '',
          mensagem: ''
        });
      } else {
        console.error('Erro ao enviar mensagem:', response.message);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-16 sm:py-20 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Entre em Contato
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl px-4 text-gray-600 max-w-3xl mx-auto">
            Tem alguma dúvida? Quer saber mais sobre o FilaZero? 
            Nossa equipe está pronta para te ajudar!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
          {/* Formulário de Contato */}
          <Card className="p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">
              Envie sua Mensagem
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="text-sm sm:text-sm font-medium mb-2 block text-gray-700">
                    Nome Completo *
                  </label>
                  <Input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    placeholder="Seu nome completo"
                    required
                    className="text-sm h-10 sm:h-11"
                  />
                </div>
                
                <div>
                  <label className="text-sm sm:text-sm font-medium mb-2 block text-gray-700">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="text-sm h-10 sm:h-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="text-sm sm:text-sm font-medium mb-2 block text-gray-700">
                    WhatsApp
                  </label>
                  <Input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="text-sm h-10 sm:h-11"
                  />
                </div>
                
                <div>
                  <label className="text-sm sm:text-sm font-medium mb-2 block text-gray-700">
                    Nome do Restaurante
                  </label>
                  <Input
                    type="text"
                    value={formData.restaurante}
                    onChange={(e) => handleInputChange('restaurante', e.target.value)}
                    placeholder="Nome do seu estabelecimento"
                    className="text-sm h-10 sm:h-11"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm sm:text-sm font-medium mb-2 block text-gray-700">
                  Mensagem *
                </label>
                <Textarea
                  value={formData.mensagem}
                  onChange={(e) => handleInputChange('mensagem', e.target.value)}
                  placeholder="Conte-nos como podemos te ajudar..."
                  required
                  rows={4}
                  className="resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 sm:h-14 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Enviando...
                  </div>
                ) : (
                  'Enviar Mensagem'
                )}
              </Button>
            </form>
          </Card>

          {/* Informações de Contato */}
          <div className="space-y-6 sm:space-y-8">
            {/* Informações de Contato */}
            <Card className="p-3 sm:p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
                Informações de Contato
              </h3>
              
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">Email</h4>
                    <p className="text-sm text-gray-600 break-all">adoniasgoes86@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">WhatsApp</h4>
                    <p className="text-sm text-gray-600">(43) 99961-8852</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">Localização</h4>
                    <p className="text-sm text-gray-600">Ortigueira, PR - Brasil</p>
                  </div>
                </div>
              </div>
            </Card>

             {/* Ações Rápidas */}
             <div className="space-y-4">
               <Card className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Suporte Rápido</h3>
                 <p className="text-sm text-gray-700 mb-4">
                   Precisa de ajuda imediata? Fale com o Zerinho, nosso assistente virtual!
                 </p>
                 <Button
                   onClick={() => setShowChat(true)}
                   className="text-sm w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                 >
                   Falar com Zerinho
                 </Button>
               </Card>

               <Card className="p-3 sm:p-4 bg-white rounded-lg border border-gray-200">
                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Teste Grátis</h3>
                 <p className="text-sm text-gray-700 mb-4">
                   Experimente o FilaZero por 30 dias sem compromisso!
                 </p>
                 <Button
                   onClick={() => window.dispatchEvent(new CustomEvent('openRegisterModal'))}
                   className="text-sm w-full sm:w-auto"
                   variant="outline"
                 >
                   Teste Grátis
                 </Button>
               </Card>
             </div>
          </div>
        </div>
      </div>

      {/* Chat Flutuante do Zerinho */}
      {showChat && <Zerinho isOpen={showChat} onClose={() => setShowChat(false)} />}

      {/* Diálogo de Confirmação */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onPrimary={() => setShowConfirmDialog(false)}
        onSecondary={null}
        title="Mensagem Enviada! 🎉"
        message="Obrigado pelo contato! Retornaremos o mais breve possível. Nossa equipe está ansiosa para ajudá-lo a revolucionar seu restaurante!"
        primaryLabel="Beleza!"
        secondaryLabel=""
        variant="dark"
        rightAlign={true}
        customIcon={<Smile className="w-6 h-6 text-yellow-500" />}
      />
    </section>
  );
};

export default ContactSection;
