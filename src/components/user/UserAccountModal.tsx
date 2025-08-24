
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserProfileData {
  id: string;
  email: string;
  nome_completo?: string;
  imagem_url?: string;
}

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfileData | null;
}

const UserAccountModal: React.FC<UserAccountModalProps> = ({ isOpen, onClose, userProfile }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<{
    nome_completo: string;
  }>({
    nome_completo: '',
  });

  React.useEffect(() => {
    if (userProfile) {
      setFormData({
        nome_completo: userProfile.nome_completo || '',
      });
    }
  }, [userProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    setIsSubmitting(true);
    try {
      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          nome_completo: formData.nome_completo,
        })
        .eq('id', userProfile.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });

      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar suas informações.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Minha Conta</DialogTitle>
        </DialogHeader>

        {userProfile && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={userProfile.imagem_url || ''} alt={userProfile.nome_completo || ''} />
                <AvatarFallback>
                  {userProfile.nome_completo?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome_completo">Nome completo</Label>
                <Input
                  id="nome_completo"
                  name="nome_completo"
                  value={formData.nome_completo}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={userProfile.email}
                  disabled
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                    Salvando...
                  </>
                ) : (
                  "Salvar alterações"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserAccountModal;
