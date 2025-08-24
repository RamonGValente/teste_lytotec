
import React from "react";
import { User, Mail, Calendar, Shield, AlertCircle, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ProfileType } from "@/types/permissao";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { validateFunctionRemoval, cleanFunctionArray } from "@/utils/permissionValidation";

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileType | null;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRemoving, setIsRemoving] = React.useState(false);

  if (!profile) return null;

  const currentFunctions = profile.funcoes || [];
  const hasPermissions = currentFunctions.length > 0 && 
    (currentFunctions.length > 1 || (currentFunctions.length === 1 && currentFunctions[0] !== 'user'));

  const getPermissionStatus = () => {
    if (!hasPermissions) {
      return { label: "Sem Permissão", variant: "destructive" as const, icon: AlertCircle };
    }
    return { label: "Com Permissão", variant: "default" as const, icon: Shield };
  };

  const status = getPermissionStatus();
  const StatusIcon = status.icon;

  const handleRemoveFunction = async (funcaoToRemove: string) => {
    setIsRemoving(true);
    try {
      console.log('🗑️ Removendo função:', funcaoToRemove, 'do usuário:', profile.id);
      console.log('📋 Funções atuais:', currentFunctions);
      
      // Validar remoção
      const validation = validateFunctionRemoval(currentFunctions, funcaoToRemove);
      if (!validation.isValid) {
        toast({
          title: "Erro de validação",
          description: validation.message,
          variant: "destructive",
        });
        return;
      }
      
      const newFuncoes = currentFunctions.filter(f => f !== funcaoToRemove);
      const finalFuncoes = cleanFunctionArray(newFuncoes);
      
      console.log('✅ Funções finais para salvar:', finalFuncoes);

      const { error } = await supabase
        .from('profiles')
        .update({ funcoes: finalFuncoes })
        .eq('id', profile.id);

      if (error) {
        console.error('❌ Erro ao remover função:', error);
        throw error;
      }

      console.log('✅ Função removida com sucesso');
      
      toast({
        title: "Função removida com sucesso",
        description: `A função "${funcaoToRemove}" foi removida do usuário.`,
        variant: "default",
      });

      // Atualizar múltiplos caches para garantir sincronização
      queryClient.invalidateQueries({ queryKey: ['all-profiles-corrected'] });
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['availableFunctions'] });
      
    } catch (error: any) {
      console.error('❌ Erro ao remover função:', error);
      toast({
        title: "Erro ao remover função",
        description: error.message || "Não foi possível remover a função.",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Detalhes do Usuário
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Avatar e informações básicas */}
          <div className="flex items-center gap-4">
            {profile.imagem_url ? (
              <img
                src={profile.imagem_url}
                alt={profile.nome_completo || "Usuário"}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold">
                {profile.nome_completo || "Nome não informado"}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                {profile.email}
              </div>
            </div>
          </div>

          <Separator />

          {/* Status de permissão */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Status de Permissão
            </h4>
            <div className="flex items-center gap-3">
              <Badge variant={status.variant} className="flex items-center gap-1">
                <StatusIcon className="h-3 w-3" />
                {status.label}
              </Badge>
            </div>
          </div>

          {/* Funções do usuário */}
          {hasPermissions && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium">Funções Atribuídas</h4>
                <div className="space-y-2">
                  {currentFunctions
                    .filter(funcao => funcao !== 'user')
                    .map((funcao, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                        <Badge variant="outline" className="font-medium">
                          {funcao}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFunction(funcao)}
                          disabled={isRemoving}
                          className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Informações de cadastro */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Informações de Cadastro
            </h4>
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data de cadastro:</span>
                <span>
                  {profile.created_at
                    ? new Date(profile.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID do usuário:</span>
                <span className="font-mono text-xs">{profile.id}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
