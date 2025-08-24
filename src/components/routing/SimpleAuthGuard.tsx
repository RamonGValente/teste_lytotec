
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

interface SimpleAuthGuardProps {
  children: React.ReactNode;
}

const SimpleAuthGuard: React.FC<SimpleAuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading, userId } = useAuth();

  console.log('🔐 [SimpleAuthGuard] Estado atual:', { isAuthenticated, isLoading, userId });

  if (isLoading) {
    console.log('🔐 [SimpleAuthGuard] Ainda carregando auth...');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  if (!isAuthenticated || !userId) {
    console.log('🔄 [SimpleAuthGuard] Usuário não autenticado - redirecionando para login');
    return <Navigate to="/login" replace />;
  }

  console.log('✅ [SimpleAuthGuard] Usuário autenticado');
  return <>{children}</>;
};

export default SimpleAuthGuard;
