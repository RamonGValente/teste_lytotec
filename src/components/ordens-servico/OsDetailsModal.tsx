import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { X, FileDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OrdemServico, Material, MaoDeObra, Movimentacao } from "@/types/ordemServico";
interface OsDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  os: OrdemServico | null;
  materials: Material[];
  laborItems: MaoDeObra[];
  movements: Movimentacao[];
  isLoading: boolean;
  onGeneratePdf?: (osId: string) => void;
}
const OsDetailsModal: React.FC<OsDetailsModalProps> = ({
  isOpen,
  onClose,
  os,
  materials,
  laborItems,
  movements,
  isLoading,
  onGeneratePdf
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Aberta':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">{status}</Badge>;
      case 'Em Andamento':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">{status}</Badge>;
      case 'Concluída':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">{status}</Badge>;
      case 'Cancelada':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">{status}</Badge>;
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
  const totalMaterials = materials.reduce((sum, item) => sum + (item.valor_total || 0), 0);
  const totalLaborItems = laborItems.reduce((sum, item) => sum + (item.valor_total || 0), 0);
  const totalGeral = totalMaterials + totalLaborItems;
  const handleGeneratePdf = () => {
    if (os && onGeneratePdf) {
      onGeneratePdf(os.id);
    }
  };
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>
            {os ? `Ordem de Serviço ${os.numero_chamado}` : "Detalhes da OS"}
          </DialogTitle>
          
        </DialogHeader>

        <Tabs defaultValue="geral" className="flex-grow overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="materiais">Materiais</TabsTrigger>
            <TabsTrigger value="mao-de-obra">Mão de Obra</TabsTrigger>
            <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="flex-grow mt-4 pr-4">
            {isLoading || !os ? <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-24 w-full" />
              </div> : <>
                <TabsContent value="geral" className="mt-0">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-gray-500">Número da OS</h3>
                        <p className="text-lg font-semibold">{os.numero_chamado}</p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-gray-500">Status</h3>
                        <div>{getStatusBadge(os.status)}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-gray-500">Data de Abertura</h3>
                        <p>{format(new Date(os.data_solicitacao), "dd/MM/yyyy", {
                        locale: ptBR
                      })}</p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-gray-500">Hora de Abertura</h3>
                        <p>{os.hora_solicitacao || "-"}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-gray-500">Solicitante</h3>
                        <p>{os.solicitante?.nome_completo || os.solicitante?.email || "-"}</p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-gray-500">Prioridade</h3>
                        <div>{getPriorityBadge(os.prioridade)}</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-gray-500">Centro de Custo</h3>
                        <p>{os.centro_custo?.codigo_centro_custo || ''} - {os.centro_custo?.nome_centro_custo || '-'}</p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-gray-500">Caminhão/Equipamento</h3>
                        <p>
                          {os.caminhao_equipamento ? `${os.caminhao_equipamento.placa || ''} ${os.caminhao_equipamento.marca || ''} ${os.caminhao_equipamento.modelo || ''}`.trim() : "-"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-gray-500">Tipo de Falha</h3>
                        <p>{os.tipo_falha || "-"}</p>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium text-gray-500">Horímetro/KM</h3>
                        <p>{os.horimetro_km || "-"}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-gray-500">Descrição do Problema</h3>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm whitespace-pre-wrap">
                          {os.descricao_problema || "Sem descrição."}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-gray-500">Tratativa Executada</h3>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm whitespace-pre-wrap">
                          {os.tratativa || "Sem tratativa registrada."}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="text-sm font-medium text-gray-500">Anotações Internas</h3>
                      <div className="mt-1 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm whitespace-pre-wrap">
                          {os.anotacoes_internas || "Sem anotações."}
                        </p>
                      </div>
                    </div>
                    
                    {os.fotos_avarias && os.fotos_avarias.length > 0 && <div className="space-y-1">
                        <h3 className="text-sm font-medium text-gray-500">Fotos das Avarias</h3>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {os.fotos_avarias.map((foto: string, index: number) => <a key={index} href={foto} target="_blank" rel="noopener noreferrer" className="block">
                              <img src={foto} alt={`Avaria ${index + 1}`} className="w-full h-24 object-cover rounded-md border" />
                            </a>)}
                        </div>
                      </div>}
                    
                    <Separator />
                    
                    <div className="space-y-1">
                      <h3 className="text-md font-medium">Balanceamento do Atendimento</h3>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium text-gray-500">Data de Início</h4>
                          <p>{os.data_inicio_atendimento ? format(new Date(os.data_inicio_atendimento), "dd/MM/yyyy", {
                          locale: ptBR
                        }) : "-"}</p>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium text-gray-500">Hora de Início</h4>
                          <p>{os.hora_inicio_atendimento || "-"}</p>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium text-gray-500">Data de Encerramento</h4>
                          <p>{os.data_fim_atendimento ? format(new Date(os.data_fim_atendimento), "dd/MM/yyyy", {
                          locale: ptBR
                        }) : "-"}</p>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium text-gray-500">Hora de Encerramento</h4>
                          <p>{os.hora_fim_atendimento || "-"}</p>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium text-gray-500">Executado por</h4>
                          <p>{os.executado_por?.nome_completo || os.executado_por?.email || "-"}</p>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium text-gray-500">Encerrado por</h4>
                          <p>{os.encerrado_por?.nome_completo || os.encerrado_por?.email || "-"}</p>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium text-gray-500">Horímetro/KM Inicial</h4>
                          <p>{os.horimetro_km_inicial || "-"}</p>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium text-gray-500">Horímetro/KM Final</h4>
                          <p>{os.horimetro_km_final || "-"}</p>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium text-gray-500">Duração do Serviço</h4>
                          <p>{os.duracao_servico || "-"}</p>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium text-gray-500">Setor</h4>
                          <p>{os.setor || "-"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="materiais" className="mt-0">
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Quantidade</TableHead>
                          <TableHead>Material</TableHead>
                          <TableHead>Valor Unitário</TableHead>
                          <TableHead>Valor Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {materials.length === 0 ? <TableRow>
                            <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                              Nenhum material registrado
                            </TableCell>
                          </TableRow> : materials.map(material => <TableRow key={material.id}>
                              <TableCell>{material.quantidade}</TableCell>
                              <TableCell>{material.descricao_material}</TableCell>
                              <TableCell>R$ {material.valor_unitario?.toFixed(2)}</TableCell>
                              <TableCell>R$ {material.valor_total?.toFixed(2)}</TableCell>
                            </TableRow>)}
                        
                        {materials.length > 0 && <TableRow className="font-medium">
                            <TableCell colSpan={3} className="text-right">Total Materiais:</TableCell>
                            <TableCell>R$ {totalMaterials.toFixed(2)}</TableCell>
                          </TableRow>}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                
                <TabsContent value="mao-de-obra" className="mt-0">
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Quantidade</TableHead>
                          <TableHead>Função</TableHead>
                          <TableHead>Valor Unitário</TableHead>
                          <TableHead>Valor Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {laborItems.length === 0 ? <TableRow>
                            <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                              Nenhuma mão de obra registrada
                            </TableCell>
                          </TableRow> : laborItems.map(labor => <TableRow key={labor.id}>
                              <TableCell>{labor.quantidade}</TableCell>
                              <TableCell>{labor.funcao}</TableCell>
                              <TableCell>R$ {labor.valor_unitario?.toFixed(2)}</TableCell>
                              <TableCell>R$ {labor.valor_total?.toFixed(2)}</TableCell>
                            </TableRow>)}
                        
                        {laborItems.length > 0 && <TableRow className="font-medium">
                            <TableCell colSpan={3} className="text-right">Total Mão de Obra:</TableCell>
                            <TableCell>R$ {totalLaborItems.toFixed(2)}</TableCell>
                          </TableRow>}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {(materials.length > 0 || laborItems.length > 0) && <div className="mt-4 p-4 border rounded-md bg-gray-50">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total Geral da OS:</span>
                        <span>R$ {totalGeral.toFixed(2)}</span>
                      </div>
                    </div>}
                </TabsContent>
                
                <TabsContent value="movimentacoes" className="mt-0">
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Hora</TableHead>
                          <TableHead>Usuário</TableHead>
                          <TableHead>Motivo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {movements.length === 0 ? <TableRow>
                            <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                              Nenhuma movimentação registrada
                            </TableCell>
                          </TableRow> : movements.map(movement => <TableRow key={movement.id}>
                              <TableCell>
                                {movement.data_movimentacao ? format(new Date(movement.data_movimentacao), "dd/MM/yyyy", {
                          locale: ptBR
                        }) : "-"}
                              </TableCell>
                              <TableCell>{movement.hora_movimentacao || "-"}</TableCell>
                              <TableCell>{movement.usuario?.nome_completo || movement.usuario?.email || "-"}</TableCell>
                              <TableCell>{movement.motivo}</TableCell>
                            </TableRow>)}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </>}
          </ScrollArea>
        </Tabs>
        
        <Separator className="my-4" />
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          
          {os && onGeneratePdf && <Button variant="outline" onClick={handleGeneratePdf} className="border-blue-200 text-blue-700 hover:bg-blue-50">
              <FileDown className="mr-2 h-4 w-4" />
              Gerar PDF
            </Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>;
};
export default OsDetailsModal;