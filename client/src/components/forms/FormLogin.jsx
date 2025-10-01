import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { login, setAuthData } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import CloseButton from '../buttons/Close';
import { formatCPF, unformatCPF } from '../../utils/cpfFormatter';

function FormLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    cpf: '',
    password: '',
    rememberMe: false
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let processedValue = value;
    
    // Formatar CPF automaticamente
    if (name === 'cpf') {
      processedValue = formatCPF(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue
    }));
    
    // Limpar erro quando o usuário digitar
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Fazer login via API (enviar CPF sem formatação)
      const response = await login({
        cpf: unformatCPF(formData.cpf),
        senha: formData.password
      });

      if (response.success) {
        // Salvar dados de autenticação
        setAuthData(response.data.token, response.data.usuario);
        
        // Salvar IDs no localStorage para uso no sistema
        localStorage.setItem('userId', response.data.usuario.id);
        localStorage.setItem('estabelecimentoId', response.data.usuario.estabelecimento_id);
        
        // Redirecionar para a página Home
        navigate('/home');
      }
    } catch (error) {
      setError(error.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header do formulário */}
      <div className="p-4 sm:p-6 pb-4">
        <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg text-[24px] sm:text-3xl md:text-3xl font-bold text-gray-900 mb-0">Bem-vindo de volta!</h1>
              <p className="text-gray-400 text-xs sm:text-sm font-light">Por favor, preencha seus dados</p>
            </div>
          <CloseButton onClick={() => {
            console.log('Close button clicked in FormLogin');
            // Disparar evento para fechar o modal com animação
            window.dispatchEvent(new CustomEvent('closeModal'));
          }} variant="minimal" />
        </div>
      </div>

      {/* Conteúdo do formulário */}
      <div className="flex-1 px-4 sm:px-6 pb-6">

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Campo CPF */}
      <div className="space-y-2">
        <label htmlFor="cpf" className="block text-xs sm:text-sm font-medium text-gray-700">
          CPF
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="cpf"
            name="cpf"
            value={formData.cpf}
            onChange={handleInputChange}
            placeholder="000.000.000-00"
            className="block w-full pl-8 sm:pl-10 pr-3 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Campo Senha */}
      <div className="space-y-2">
        <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-gray-700">
          Senha
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Digite sua senha"
            className="block w-full pl-8 sm:pl-10 pr-10 sm:pr-12 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            ) : (
              <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Esqueci a senha */}
      <div className="flex justify-start">
        <a
          href="#"
          className="text-xs sm:text-sm font-bold text-gray-900 hover:text-gray-700"
        >
          Esqueci a senha
        </a>
      </div>

      {/* Botão de Login */}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full flex items-center justify-center gap-2 py-2 sm:py-3 px-4 rounded-lg text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors duration-200 ${
          isLoading
            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
            : 'bg-gray-900 text-white hover:bg-gray-800'
        }`}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Entrando...</span>
          </>
        ) : (
          <span>Entrar</span>
        )}
      </button>

      {/* Link para cadastro */}
      <div className="text-center">
        <p className="text-xs sm:text-sm text-gray-500">
          Não possui uma conta?{' '}
          <button
            type="button"
            className="text-gray-900 hover:text-gray-700 font-bold"
            onClick={() => window.dispatchEvent(new CustomEvent('switchToRegister'))}
            disabled={isLoading}
          >
            Cadastrar nova conta
          </button>
        </p>
      </div>
      </form>
      </div>
    </div>
  );
}

export default FormLogin;