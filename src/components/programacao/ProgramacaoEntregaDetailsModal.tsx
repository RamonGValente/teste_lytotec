
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProgramacaoEntregaWithItems } from "@/types/programacaoEntrega";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Calendar, Building, Table, Package } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatBrazilianDateForDisplay } from "@/utils/timezoneUtils";
import { formatMassaDisplay } from "@/utils/massaConversionUtils";
import ProgressBar from "./ProgressBar";

interface ProgramacaoEntregaDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  programacao: ProgramacaoEntregaWithItems | null;
}

const ProgramacaoEntregaDetailsModal: React.FC<ProgramacaoEntregaDetailsModalProps> = ({
  isOpen,
  onClose,
  programacao,
}) => {
  if (!programacao) return null;

  const renderStatusBadge = (status: string | undefined) => {
    if (status === 'Cancelada') {
      return <Badge variant="destructive">Cancelada</Badge>;
    }
    return <Badge variant="default">Ativa</Badge>;
  };

  // Calcular totais
  const totalEntregas = programacao.itens?.length || 0;
  const entregasAtivas = programacao.itens?.filter(item => !item.cancelled)?.length || 0;
  const entregasCanceladas = programacao.itens?.filter(item => item.cancelled)?.length || 0;
  
  // Calcular quantidade total em toneladas
  const quantidadeTotal = programacao.itens?.reduce((sum, item) => {
    if (item.cancelled) return sum;
    const quantidade = typeof item.quantidade_massa === 'number' ? item.quantidade_massa : 0;
    return sum + quantidade;
  }, 0) || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Detalhes da Programação de Entrega</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Cards de informações básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center">
                  <Building className="mr-2 h-4 w-4" />
                  Requisição
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Número:</dt>
                    <dd className="font-medium">{programacao.requisicao?.numero || "N/A"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Centro de Custo:</dt>
                    <dd className="font-medium">{programacao.centro_custo?.nome_centro_custo || "N/A"}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  Detalhes da Entrega
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Data de Entrega:</dt>
                    <dd className="font-medium">{formatBrazilianDateForDisplay(programacao.data_entrega)}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>

          {/* Progresso da Massa */}
          {programacao.requisicao_id && (
            <ProgressBar 
              requisicaoId={programacao.requisicao_id}
              showDetailed={true}
              className="w-full"
            />
          )}

          {/* Card de resumo das entregas */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center text-blue-800">
                <Package className="mr-2 h-4 w-4" />
                Resumo das Entregas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700">{totalEntregas}</div>
                  <div className="text-sm text-blue-600">Total de Entregas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">{entregasAtivas}</div>
                  <div className="text-sm text-green-600">Entregas Ativas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-700">{entregasCanceladas}</div>
                  <div className="text-sm text-red-600">Entregas Canceladas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700">{quantidadeTotal.toFixed(1)}</div>
                  <div className="text-sm text-blue-600">Total Programado (t)</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Lista de entregas com scroll */}
          <div>
            <h3 className="font-medium text-base flex items-center mb-4">
              <Table className="mr-2 h-4 w-4" />
              Lista de Entregas ({totalEntregas})
            </h3>

            <div className="border rounded-lg overflow-hidden">
              <ScrollArea className="h-[400px]">
                <UITable>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="w-[200px]">Logradouro</TableHead>
                      <TableHead className="w-[120px]">Quantidade (t)</TableHead>
                      <TableHead className="w-[140px]">Tipo de Lançamento</TableHead>
                      <TableHead className="w-[140px]">Caminhão</TableHead>
                      <TableHead className="w-[140px]">Equipe</TableHead>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead className="w-[140px]">Usina</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {programacao.itens && programacao.itens.length > 0 ? (
                      programacao.itens.map((item) => (
                        <TableRow key={item.id} className={item.cancelled ? "bg-red-50" : ""}>
                          <TableCell className="font-medium">
                            <div className="max-w-[180px] truncate" title={item.logradouro}>
                              {item.logradouro}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="font-mono">
                              {formatMassaDisplay(typeof item.quantidade_massa === 'number' ? item.quantidade_massa : 0)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {item.tipo_lancamento === 'Acabadora' ? 'Acabadora' : item.tipo_lancamento || 'Manual'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[120px] truncate" title={item.caminhao ? `${item.caminhao.placa} - ${item.caminhao.modelo}` : "N/A"}>
                              {item.caminhao ? `${item.caminhao.placa} - ${item.caminhao.modelo}` : "N/A"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[120px] truncate" title={item.equipe?.nome_equipe || "N/A"}>
                              {item.equipe?.nome_equipe || "N/A"}
                            </div>
                          </TableCell>
                          <TableCell>{renderStatusBadge(item.status)}</TableCell>
                          <TableCell>
                            <div className="max-w-[120px] truncate" title={item.usina?.nome_usina || "N/A"}>
                              {item.usina?.nome_usina || "N/A"}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Nenhum item de entrega cadastrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </UITable>
              </ScrollArea>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProgramacaoEntregaDetailsModal;
