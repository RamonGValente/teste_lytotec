
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Wrench } from "lucide-react";
import { useUpdateEquipmentStatus } from "@/hooks/dashboard/useUpdateEquipmentStatus";

interface UpdateEquipmentStatusButtonProps {
  onStatusUpdated?: () => void;
}

export default function UpdateEquipmentStatusButton({ onStatusUpdated }: UpdateEquipmentStatusButtonProps) {
  const updateEquipmentStatus = useUpdateEquipmentStatus();

  const handleUpdate = async () => {
    try {
      await updateEquipmentStatus.mutateAsync();
      // Chamar callback para atualizar dados do dashboard
      onStatusUpdated?.();
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  return (
    <Button
      onClick={handleUpdate}
      disabled={updateEquipmentStatus.isPending}
      variant="outline"
      size="sm"
      className="h-9 gap-2 text-sm hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
      title="Atualizar status dos equipamentos não apontados hoje para 'Disponível'"
    >
      {updateEquipmentStatus.isPending ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <Wrench className="h-4 w-4" />
      )}
      {updateEquipmentStatus.isPending ? "Atualizando..." : "Atualizar Status"}
    </Button>
  );
}
