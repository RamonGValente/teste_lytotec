
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, Wrench } from "lucide-react";
import { ChamadoOS } from "@/types/chamadoOS";
import { Separator } from "@/components/ui/separator";

interface ChamadosDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  chamado: ChamadoOS | null;
  isLoading: boolean;
  onConvertToOS?: (chamado: ChamadoOS) => void;
}

const ChamadosDetailsModal: React.FC<ChamadosDetailsModalProps> = ({
  isOpen,
  onClose,
  chamado,
  isLoading,
  onConvertToOS
}) => {
  if (!chamado) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aberto':
        return <Badge variant="destructive">{status}</Badge>;
      case 'Convertido para OS':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">{status}</Badge>;
      case 'OS em Andamento':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">{status}</Badge>;
      case 'Concluído':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Emergencial':
        return <Badge variant="destructive">🔴 {priority}</Badge>;
      case 'Alta':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">🟠 {priority}</Badge>;
      case 'Média':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">🟡 {priority}</Badge>;
      case 'Baixa':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">🟢 {priority}</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const isConvertible = chamado.status === 'Aberto' && onConvertToOS;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Detalhes do Chamado #{chamado.numero_chamado}</DialogTitle>
          <DialogDescription>
            Informações completas do chamado.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Número</h3>
                <p className="mt-1 text-sm font-semibold">{chamado.numero_chamado}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="mt-1">{getStatusBadge(chamado.status)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Data de Solicitação</h3>
                <p className="mt-1 text-sm">
                  {format(new Date(chamado.data_solicitacao), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Hora</h3>
                <p className="mt-1 text-sm">{chamado.hora_solicitacao}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Centro de Custo</h3>
                <p className="mt-1 text-sm">
                  {chamado.centro_custo 
                    ? `${chamado.centro_custo.codigo_centro_custo} - ${chamado.centro_custo.nome_centro_custo}` 
                    : "-"}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Prioridade</h3>
                <p className="mt-1">{getPriorityBadge(chamado.prioridade)}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Caminhão/Equipamento</h3>
              <p className="mt-1 text-sm">
                {chamado.caminhao_equipamento 
                  ? `${chamado.caminhao_equipamento.placa || ""} ${chamado.caminhao_equipamento.marca || ""} ${chamado.caminhao_equipamento.modelo || ""}`.trim()
                  : "-"}
              </p>
              <p className="text-xs text-gray-500">
                {chamado.caminhao_equipamento?.tipo_veiculo || ""}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Solicitante</h3>
              <p className="mt-1 text-sm">
                {chamado.solicitante 
                  ? chamado.solicitante.nome_completo || chamado.solicitante.email 
                  : "-"}
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-gray-500">Descrição do Problema</h3>
              <p className="mt-1 text-sm whitespace-pre-wrap">{chamado.descricao_problema || "-"}</p>
            </div>

            {chamado.fotos_avarias && chamado.fotos_avarias.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Fotos das Avarias</h3>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {chamado.fotos_avarias.map((foto, index) => (
                    <div key={index} className="overflow-hidden rounded-md">
                      <img src={foto} alt={`Avaria ${index + 1}`} className="h-24 w-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          
          {isConvertible && (
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => onConvertToOS && onConvertToOS(chamado)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wrench className="mr-2 h-4 w-4" />
              )}
              Converter para OS
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChamadosDetailsModal;
