
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, User, Calendar, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user
}) => {
  const [profile, setProfile] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        // First try to get the profiles entry
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
          
        if (profileError) throw profileError;
        
        // Then try to find the corresponding funcionario record
        let funcionarioData = null;
        if (user.email) {
          const { data: funcData, error: funcError } = await supabase
            .from('bd_funcionarios')
            .select(`
              *,
              empresa:bd_empresas(id, nome_empresa),
              departamento:bd_departamentos(id, nome_departamento),
              funcao:bd_funcoes(id, nome_funcao),
              centro_custo:bd_centros_custo(id, nome_centro_custo)
            `)
            .eq('email', user.email)
            .maybeSingle();
            
          if (!funcError && funcData) {
            funcionarioData = funcData;
          } else {
            // Try a case-insensitive search
            const { data: insensitiveData, error: insensitiveError } = await supabase
              .from('bd_funcionarios')
              .select(`
                *,
                empresa:bd_empresas(id, nome_empresa),
                departamento:bd_departamentos(id, nome_departamento),
                funcao:bd_funcoes(id, nome_funcao),
                centro_custo:bd_centros_custo(id, nome_centro_custo)
              `)
              .ilike('email', `%${user.email}%`)
              .maybeSingle();
              
            if (!insensitiveError && insensitiveData) {
              funcionarioData = insensitiveData;
            }
          }
        }
        
        setProfile({
          ...profileData,
          funcionario: funcionarioData
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (isOpen && user) {
      fetchProfile();
    }
  }, [isOpen, user]);
  
  // Generate user initials for the avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(n => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };
  
  const userName = profile?.nome_completo || profile?.funcionario?.nome_completo || user?.email || "Usuário";
  const userEmail = user?.email || profile?.email || profile?.funcionario?.email || "";
  const userImage = profile?.imagem_url || profile?.funcionario?.imagem;
  
  const renderProfileInfo = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </div>
      );
    }
    
    const funcionario = profile?.funcionario;
    
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-24 w-24">
            {userImage ? (
              <AvatarImage src={userImage} alt={userName} />
            ) : (
              <AvatarImage 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&size=96`} 
                alt={userName} 
              />
            )}
            <AvatarFallback className="text-2xl">{getInitials(userName)}</AvatarFallback>
          </Avatar>
          
          <div className="text-center">
            <h3 className="text-xl font-semibold">{userName}</h3>
            <p className="text-muted-foreground">{userEmail}</p>
          </div>
        </div>
        
        {funcionario && (
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium">Informações Profissionais</h4>
            
            {funcionario.funcao && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Função: </span>
                <span className="font-medium">{funcionario.funcao.nome_funcao}</span>
              </div>
            )}
            
            {funcionario.empresa && (
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>Empresa: </span>
                <span className="font-medium">{funcionario.empresa.nome_empresa}</span>
              </div>
            )}
            
            {funcionario.departamento && (
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>Departamento: </span>
                <span className="font-medium">{funcionario.departamento.nome_departamento}</span>
              </div>
            )}
            
            {funcionario.centro_custo && (
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>Centro de Custo: </span>
                <span className="font-medium">{funcionario.centro_custo.nome_centro_custo}</span>
              </div>
            )}
            
            {funcionario.data_admissao && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Data de Admissão: </span>
                <span className="font-medium">
                  {new Date(funcionario.data_admissao).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Perfil de Usuário</DialogTitle>
        </DialogHeader>
        {renderProfileInfo()}
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;
