
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Eye, 
  Edit, 
  FileText, 
  AlertCircle
} from "lucide-react";
import { OrdemServico } from "@/types/ordemServico";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface OrdensServicoTableProps {
  ordensServico: OrdemServico[];
  onView: (id: string) => void;
  onEdit: (os: OrdemServico) => void;
  isLoading: boolean;
  isError?: boolean;
  errorMessage?: string;
}

const OrdensServicoTable: React.FC<OrdensServicoTableProps> = ({
  ordensServico,
  onView,
  onEdit,
  isLoading,
  isError = false,
  errorMessage = "Ocorreu um erro ao carregar os dados. Tente novamente."
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aberta':
        return <Badge variant="destructive">{status}</Badge>;
      case 'Em Andamento':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">{status}</Badge>;
      case 'Concluída':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">{status}</Badge>;
      case 'Cancelada':
        return <Badge variant="secondary">{status}</Badge>;
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

  if (isLoading) {
    return (
      <div className="border rounded-md">
        <div className="h-12 border-b px-4 flex items-center bg-muted/30">
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="p-4 space-y-4">
          {Array(5).fill(null).map((_, index) => (
            <div key={index} className="flex flex-col space-y-3">
              <div className="grid grid-cols-7 gap-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="h-px bg-muted-foreground/10" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro ao carregar ordens de serviço</AlertTitle>
        <AlertDescription>
          {errorMessage}
        </AlertDescription>
      </Alert>
    );
  }

  if (ordensServico.length === 0) {
    return (
      <div className="border rounded-md p-8 text-center">
        <h3 className="text-lg font-medium mb-2">Nenhuma ordem de serviço encontrada</h3>
        <p className="text-muted-foreground">
          Não há ordens de serviço cadastradas que correspondam aos critérios de busca.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número</TableHead>
            <TableHead>Obra</TableHead>
            <TableHead>Caminhão/Equipamento</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ordensServico.map((os) => (
            <TableRow key={os.id}>
              <TableCell 
                className="font-medium cursor-pointer hover:text-blue-600"
                onClick={() => onView(os.id)}
              >
                {os.numero_chamado}
              </TableCell>
              <TableCell>{os.centro_custo?.codigo_centro_custo || "-"}</TableCell>
              <TableCell>
                {os.caminhao_equipamento ? (
                  <>
                    <div className="font-medium">{os.caminhao_equipamento.placa || os.caminhao_equipamento.modelo}</div>
                    <div className="text-xs text-muted-foreground">
                      {os.caminhao_equipamento.tipo_veiculo} {os.caminhao_equipamento.marca}
                    </div>
                  </>
                ) : "-"}
              </TableCell>
              <TableCell>
                {format(new Date(os.data_solicitacao), "dd/MM/yyyy", { locale: ptBR })}
              </TableCell>
              <TableCell>{getPriorityBadge(os.prioridade)}</TableCell>
              <TableCell>{getStatusBadge(os.status)}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onView(os.id)}>
                    <Eye className="h-4 w-4 text-blue-600" />
                    <span className="sr-only">Visualizar</span>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onEdit(os)}>
                    <Edit className="h-4 w-4 text-amber-600" />
                    <span className="sr-only">Editar</span>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <FileText className="h-4 w-4 text-green-600" />
                    <span className="sr-only">Gerar PDF</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrdensServicoTable;
