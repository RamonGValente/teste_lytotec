
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Truck, Users, Package, Eye, Edit, RefreshCw, AlertCircle } from "lucide-react";
import { ListaProgramacaoEntrega } from "@/types/programacaoEntrega";
import { formatBrazilianDateForDisplay } from "@/utils/timezoneUtils";
import { formatMassaDisplay } from "@/utils/massaConversionUtils";
import { usePagination } from "@/hooks/usePagination";
import TablePagination from "@/components/ui/table-pagination";

interface EntregasEnviadasTableProps {
  entregas: ListaProgramacaoEntrega[];
  isLoading: boolean;
  onEntregaSelect: (entrega: ListaProgramacaoEntrega) => void;
  onRefresh?: () => void;
}

const EntregasEnviadasTable: React.FC<EntregasEnviadasTableProps> = ({
  entregas,
  isLoading,
  onEntregaSelect,
  onRefresh
}) => {
  const pagination = usePagination(entregas, { pageSize: 10 });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Carregando entregas...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (entregas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Entregas Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <Package className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
            <div className="space-y-2">
              <p className="text-lg font-medium text-muted-foreground">Nenhuma entrega encontrada</p>
              <p className="text-sm text-muted-foreground">
                Possíveis causas:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Não há entregas para a data selecionada</li>
                <li>• Filtros muito restritivos (equipe, data)</li>
                <li>• Todas as entregas já foram finalizadas</li>
                <li>• Problemas de conexão com o banco de dados</li>
              </ul>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Dica:</strong> Tente remover os filtros ou selecionar uma data diferente. 
                Se o problema persistir, verifique se há entregas cadastradas no sistema.
              </AlertDescription>
            </Alert>

            {onRefresh && (
              <Button 
                onClick={onRefresh} 
                variant="outline" 
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Tentar Novamente
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Enviada":
        return "default";
      case "Entregue":
        return "secondary";
      case "Pendente":
        return "outline";
      default:
        return "outline";
    }
  };

  const getActionButton = (entrega: ListaProgramacaoEntrega) => {
    const isEditable = entrega.status === "Enviada" || entrega.status === "Pendente";
    
    return (
      <Button 
        variant={isEditable ? "default" : "outline"} 
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onEntregaSelect(entrega);
        }}
        className="flex items-center gap-2"
      >
        {isEditable ? (
          <>
            <Edit className="h-4 w-4" />
            Registrar
          </>
        ) : (
          <>
            <Eye className="h-4 w-4" />
            Visualizar
          </>
        )}
      </Button>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Entregas Disponíveis ({entregas.length})
            </div>
            {onRefresh && (
              <Button 
                onClick={onRefresh} 
                variant="ghost" 
                size="sm"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Atualizar
              </Button>
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Clique em uma entrega para registrar aplicação (Enviada/Pendente) ou visualizar (Entregue)
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Logradouro</TableHead>
                  <TableHead>Caminhão</TableHead>
                  <TableHead>Equipe</TableHead>
                  <TableHead>Massa Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.paginatedData.map((entrega) => (
                  <TableRow 
                    key={entrega.id}
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => onEntregaSelect(entrega)}
                  >
                    <TableCell>
                      {formatBrazilianDateForDisplay(entrega.data_entrega)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {entrega.logradouro}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        <span className="font-mono">
                          {entrega.caminhao?.placa || "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{entrega.equipe?.nome_equipe || "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {formatMassaDisplay(entrega.quantidade_massa)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(entrega.status)}>
                        {entrega.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getActionButton(entrega)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {entregas.length > 0 && (
        <TablePagination pagination={pagination} />
      )}
    </div>
  );
};

export default EntregasEnviadasTable;
