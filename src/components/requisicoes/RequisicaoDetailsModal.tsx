
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RequisicaoWithRuas } from "@/types/requisicao";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatMassaDisplay, kgToToneladas } from "@/utils/massaConversionUtils";
import { formatBrazilianDateForDisplay } from "@/utils/timezoneUtils";

interface RequisicaoDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requisicao: RequisicaoWithRuas | null;
}

const RequisicaoDetailsModal: React.FC<RequisicaoDetailsModalProps> = ({
  isOpen,
  onClose,
  requisicao
}) => {
  if (!requisicao) return null;

  // Calculate total area and volume
  const totalArea = requisicao.ruas?.reduce((sum, rua) => sum + (rua.area || 0), 0) || 0;
  const totalVolume = requisicao.ruas?.reduce((sum, rua) => sum + (rua.volume || 0), 0) || 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Detalhes da Requisição #{requisicao.numero}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-grow pr-4">
          <div className="space-y-6">
            {/* Informações do cabeçalho */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Centro de Custo</h3>
                <p className="text-base">{requisicao.centro_custo?.nome_centro_custo || "-"}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Data da Requisição</h3>
                <p className="text-base">
                  {formatBrazilianDateForDisplay(requisicao.data_requisicao)}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Diretoria</h3>
                <p className="text-base">{requisicao.diretoria || "-"}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Gerência</h3>
                <p className="text-base">{requisicao.gerencia || "-"}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Engenheiro Responsável</h3>
                <p className="text-base">{requisicao.engenheiro?.nome_completo || "-"}</p>
              </div>
            </div>
            
            <div className="pt-2">
              <h3 className="text-lg font-medium mb-2">Lista de Ruas</h3>
              
              {requisicao.ruas && requisicao.ruas.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Logradouro</TableHead>
                        <TableHead>Bairro</TableHead>
                        <TableHead>Dimensões</TableHead>
                        <TableHead>Pintura</TableHead>
                        <TableHead>Traço</TableHead>
                        <TableHead>Área (m²)</TableHead>
                        <TableHead>Volume (t)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requisicao.ruas.map((rua, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{rua.logradouro}</TableCell>
                          <TableCell>{rua.bairro || "-"}</TableCell>
                          <TableCell>
                            {rua.largura}m × {rua.comprimento}m × {rua.espessura}m
                          </TableCell>
                          <TableCell>{rua.pintura_ligacao}</TableCell>
                          <TableCell>{rua.traco}</TableCell>
                          <TableCell>{(rua.area || 0).toFixed(2)}</TableCell>
                          <TableCell>{formatMassaDisplay(kgToToneladas(rua.volume || 0))}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  <div className="mt-4 flex justify-end">
                    <div className="bg-muted p-4 rounded-md w-fit">
                      <div className="grid grid-cols-2 gap-x-8">
                        <div className="text-right">
                          <span className="text-muted-foreground">Área Total:</span>
                        </div>
                        <div>
                          <span className="font-medium">{totalArea.toFixed(2)} m²</span>
                        </div>
                        
                        <div className="text-right">
                          <span className="text-muted-foreground">Volume Total:</span>
                        </div>
                        <div>
                          <span className="font-medium">{formatMassaDisplay(kgToToneladas(totalVolume))}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-4 border rounded-md">
                  <p className="text-muted-foreground">
                    Nenhuma rua cadastrada para esta requisição.
                  </p>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
        
        <DialogFooter className="mt-6">
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RequisicaoDetailsModal;
