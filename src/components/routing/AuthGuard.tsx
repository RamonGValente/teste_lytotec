
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { userId, isLoading: authLoading } = useAuth();

  // Aguardar carregamento da autenticação
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  // Se não está autenticado, redirecionar para login
  if (!userId) {
    return <Navigate to="/login" replace />;
  }

  // SIMPLIFICADO: AuthGuard apenas verifica autenticação
  // A verificação de permissões fica com RouteProtection
  console.log('✅ AuthGuard - Usuário autenticado:', userId);
  return <>{children}</>;
};

export default AuthGuard;
