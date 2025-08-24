import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight, Users } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { updateEquipe } from "@/services/equipe";
import { Equipe } from "@/types/equipe";

interface TransferMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceEquipe: Equipe;
  allEquipes: Equipe[];
  allFuncionarios: any[];
}

const TransferMembersModal: React.FC<TransferMembersModalProps> = ({
  isOpen,
  onClose,
  sourceEquipe,
  allEquipes,
  allFuncionarios
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [targetEquipeId, setTargetEquipeId] = useState<string>("");
  const [isTransferring, setIsTransferring] = useState(false);

  const getFuncionarioNameById = (id: string) => {
    const funcionario = allFuncionarios.find(f => f.id === id);
    return funcionario ? funcionario.nome_completo : "Funcionário não encontrado";
  };

  const getMemberRole = (id: string) => {
    if (id === sourceEquipe.encarregado_id) return "encarregado";
    if (id === sourceEquipe.apontador_id) return "apontador";
    return "membro";
  };

  const canTransferMember = (id: string) => {
    const role = getMemberRole(id);
    return role === "membro"; // Apenas membros regulares podem ser transferidos
  };

  const transferableMembers = sourceEquipe.equipe?.filter(canTransferMember) || [];

  const targetEquipeOptions = allEquipes
    .filter(eq => eq.id !== sourceEquipe.id)
    .map(eq => ({
      value: eq.id,
      label: eq.nome_equipe
    }));

  const toggleMemberSelection = (memberId: string) => {
    if (!canTransferMember(memberId)) {
      toast({
        title: "Não é possível transferir",
        description: "Encarregados e apontadores não podem ser transferidos.",
        variant: "destructive"
      });
      return;
    }

    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(prev => prev.filter(id => id !== memberId));
    } else {
      setSelectedMembers(prev => [...prev, memberId]);
    }
  };

  const handleTransfer = async () => {
    if (selectedMembers.length === 0 || !targetEquipeId) {
      toast({
        title: "Seleção incompleta",
        description: "Selecione membros e equipe de destino.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsTransferring(true);

      const targetEquipe = allEquipes.find(eq => eq.id === targetEquipeId);
      if (!targetEquipe) {
        throw new Error("Equipe de destino não encontrada");
      }

      const newSourceMembers = sourceEquipe.equipe?.filter(id => !selectedMembers.includes(id)) || [];

      await updateEquipe(sourceEquipe.id, {
        nome_equipe: sourceEquipe.nome_equipe,
        encarregado_id: sourceEquipe.encarregado_id,
        apontador_id: sourceEquipe.apontador_id,
        equipe: newSourceMembers
      });

      const newTargetMembers = [...(targetEquipe.equipe || []), ...selectedMembers];

      await updateEquipe(targetEquipeId, {
        nome_equipe: targetEquipe.nome_equipe,
        encarregado_id: targetEquipe.encarregado_id,
        apontador_id: targetEquipe.apontador_id,
        equipe: newTargetMembers
      });

      toast({
        title: "Transferência concluída",
        description: `${selectedMembers.length} membro(s) transferido(s) com sucesso.`
      });

      queryClient.invalidateQueries({ queryKey: ['equipes'] });
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });

      onClose();
      setSelectedMembers([]);
      setTargetEquipeId("");

    } catch (error) {
      console.error("Error transferring members:", error);
      toast({
        title: "Erro na transferência",
        description: error instanceof Error ? error.message : "Erro ao transferir membros.",
        variant: "destructive"
      });
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Transferir Membros - {sourceEquipe.nome_equipe}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Equipe de Destino</label>
            <select
              value={targetEquipeId}
              onChange={(e) => setTargetEquipeId(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
            >
              <option value="">Selecione a equipe de destino</option>
              {targetEquipeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">
              Membros Disponíveis para Transferência ({transferableMembers.length})
            </label>
            <div className="border rounded-md p-4 min-h-32 mt-2">
              {transferableMembers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center">
                  Nenhum membro disponível para transferência.
                  Apenas membros regulares podem ser transferidos.
                </p>
              ) : (
                <ScrollArea className="h-40">
                  <div className="flex flex-wrap gap-2">
                    {transferableMembers.map((memberId) => (
                      <Badge 
                        key={memberId}
                        variant={selectedMembers.includes(memberId) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-blue-100 p-2"
                        onClick={() => toggleMemberSelection(memberId)}
                      >
                        {getFuncionarioNameById(memberId)}
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Clique nos membros para selecioná-los para transferência.
            </p>
          </div>

          {selectedMembers.length > 0 && targetEquipeId && (
            <div className="bg-blue-50 p-3 rounded-md">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">
                  {selectedMembers.length} membro(s) selecionado(s)
                </span>
                <ArrowRight className="h-4 w-4" />
                <span className="font-medium">
                  {targetEquipeOptions.find(opt => opt.value === targetEquipeId)?.label}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isTransferring}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleTransfer}
            disabled={selectedMembers.length === 0 || !targetEquipeId || isTransferring}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isTransferring ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                Transferindo...
              </>
            ) : (
              <>
                <ArrowRight className="h-4 w-4 mr-2" />
                Transferir ({selectedMembers.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransferMembersModal;
