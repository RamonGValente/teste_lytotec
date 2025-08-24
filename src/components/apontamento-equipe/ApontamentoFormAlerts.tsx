
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Star } from "lucide-react";

interface ApontamentoFormAlertsProps {
  apontamentoExistente: boolean;
  isEditing: boolean;
  avaliacoesPendentes: Set<string>;
}

const ApontamentoFormAlerts: React.FC<ApontamentoFormAlertsProps> = ({
  apontamentoExistente,
  isEditing,
  avaliacoesPendentes
}) => {
  return (
    <>
      {apontamentoExistente && !isEditing && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Apontamento já existente</AlertTitle>
          <AlertDescription>
            Já existe um apontamento registrado para esta equipe nesta data.
          </AlertDescription>
        </Alert>
      )}
      
      {avaliacoesPendentes.size > 0 && !isEditing && (
        <Alert className="bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800">
          <Star className="h-4 w-4" />
          <AlertTitle>Avaliações obrigatórias</AlertTitle>
          <AlertDescription>
            É necessário avaliar todos os colaboradores presentes antes de salvar o apontamento.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default ApontamentoFormAlerts;
