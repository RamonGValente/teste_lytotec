
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface RelatorioMedicaoObservacoesProps {
  observacoes: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

const RelatorioMedicaoObservacoes: React.FC<RelatorioMedicaoObservacoesProps> = ({
  observacoes,
  onChange,
  readOnly = true
}) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h3 className="text-lg font-bold mb-4">Observações:</h3>
        <Textarea
          value={observacoes}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          className="min-h-[120px] resize-none"
          placeholder="Digite suas observações aqui..."
        />
      </CardContent>
    </Card>
  );
};

export default RelatorioMedicaoObservacoes;
