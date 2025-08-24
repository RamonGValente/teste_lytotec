
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Wrench } from "lucide-react";

interface ChamadoDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConvert: (chamado: any) => void;
  chamado: any | null;
  isLoading: boolean;
}

const ChamadoDetailsModal: React.FC<ChamadoDetailsModalProps> = ({
  isOpen,
  onClose,
  onConvert,
  chamado,
  isLoading
}) => {
  if (!chamado) return null;

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aberto':
        return <Badge variant="destructive">{status}</Badge>;
      case 'Convertido para OS':
      case 'OS em Andamento':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">{status}</Badge>;
      case 'Concluído':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const isChamadoConvertido = (status: string) => {
    return status === 'Convertido para OS' || status === 'OS em Andamento' || status === 'Concluído';
  };

  const isConvertedOrProcessing = isChamadoConvertido(chamado.status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            Chamado #{chamado.numero_chamado}
            <div className="ml-2">
              {getStatusBadge(chamado.status)}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Prioridade</h3>
                <p className="mt-1">{getPriorityBadge(chamado.prioridade)}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Data de Solicitação</h3>
                <p className="mt-1">
                  {format(new Date(chamado.data_solicitacao), "dd/MM/yyyy", { locale: ptBR })}
                  {chamado.hora_solicitacao && (
                    <span> às {chamado.hora_solicitacao.substring(0, 5)}</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Dados do Caminhão/Equipamento</h3>
            {chamado.caminhao_equipamento ? (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="font-medium">{chamado.caminhao_equipamento.placa || chamado.caminhao_equipamento.modelo}</p>
                <p className="text-sm text-gray-600">
                  {chamado.caminhao_equipamento.tipo_veiculo} {chamado.caminhao_equipamento.marca} {chamado.caminhao_equipamento.modelo}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhum caminhão/equipamento associado</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Obra/Centro de Custo</h3>
            {chamado.centro_custo ? (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="font-medium">{chamado.centro_custo.codigo_centro_custo}</p>
                <p className="text-sm text-gray-600">{chamado.centro_custo.nome_centro_custo}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhum centro de custo associado</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Tipo de Falha</h3>
            <p>{chamado.tipo_falha || "Não especificado"}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Descrição do Problema</h3>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm">{chamado.descricao_problema || "Sem descrição"}</p>
            </div>
          </div>

          {chamado.fotos_avarias && chamado.fotos_avarias.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Fotos de Avarias</h3>
              <div className="grid grid-cols-2 gap-2">
                {chamado.fotos_avarias.map((foto: string, index: number) => (
                  <img 
                    key={index} 
                    src={foto} 
                    alt={`Avaria ${index + 1}`} 
                    className="h-32 w-full object-cover rounded-md"
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Solicitante</h3>
            {chamado.solicitante ? (
              <p>{chamado.solicitante.nome_completo || chamado.solicitante.email}</p>
            ) : (
              <p className="text-sm text-gray-500">Não especificado</p>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Fechar
          </Button>
          {!isConvertedOrProcessing && (
            <Button 
              onClick={() => onConvert(chamado)}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Convertendo...
                </>
              ) : (
                <>
                  <Wrench className="mr-2 h-4 w-4" />
                  Converter para OS
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChamadoDetailsModal;
