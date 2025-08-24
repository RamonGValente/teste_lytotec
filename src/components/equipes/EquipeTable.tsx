
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, ArrowRight } from "lucide-react";
import { Equipe } from "@/types/equipe";

interface EquipeTableProps {
  equipes: Equipe[];
  isLoading: boolean;
  isError: boolean;
  onEdit: (equipe: Equipe) => void;
  onView: (equipe: Equipe) => void;
  onDelete: (equipe: Equipe) => void;
  onTransfer?: (equipe: Equipe) => void;
}

const EquipeTable: React.FC<EquipeTableProps> = ({
  equipes,
  isLoading,
  isError,
  onEdit,
  onView,
  onDelete,
  onTransfer
}) => {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome da Equipe</TableHead>
              <TableHead>Encarregado</TableHead>
              <TableHead>Apontador</TableHead>
              <TableHead>Membros</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">Erro ao carregar as equipes. Tente novamente.</p>
      </div>
    );
  }

  if (equipes.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">Nenhuma equipe encontrada.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome da Equipe</TableHead>
            <TableHead>Encarregado</TableHead>
            <TableHead>Apontador</TableHead>
            <TableHead>Membros</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {equipes.map((equipe) => (
            <TableRow key={equipe.id}>
              <TableCell className="font-medium">
                {equipe.nome_equipe}
              </TableCell>
              <TableCell>
                {equipe.encarregado?.nome_completo || "Não informado"}
              </TableCell>
              <TableCell>
                {equipe.apontador?.nome_completo || "Não informado"}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {equipe.equipe?.length || 0} membro(s)
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onView(equipe)}
                    title="Visualizar"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(equipe)}
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {onTransfer && (equipe.equipe?.length || 0) > 2 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onTransfer(equipe)}
                      title="Transferir Membros"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(equipe)}
                    title="Excluir"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
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

export default EquipeTable;
