
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, Upload } from "lucide-react";
import { Funcionario } from "@/types/funcionario";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { usePagination } from "@/hooks/usePagination";
import TablePagination from "@/components/ui/table-pagination";

interface FuncionarioTableProps {
  funcionarios: Funcionario[];
  isLoading: boolean;
  isError: boolean;
  onEdit: (funcionario: Funcionario) => void;
  onViewDetails: (funcionario: Funcionario) => void;
  onDelete: (funcionario: Funcionario) => void;
  onRefetch: () => void;
  openImageModal?: (funcionario: Funcionario) => void;
}

const FuncionarioTable: React.FC<FuncionarioTableProps> = ({
  funcionarios,
  isLoading,
  isError,
  onEdit,
  onViewDetails,
  onDelete,
  onRefetch,
  openImageModal
}) => {
  const pagination = usePagination(funcionarios, { pageSize: 10 });

  if (isLoading) {
    return <div className="text-center p-4">Carregando funcionários...</div>;
  }

  if (isError) {
    return <div className="text-center p-4 text-red-500">Erro ao carregar funcionários.</div>;
  }

  if (funcionarios.length === 0) {
    return <div className="text-center p-4">Nenhum funcionário encontrado.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Foto</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Departamento</TableHead>
              <TableHead>Data Admissão</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pagination.paginatedData.map((funcionario) => (
              <TableRow key={funcionario.id}>
                <TableCell>
                  <Avatar className="h-10 w-10 cursor-pointer" onClick={() => openImageModal && openImageModal(funcionario)}>
                    <AvatarImage 
                      src={funcionario.imagem || `https://ui-avatars.com/api/?name=${encodeURIComponent(funcionario.nome_completo)}&background=random`} 
                      alt={funcionario.nome_completo} 
                    />
                    <AvatarFallback>
                      {funcionario.nome_completo.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>{funcionario.nome_completo}</TableCell>
                <TableCell>{funcionario.cpf}</TableCell>
                <TableCell>{funcionario.bd_funcoes?.nome_funcao || '-'}</TableCell>
                <TableCell>{funcionario.bd_departamentos?.nome_departamento || '-'}</TableCell>
                <TableCell>{formatDate(funcionario.data_admissao)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onViewDetails(funcionario)}
                      title="Visualizar"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEdit(funcionario)}
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openImageModal && openImageModal(funcionario)}
                      title="Alterar imagem"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onDelete(funcionario)}
                      title="Excluir"
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
      
      {funcionarios.length > 0 && (
        <TablePagination pagination={pagination} />
      )}
    </div>
  );
};

export default FuncionarioTable;
