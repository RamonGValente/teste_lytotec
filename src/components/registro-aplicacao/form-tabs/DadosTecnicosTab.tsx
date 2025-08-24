
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BordoType } from "@/types/registroAplicacao";
import { RegistroAplicacaoSchema } from "@/validations/registroAplicacaoSchema";
import { RegistroCarga } from "@/types/registroCargas";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DadosTecnicosTabProps {
  form: UseFormReturn<RegistroAplicacaoSchema>;
  onNext: () => void;
  onPrevious: () => void;
  calculatedArea: number | string | null;
  calculatedEspessura: number | string | null;
  calculatedToneladaAplicada: number | string | null;
  espessuraStatusClass: string;
  registroCarga?: RegistroCarga | null;
  exceededAvailableMass?: boolean;
  // Novos props para múltiplas aplicações
  aplicacaoSequencia?: number;
  massaRemanescenteCarga?: number;
  cargaFinalizada?: boolean;
}

const DadosTecnicosTab: React.FC<DadosTecnicosTabProps> = ({
  form,
  onNext,
  onPrevious,
  calculatedArea,
  calculatedEspessura,
  calculatedToneladaAplicada,
  espessuraStatusClass,
  registroCarga,
  exceededAvailableMass,
  aplicacaoSequencia = 1,
  massaRemanescenteCarga,
  cargaFinalizada = false
}) => {
  // Helper function to safely format number values with proper decimal places
  const formatValue = (value: number | string | null): string => {
    if (value === null) return "";
    
    if (typeof value === 'number') {
      // Limitar a 2 casas decimais para evitar números excessivamente longos
      return Number(value.toFixed(2)).toString();
    }
    
    // Try to convert string to number and format it
    const numValue = parseFloat(String(value));
    return isNaN(numValue) ? String(value) : Number(numValue.toFixed(2)).toString();
  };

  // Format values in the format "X.X t" for toneladas display
  const formatToneladas = (value: number | string | null): string => {
    if (value === null) return "";
    
    const numValue = typeof value === 'number' ? value : parseFloat(String(value));
    if (isNaN(numValue)) return String(value);
    
    // Format with 1 decimal place for toneladas, removing excessive decimals
    return Number(numValue.toFixed(1)).toString();
  };

  // Campo removido - usar_massa_total_para_espessura não existe mais na tabela
  // Removendo toda a lógica do checkbox que não é mais necessária

  return (
    <div className="space-y-4">
      {/* Indicador de aplicação múltipla */}
      {aplicacaoSequencia > 1 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="default">Aplicação {aplicacaoSequencia}</Badge>
              <span className="text-sm text-blue-700">
                Aplicação sequencial da mesma carga
              </span>
            </div>
            {massaRemanescenteCarga !== undefined && (
              <div className="text-sm text-blue-700">
                <span className="font-medium">Massa remanescente: </span>
                {formatToneladas(massaRemanescenteCarga)} t
              </div>
            )}
          </div>
        </div>
      )}

      {/* Aviso se carga finalizada */}
      {cargaFinalizada && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Carga Finalizada
            </Badge>
            <span className="text-sm text-green-700">
              Esta carga foi finalizada e a média de espessura foi calculada
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hora_aplicacao">Hora da Aplicação</Label>
          <Input
            id="hora_aplicacao"
            type="time"
            {...form.register("hora_aplicacao")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="temperatura_aplicacao">Temperatura da Aplicação (°C)</Label>
          <Input
            id="temperatura_aplicacao"
            type="number"
            {...form.register("temperatura_aplicacao", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bordo">Bordo</Label>
          <Select
            onValueChange={(value) => form.setValue("bordo", value as BordoType)}
            value={form.watch("bordo")}
          >
            <SelectTrigger id="bordo">
              <SelectValue placeholder="Selecione um bordo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Direito">Direito</SelectItem>
              <SelectItem value="Esquerdo">Esquerdo</SelectItem>
              <SelectItem value="Centro">Centro</SelectItem>
              <SelectItem value="Único">Único</SelectItem>
              <SelectItem value="Embocadura">Embocadura</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="estaca_inicial">Estaca Inicial</Label>
          <Input
            id="estaca_inicial"
            type="number"
            {...form.register("estaca_inicial", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="comprimento">Comprimento (m)</Label>
          <NumberInput
            id="comprimento"
            value={form.watch("comprimento") || 0}
            onChange={(value) => form.setValue("comprimento", value)}
            decimalPlaces={2}
            placeholder="Ex: 100"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="largura_media">Largura Média (m)</Label>
          <NumberInput
            id="largura_media"
            value={form.watch("largura_media") || 0}
            onChange={(value) => form.setValue("largura_media", value)}
            decimalPlaces={2}
            placeholder="Ex: 3"
          />
        </div>
        <div className="space-y-2">
          <Label>Área Calculada (m²)</Label>
          <Input
            type="text"
            value={formatValue(calculatedArea)}
            disabled
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="tonelada_aplicada" className="mr-2">Tonelada Aplicada (t)</Label>
            {exceededAvailableMass && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="h-4 w-4 text-amber-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      O valor calculado excedeu a quantidade disponível e foi ajustado ao máximo permitido
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <Input
            id="tonelada_aplicada"
            type="text"
            value={formatToneladas(calculatedToneladaAplicada)}
            className={exceededAvailableMass ? "border-amber-500 bg-amber-50" : ""}
            disabled
          />
        </div>
      </div>

      {/* Seção de cálculo de espessura */}
      <div className="border-t pt-4">
        <div className="space-y-4">
          {/* Campo único de espessura */}
          <div className="space-y-2">
            <Label>Espessura (cm)</Label>
            <Input
              type="text"
              value={formatValue(calculatedEspessura)}
              className={espessuraStatusClass}
              disabled
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onPrevious}>
          Anterior
        </Button>
        <Button type="button" onClick={onNext}>
          Próximo
        </Button>
      </div>
    </div>
  );
};

export default DadosTecnicosTab;
