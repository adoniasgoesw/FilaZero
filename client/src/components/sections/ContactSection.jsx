import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Mail, Phone, MapPin, MessageCircle, Loader2, Bot, Smile } from 'lucide-react';
import api from '../../services/api';
import BaseModal from '../modals/Base';
import ConfirmDialog from '../elements/ConfirmDialog';
import SendButton from '../buttons/Send';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    whatsapp: '',
    restaurante: '',
    mensagem: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados do chat
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  
  // Estado do ConfirmDialog
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Funções do chat
  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    // Adicionar mensagem do usuário
    const userMessage = {
      id: Date.now(),
      text: chatMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setChatMessage('');
    setIsTyping(true);

    // Simular resposta do bot após 2 segundos
    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        text: 'Obrigado pela sua mensagem! Nossa equipe de suporte entrará em contato em breve.',
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.nome || !formData.email || !formData.mensagem) {
      alert('Nome, email e mensagem são obrigatórios');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await api.post('/fale-conosco', formData);
      
      if (response.success) {
        // Mostrar ConfirmDialog de sucesso
        setShowSuccessDialog(true);
        
        // Limpar formulário
        setFormData({
          nome: '',
          email: '',
          whatsapp: '',
          restaurante: '',
          mensagem: ''
        });
      } else {
        alert(response.message || 'Erro ao enviar mensagem');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Pronto para revolucionar seu <span className="text-gray-900">restaurante?</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Entre em contato conosco e descubra como o FilaZero pode transformar a gestão do seu negócio.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 max-w-6xl mx-auto">
          <Card className="p-4 sm:p-6 md:p-8">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Fale Conosco</h3>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 block">Nome *</label>
                  <Input 
                    placeholder="Seu nome completo" 
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    required
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 block">Email *</label>
                  <Input 
                    type="email" 
                    placeholder="seu@email.com" 
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 block">WhatsApp</label>
                <Input 
                  placeholder="(43) 99961-8852" 
                  value={formData.whatsapp}
                  onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                  className="text-sm"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 block">Nome do Restaurante</label>
                <Input 
                  placeholder="Nome do seu estabelecimento" 
                  value={formData.restaurante}
                  onChange={(e) => handleInputChange('restaurante', e.target.value)}
                  className="text-sm"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 block">Mensagem *</label>
                <Textarea 
                  placeholder="Conte-nos sobre seu restaurante e como podemos ajudar..." 
                  rows={3}
                  value={formData.mensagem}
                  onChange={(e) => handleInputChange('mensagem', e.target.value)}
                  required
                  className="text-sm"
                />
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full text-sm sm:text-base py-3 sm:py-4" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Enviar Mensagem
                  </>
                )}
              </Button>
            </form>
          </Card>

          <div className="space-y-6 sm:space-y-8">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Informações de Contato</h3>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 rounded-lg bg-blue-100">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base">Email</h4>
                    <p className="text-xs sm:text-sm text-gray-600">adoniasgoes86@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 rounded-lg bg-green-100">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base">WhatsApp</h4>
                    <p className="text-xs sm:text-sm text-gray-600">(43) 99961-8852</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 rounded-lg bg-blue-100">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base">Endereço</h4>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Ortigueira, PR
                      <br />
                      Brasil
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="p-4 sm:p-6 bg-blue-50 border-blue-200">
              <h4 className="font-bold mb-2 sm:mb-3 text-sm sm:text-base">Suporte Técnico</h4>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                Nossa equipe está disponível para ajudar você a implementar o FilaZero no seu restaurante.
              </p>
              <Button variant="outline" size="sm" onClick={() => setShowChatModal(true)} className="text-xs sm:text-sm">
                Conversar com Suporte
              </Button>
            </Card>

            <Card className="p-4 sm:p-6 bg-gray-50 border-gray-200">
              <h4 className="font-bold mb-2 sm:mb-3 text-sm sm:text-base">Teste Grátis</h4>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                Experimente todas as funcionalidades por 30 dias, sem compromisso.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  // Disparar evento para abrir modal de registro
                  window.dispatchEvent(new CustomEvent('openRegisterModal'));
                }}
                className="text-xs sm:text-sm"
              >
                Iniciar Teste
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de Chat */}
      {showChatModal && (
        <BaseModal
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          title="Suporte FilaZero"
          icon={Bot}
          hideDefaultButtons={true}
          showButtons={false}
          headerContent={<div></div>}
          showBorder={false}
        >
          <div className="h-[500px] flex flex-col">
            {/* Header do Chat */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-gray-50">
              <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Suporte FilaZero</h3>
            </div>

            {/* Área de Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                  <Bot className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Olá! Como posso ajudá-lo hoje?</p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Indicador de digitação */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 border border-gray-200 p-3 rounded-lg">
                    <div className="flex items-center gap-1">
                      <Bot className="w-4 h-4 text-gray-600" />
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer customizado com input de mensagem e botão Send - fixado no bottom exato */}
            <div 
              className="absolute -bottom-10 left-0 right-0 p-3 border-t border-gray-200 bg-white"
              style={{ bottom: '2px' }}
            >
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full"
                  />
                </div>
                <SendButton
                  onClick={handleSendMessage}
                  disabled={!chatMessage.trim()}
                />
              </div>
            </div>
          </div>
        </BaseModal>
      )}


      {/* ConfirmDialog de Sucesso */}
      <ConfirmDialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        onPrimary={() => setShowSuccessDialog(false)}
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
