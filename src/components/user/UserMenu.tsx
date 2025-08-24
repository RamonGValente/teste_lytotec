
import React from "react";
import { LogOut, User, Settings, Image } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { logoutUser } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UserMenuProps {
  onProfileClick?: () => void;
  onAccountClick?: () => void;
  onImageClick?: () => void;
  userImage?: string;
  userName?: string;
}

const UserMenu: React.FC<UserMenuProps> = ({
  onProfileClick,
  onAccountClick,
  onImageClick,
  userImage,
  userName = "Usuário"
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      console.log("Iniciando processo de logout");
      
      // Use diretamente o client Supabase para garantir que o logout funcione
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      console.log("Logout bem-sucedido, redirecionando para login");
      
      // Limpar qualquer estado local se necessário
      localStorage.removeItem("supabase.auth.token");
      
      toast({
        title: "Logout realizado",
        description: "Você saiu do sistema com sucesso",
      });
      
      // Redirecionamento após curto delay para garantir que o estado seja atualizado
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 100);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast({
        title: "Erro ao sair",
        description: "Ocorreu um erro ao tentar fazer logout",
        variant: "destructive",
      });
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={userImage || ""} alt={userName} />
            <AvatarFallback>{getInitials(userName)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm font-medium leading-none">{userName}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onProfileClick}>
          <User className="mr-2 h-4 w-4" />
          <span>Perfil do Usuário</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onAccountClick}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Configurações de Conta</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onImageClick}>
          <Image className="mr-2 h-4 w-4" />
          <span>Editar Imagem de Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
