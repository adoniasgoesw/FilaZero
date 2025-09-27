import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Configuração do QueryClient com cache inteligente
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache por 3 segundos para dados estáticos
      staleTime: 3 * 1000, // 3 segundos
      // Manter no cache por 5 minutos
      gcTime: 5 * 60 * 1000, // 5 minutos
      // Refetch automático quando a janela ganha foco
      refetchOnWindowFocus: true,
      // Retry automático em caso de erro
      retry: 2,
      // Refetch em background para manter dados atualizados
      refetchOnMount: true,
    },
    mutations: {
      // Retry automático para mutações
      retry: 1,
    },
  },
});

const QueryProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools desabilitado - apenas para desenvolvimento local */}
      {false && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};

export default QueryProvider;
