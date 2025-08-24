
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RegistroAplicacaoSchema } from "@/validations/registroAplicacaoSchema";
import { RegistroCarga } from "@/types/registroCargas";

interface FinalizacaoTabProps {
  form: UseFormReturn<RegistroAplicacaoSchema>;
  onPrevious: () => void;
  onClose: () => void;
  isLoading: boolean;
  registroCarga?: RegistroCarga | null;
}

const FinalizacaoTab: React.FC<FinalizacaoTabProps> = ({
  form,
  onPrevious,
  onClose,
  isLoading,
  registroCarga
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hora_saida_caminhao">Hora de Saída</Label>
          <Input
            id="hora_saida_caminhao"
            type="time"
            {...form.register("hora_saida_caminhao")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="estaca_final">Estaca Final</Label>
          <Input
            id="estaca_final"
            type="number"
            {...form.register("estaca_final", { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="anotacoes_apontador">Anotações do Apontador</Label>
        <Textarea
          id="anotacoes_apontador"
          placeholder="Observações sobre a aplicação..."
          {...form.register("anotacoes_apontador")}
          rows={4}
        />
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onPrevious}>
          Anterior
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" className="bg-blue-500 hover:bg-blue-600" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Salvando...
              </>
            ) : (
              "Salvar Apontamento"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FinalizacaoTab;
