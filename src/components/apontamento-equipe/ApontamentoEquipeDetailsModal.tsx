import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { ApontamentoEquipe } from "@/types/apontamentoEquipe";
interface ApontamentoEquipeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apontamento: ApontamentoEquipe | null;
  apontamentosList: ApontamentoEquipe[];
}
const ApontamentoEquipeDetailsModal: React.FC<ApontamentoEquipeDetailsModalProps> = ({
  isOpen,
  onClose,
  apontamento,
  apontamentosList
}) => {
  if (!apontamento) return null;
  const equipe = apontamento.equipe;

  // Fix for date display - always creating a new Date object with the date string
  // to ensure proper formatting
  const formattedDate = (() => {
    try {
      // If data_registro is a string in 'YYYY-MM-DD' format
      const dateObj = new Date(apontamento.data_registro);
      // Check if date is valid
      if (!isNaN(dateObj.getTime())) {
        return format(dateObj, "dd 'de' MMMM 'de' yyyy", {
          locale: ptBR
        });
      } else {
        console.error("Invalid date format:", apontamento.data_registro);
        return "Data inválida";
      }
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Erro ao formatar data";
    }
  })();
  const totalPresentes = apontamentosList.filter(a => a.presente).length;
  const presencaPercentage = Math.round(totalPresentes / apontamentosList.length * 100);
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Apontamento</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Informações gerais */}
          <div className="grid grid-cols-2 gap-4">
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Equipe</h3>
              <p className="text-base">{equipe?.nome_equipe || "N/A"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Encarregado</h3>
              <p className="text-base">{equipe?.encarregado?.nome_completo || "N/A"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Apontador</h3>
              <p className="text-base">{equipe?.apontador?.nome_completo || "N/A"}</p>
            </div>
          </div>
          
          <Separator />
          
          {/* Estatísticas de presença */}
          <div className="grid grid-cols-3 gap-4 pt-1">
            <div className="flex flex-col items-center p-3 bg-muted/50 rounded-md">
              <span className="text-sm font-medium text-muted-foreground">Taxa de Presença</span>
              <Badge variant="outline" className={`mt-1 ${presencaPercentage === 100 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : presencaPercentage >= 75 ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" : presencaPercentage >= 50 ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"}`}>
                {presencaPercentage}%
              </Badge>
            </div>
            <div className="flex flex-col items-center p-3 bg-muted/50 rounded-md">
              <span className="text-sm font-medium text-muted-foreground">Colaboradores Presentes</span>
              <span className="text-xl font-bold text-green-600">{totalPresentes}</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-muted/50 rounded-md">
              <span className="text-sm font-medium text-muted-foreground">Colaboradores Ausentes</span>
              <span className="text-xl font-bold text-red-600">
                {apontamentosList.length - totalPresentes}
              </span>
            </div>
          </div>
          
          <Separator />
          
          {/* Tabela de colaboradores */}
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Hora Início</TableHead>
                  <TableHead>Hora Fim</TableHead>
                  <TableHead>Presença</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apontamentosList.map(item => <TableRow key={item.id}>
                    <TableCell>{item.nome_colaborador}</TableCell>
                    <TableCell>{item.hora_inicio || "N/A"}</TableCell>
                    <TableCell>{item.hora_fim || "N/A"}</TableCell>
                    <TableCell>
                      {item.presente ? <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          <Check className="mr-1 h-3 w-3" />
                          Presente
                        </Badge> : <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                          <X className="mr-1 h-3 w-3" />
                          Ausente
                        </Badge>}
                    </TableCell>
                  </TableRow>)}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
};
export default ApontamentoEquipeDetailsModal;