
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calculator, MapPin, Thermometer, Settings } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface NovoRegistroDadosTecnicosTabProps {
  form: UseFormReturn<any>;
  onNext: () => void;
  onPrevious: () => void;
  calculatedArea: number | null;
  calculatedEspessura: number | null;
}

const NovoRegistroDadosTecnicosTab: React.FC<NovoRegistroDadosTecnicosTabProps> = ({
  form,
  onNext,
  onPrevious,
  calculatedArea,
  calculatedEspessura
}) => {
  const { register, formState: { errors }, setValue, watch } = form;

  const comprimento = watch("comprimento");
  const largura = watch("largura_media");
  const toneladaAplicada = watch("tonelada_aplicada");

  const handleNext = () => {
    // Validar campos obrigatórios
    const requiredFields = ["logradouro_nome", "comprimento", "largura_media", "tonelada_aplicada"];
    const hasErrors = requiredFields.some(field => {
      const value = watch(field);
      return !value || (typeof value === 'number' && value <= 0);
    });

    if (hasErrors) {
      return; // Deixar a validação do form handle os erros
    }

    onNext();
  };

  return (
    <div className="space-y-6">
      {/* Dados do Logradouro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Dados do Logradouro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="logradouro_nome">Nome do Logradouro *</Label>
            <Input
              id="logradouro_nome"
              {...register("logradouro_nome")}
              placeholder="Ex: Rua das Flores"
            />
            {errors.logradouro_nome && (
              <span className="text-sm text-red-500">{String(errors.logradouro_nome.message)}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estaca_inicial">Estaca Inicial</Label>
              <Input
                id="estaca_inicial"
                type="number"
                step="0.01"
                {...register("estaca_inicial", { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estaca_final">Estaca Final</Label>
              <Input
                id="estaca_final"
                type="number"
                step="0.01"
                {...register("estaca_final", { valueAsNumber: true })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bordo">Bordo</Label>
            <Select onValueChange={(value) => setValue("bordo", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o bordo" />
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
        </CardContent>
      </Card>

      {/* Dimensões e Cálculos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Dimensões e Cálculos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="comprimento">Comprimento (m) *</Label>
              <Input
                id="comprimento"
                type="number"
                step="0.01"
                {...register("comprimento", { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.comprimento && (
                <span className="text-sm text-red-500">{String(errors.comprimento.message)}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="largura_media">Largura Média (m) *</Label>
              <Input
                id="largura_media"
                type="number"
                step="0.01"
                {...register("largura_media", { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.largura_media && (
                <span className="text-sm text-red-500">{String(errors.largura_media.message)}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="area_aplicada">Área Calculada (m²)</Label>
              <Input
                id="area_aplicada"
                type="number"
                step="0.01"
                {...register("area_aplicada", { valueAsNumber: true })}
                value={calculatedArea?.toFixed(2) || "0.00"}
                readOnly
                className="bg-gray-50"
              />
              <span className="text-xs text-gray-500">
                Calculado automaticamente: {comprimento || 0} × {largura || 0}
              </span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tonelada_aplicada">Tonelada Aplicada *</Label>
              <Input
                id="tonelada_aplicada"
                type="number"
                step="0.01"
                {...register("tonelada_aplicada", { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.tonelada_aplicada && (
                <span className="text-sm text-red-500">{String(errors.tonelada_aplicada.message)}</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="espessura_aplicada">Espessura Calculada (m)</Label>
            <Input
              id="espessura_aplicada"
              type="number"
              step="0.001"
              {...register("espessura_aplicada", { valueAsNumber: true })}
              value={calculatedEspessura?.toFixed(3) || "0.000"}
              readOnly
              className="bg-gray-50"
            />
            <span className="text-xs text-gray-500">
              Calculado automaticamente: ({toneladaAplicada || 0} ÷ {calculatedArea?.toFixed(2) || 0}) ÷ 2.4
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Condições e Controle de Qualidade */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Condições e Controle de Qualidade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="temperatura_aplicacao">
                <Thermometer className="h-4 w-4 inline mr-1" />
                Temperatura de Aplicação (°C)
              </Label>
              <Input
                id="temperatura_aplicacao"
                type="number"
                {...register("temperatura_aplicacao", { valueAsNumber: true })}
                placeholder="Ex: 150"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="densidade_compactacao">Densidade de Compactação</Label>
              <Input
                id="densidade_compactacao"
                type="number"
                step="0.01"
                {...register("densidade_compactacao", { valueAsNumber: true })}
                placeholder="Ex: 2.4"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero_passadas">Número de Passadas</Label>
              <Input
                id="numero_passadas"
                type="number"
                {...register("numero_passadas", { valueAsNumber: true })}
                placeholder="Ex: 3"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipamento_compactacao">Equipamento de Compactação</Label>
              <Input
                id="equipamento_compactacao"
                {...register("equipamento_compactacao")}
                placeholder="Ex: Rolo compactador"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navegação */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Anterior
        </Button>
        <Button onClick={handleNext} className="bg-blue-500 hover:bg-blue-600">
          Próximo: Finalização
        </Button>
      </div>
    </div>
  );
};

export default NovoRegistroDadosTecnicosTab;
