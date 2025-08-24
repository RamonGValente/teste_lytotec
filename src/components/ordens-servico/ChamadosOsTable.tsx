
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
  AlertCircle,
  Wrench,
  CheckCircle2, 
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ChamadosOsTableProps {
  chamados: any[];
  onConvert: (chamado: any) => void;
  onView: (chamado: any) => void;
  isLoading: boolean;
  isError?: boolean;
  errorMessage?: string;
}

const ChamadosOsTable: React.FC<ChamadosOsTableProps> = ({
  chamados,
  onConvert,
  onView,
  isLoading,
  isError = false,
  errorMessage = "Ocorreu um erro ao carregar os dados. Tente novamente."
}) => {
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

  // Helper function to check if a chamado is already converted
  const isChamadoConvertido = (status: string) => {
    return status === 'Convertido para OS' || status === 'OS em Andamento' || status === 'Concluído';
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
              <div className="grid grid-cols-6 gap-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
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
        <AlertTitle>Erro ao carregar chamados</AlertTitle>
        <AlertDescription>
          {errorMessage}
        </AlertDescription>
      </Alert>
    );
  }

  if (chamados.length === 0) {
    return (
      <div className="border rounded-md p-8 text-center">
        <h3 className="text-lg font-medium mb-2">Nenhum chamado encontrado</h3>
        <p className="text-muted-foreground">
          Não há chamados abertos que correspondam aos critérios de busca. Verifique os filtros aplicados.
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
          {chamados.map((chamado) => (
            <TableRow 
              key={chamado.id}
              className={isChamadoConvertido(chamado.status) ? "opacity-75 bg-gray-50" : ""}
            >
              <TableCell className="font-medium">
                {chamado.numero_chamado}
              </TableCell>
              <TableCell>{chamado.centro_custo?.codigo_centro_custo || "-"}</TableCell>
              <TableCell>
                {chamado.caminhao_equipamento ? (
                  <>
                    <div className="font-medium">{chamado.caminhao_equipamento.placa || chamado.caminhao_equipamento.modelo}</div>
                    <div className="text-xs text-muted-foreground">
                      {chamado.caminhao_equipamento.tipo_veiculo} {chamado.caminhao_equipamento.marca}
                    </div>
                  </>
                ) : "-"}
              </TableCell>
              <TableCell>
                {format(new Date(chamado.data_solicitacao), "dd/MM/yyyy", { locale: ptBR })}
              </TableCell>
              <TableCell>{getPriorityBadge(chamado.prioridade)}</TableCell>
              <TableCell>
                {isChamadoConvertido(chamado.status) ? (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                    {chamado.status}
                  </Badge>
                ) : (
                  <Badge variant="destructive">{chamado.status}</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onView(chamado);
                    }}
                    title="Visualizar"
                  >
                    <Eye className="h-4 w-4 text-blue-600" />
                    <span className="sr-only">Visualizar</span>
                  </Button>
                  
                  {!isChamadoConvertido(chamado.status) ? (
                    <Button 
                      variant="outline" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onConvert(chamado);
                      }}
                      className="flex items-center"
                    >
                      <Wrench className="h-4 w-4 mr-2" />
                      Converter
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      disabled
                      className="flex items-center opacity-50 cursor-not-allowed"
                      title="Chamado já convertido"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Convertido
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ChamadosOsTable;
