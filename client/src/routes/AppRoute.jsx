import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import React from 'react';
import Sidebar from '../components/layout/Sidebar';
import Home from '../pages/Home';
import Landing from '../pages/Landing';
import Config from '../pages/Config';
import Historic from '../pages/Historic';
import Cozinha from '../pages/Cozinha';
import Delivery from '../pages/Delivery';
import Clientes from '../pages/gestao/Clientes';
import Pagamentos from '../pages/gestao/Pagamentos';
import Usuarios from '../pages/gestao/Usuarios';
import Categorias from '../pages/gestao/Categorias';
import Produtos from '../pages/gestao/Produtos';
import PontoAtendimento from '../pages/PontoAtendimento';
import Caixas from '../pages/administracao/Caixas';
// import { useAutoSync } from '../hooks/useAutoSync';

// Componente wrapper para gerenciar o Sidebar
function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Obter ID do estabelecimento para sincronização
  // const estabelecimentoId = localStorage.getItem('estabelecimentoId');
  
  // Iniciar sincronização automática (desabilitada temporariamente para evitar loops)
  // useAutoSync(estabelecimentoId);
  
  React.useEffect(() => {
    // Forçar o scroll para o topo ao trocar de rota (especialmente no mobile)
    if (typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
    const el = document.scrollingElement;
    if (el && typeof el.scrollTo === 'function') {
      el.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [location.pathname]);

  // Redirecionar automaticamente para /home se já existir token salvo (login "para sempre")
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const isLanding = location.pathname === '/' || location.pathname === '/landing';
    if (token && isLanding) {
      navigate('/home', { replace: true });
    }
  }, [location.pathname, navigate]);
  const isLandingPage = location.pathname === '/' || location.pathname === '/landing';
  const isPontoAtendimento = location.pathname.startsWith('/ponto-atendimento');

  if (isPontoAtendimento) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/ponto-atendimento/:id" element={<PontoAtendimento />} />
          <Route path="*" element={<Navigate to="/ponto-atendimento/unknown" replace />} />
        </Routes>
      </div>
    );
  }

  if (isLandingPage) {
    return (
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/landing" element={<Landing />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="md:ml-20 pb-20 md:pb-0 min-h-screen">
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/config" element={<Config />} />
          <Route path="/historic" element={<Historic />} />
          <Route path="/cozinha" element={<Cozinha />} />
          <Route path="/delivery" element={<Delivery />} />
          <Route path="/gestao/clientes" element={<Clientes />} />
          <Route path="/gestao/pagamentos" element={<Pagamentos />} />
          <Route path="/gestao/usuarios" element={<Usuarios />} />
          <Route path="/gestao/categorias" element={<Categorias />} />
          <Route path="/gestao/produtos" element={<Produtos />} />
          <Route path="/administracao/caixas" element={<Caixas />} />
          <Route path="/ponto-atendimento/:id" element={<PontoAtendimento />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function AppRoute() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default AppRoute;
