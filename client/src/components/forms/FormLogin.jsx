import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { login, setAuthData } from '../../services/api';
import { useNavigate } from 'react-router-dom';

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
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpar erro quando o usuário digitar
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Fazer login via API
      const response = await login({
        cpf: formData.cpf,
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Título do formulário */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Fazer Login</h2>
        <p className="text-gray-600 mt-2">Entre com suas credenciais</p>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Campo CPF */}
      <div className="space-y-2">
        <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">
          CPF
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="cpf"
            name="cpf"
            value={formData.cpf}
            onChange={handleInputChange}
            placeholder="000.000.000-00"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Campo Senha */}
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Senha
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Digite sua senha"
            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Lembrar de mim e Esqueci a senha */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="rememberMe"
            name="rememberMe"
            type="checkbox"
            checked={formData.rememberMe}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={isLoading}
          />
          <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
            Lembrar de mim
          </label>
        </div>
        <a
          href="#"
          className="text-sm text-blue-600 hover:text-blue-500 font-medium"
        >
          Esqueci a senha
        </a>
      </div>

      {/* Botão de Login */}
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 ${
          isLoading
            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Entrando...</span>
          </>
        ) : (
          <>
            <LogIn className="w-5 h-5" />
            <span>Entrar no Sistema</span>
          </>
        )}
      </button>

      {/* Link para cadastro */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Não possui uma conta?{' '}
          <button
            type="button"
            className="text-blue-600 hover:text-blue-500 font-medium"
            onClick={() => window.dispatchEvent(new CustomEvent('switchToRegister'))}
            disabled={isLoading}
          >
            Cadastrar nova conta
          </button>
        </p>
      </div>
    </form>
  );
}

export default FormLogin;
