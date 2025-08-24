import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Funcionario } from "@/types/funcionario";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";

interface FuncionarioDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  funcionario: Funcionario | null;
}

const FuncionarioDetailsModal: React.FC<FuncionarioDetailsModalProps> = ({
  isOpen,
  onClose,
  funcionario,
}) => {
  if (!funcionario) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-3xl">
        <DialogHeader>
          <DialogTitle>Detalhes do Funcionário</DialogTitle>
          <DialogDescription>
            Informações completas do funcionário
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center mb-6">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarImage src={funcionario.imagem} alt={funcionario.nome_completo} />
            <AvatarFallback className="text-xl">
              {funcionario.nome_completo
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-bold">{funcionario.nome_completo}</h2>
          <p className="text-muted-foreground">{funcionario.bd_funcoes?.nome_funcao || "-"}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dados Pessoais</h3>
            <Separator />

            <div>
              <p className="text-sm text-muted-foreground">CPF</p>
              <p>{funcionario.cpf}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">E-mail</p>
              <p>{funcionario.email || "-"}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Data de Nascimento</p>
              <p>{formatDate(funcionario.data_nascimento)}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Gênero</p>
              <p>{funcionario.genero || "-"}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Escolaridade</p>
              <p>{funcionario.escolaridade || "-"}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Endereço</p>
              <p>{funcionario.endereco_completo || "-"}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Equipe</p>
              <p>{funcionario.bd_equipes?.nome_equipe || "-"}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dados Profissionais</h3>
            <Separator />

            <div>
              <p className="text-sm text-muted-foreground">Empresa</p>
              <p>{funcionario.bd_empresas?.nome_empresa || "-"}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Departamento</p>
              <p>{funcionario.bd_departamentos?.nome_departamento || "-"}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Centro de Custo</p>
              <p>{funcionario.bd_centros_custo?.nome_centro_custo || "-"}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p>{funcionario.status || "-"}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Data de Admissão</p>
              <p>{formatDate(funcionario.data_admissao)}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Data de Férias</p>
              <p>{formatDate(funcionario.data_ferias)}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Data de Demissão</p>
              <p>{formatDate(funcionario.data_demissao)}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold">Dados Financeiros</h3>
          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Salário Base</p>
              <p>{formatCurrency(funcionario.salario_base)}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FuncionarioDetailsModal;
