
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    userId: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    console.log('🔐 useAuth - Inicializando...');
    
    // Configurar listener de mudanças de auth PRIMEIRO
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.email);
        
        setAuthState({
          user: session?.user ?? null,
          session: session,
          userId: session?.user?.id ?? null,
          isAuthenticated: !!session?.user,
          isLoading: false,
        });
      }
    );

    // Verificar sessão existente DEPOIS
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Erro ao obter sessão:', error);
        }
        
        console.log('🔐 Sessão inicial:', session?.user?.email || 'Nenhuma');
        
        setAuthState({
          user: session?.user ?? null,
          session: session,
          userId: session?.user?.id ?? null,
          isAuthenticated: !!session?.user,
          isLoading: false,
        });
      } catch (error) {
        console.error('❌ Erro na inicialização do auth:', error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();

    return () => {
      console.log('🔐 useAuth - Cleanup');
      subscription.unsubscribe();
    };
  }, []);

  return authState;
};
