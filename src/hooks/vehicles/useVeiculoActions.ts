
import { useToast } from "@/hooks/use-toast";
import { exportVeiculos } from "@/services/veiculoService";
import { Veiculo } from "@/types/veiculo";

export const useVeiculoUtils = (veiculos?: Veiculo[]) => {
  const { toast } = useToast();

  const exportToExcel = () => {
    if (veiculos && veiculos.length > 0) {
      exportVeiculos(veiculos);
      toast({
        title: "Exportação concluída",
        description: "Os veículos/equipamentos foram exportados com sucesso!",
      });
    } else {
      toast({
        title: "Erro ao exportar",
        description: "Não há veículos/equipamentos para exportar.",
        variant: "destructive",
      });
    }
  };

  return {
    exportToExcel,
  };
};

// For backwards compatibility
export const useVeiculoActions = useVeiculoUtils;
