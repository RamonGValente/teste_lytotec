
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export const useUserProfile = () => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { userId, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadUser = async () => {
      if (!isAuthenticated || !userId) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔍 Carregando perfil do usuário:', userId);
        
        // Buscar perfil do usuário com fallback robusto
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.warn('⚠️ Erro ao buscar perfil (RLS corrigida):', error);
          // Criar fallback com dados básicos da auth
          const { data: { user: authUser } } = await supabase.auth.getUser();
          const fallbackUser = {
            id: userId,
            email: authUser?.email,
            nome_completo: authUser?.user_metadata?.nome_completo || authUser?.email,
            funcoes: ['user'], // Função padrão
            imagem_url: null
          };
          console.log('🔄 Usando fallback para usuário:', fallbackUser);
          setUser(fallbackUser);
        } else if (profile) {
          console.log('✅ Perfil carregado com sucesso:', profile);
          setUser(profile);
        } else {
          // Perfil não encontrado, usar dados da auth
          const { data: { user: authUser } } = await supabase.auth.getUser();
          const fallbackUser = {
            id: userId,
            email: authUser?.email,
            nome_completo: authUser?.user_metadata?.nome_completo || authUser?.email,
            funcoes: ['user'],
            imagem_url: null
          };
          console.log('🔄 Perfil não encontrado, usando fallback:', fallbackUser);
          setUser(fallbackUser);
        }
      } catch (error) {
        console.error("❌ Erro ao carregar usuário:", error);
        // Fallback de emergência
        const { data: { user: authUser } } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
        if (authUser) {
          const emergencyUser = {
            id: userId,
            email: authUser.email,
            nome_completo: authUser.user_metadata?.nome_completo || authUser.email,
            funcoes: ['user'],
            imagem_url: null
          };
          console.log('🆘 Usando fallback de emergência:', emergencyUser);
          setUser(emergencyUser);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [userId, isAuthenticated]);

  const handleUpdateUserImage = async (file: File): Promise<string> => {
    if (!user) return '';
    
    try {
      console.log('📸 Atualizando imagem do usuário...');
      
      // Criar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;
      
      // Upload para o Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        });
        
      if (uploadError) throw uploadError;
      
      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      // Atualizar tabela profiles
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ imagem_url: publicUrl })
        .eq('id', user.id);
        
      if (updateError) {
        console.warn('⚠️ Erro ao atualizar profile, mas upload OK:', updateError);
        // Mesmo com erro no update, a imagem foi feita upload
      }
      
      // Atualizar estado local
      setUser({
        ...user,
        imagem_url: publicUrl
      });
      
      toast({
        title: "Imagem atualizada com sucesso! ✅",
        description: "Sua foto de perfil foi atualizada.",
      });
      
      return publicUrl;
    } catch (error) {
      console.error("❌ Erro ao atualizar imagem:", error);
      toast({
        title: "Erro ao atualizar imagem",
        description: "Houve um problema ao atualizar sua foto de perfil.",
        variant: "destructive",
      });
      return '';
    }
  };

  return {
    user,
    isLoading,
    updateUserImage: handleUpdateUserImage
  };
};
