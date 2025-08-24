
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, Thermometer, Calendar, Truck, Users, Building, Eye, AlertTriangle } from "lucide-react";
import { ListaProgramacaoEntrega } from "@/types/programacaoEntrega";
import { RegistroCarga } from "@/types/registroCargas";
import { UseFormReturn } from "react-hook-form";
import { isDateAllowed, formatDateForDisplay } from "@/utils/dateValidation";
import { TooltipHelper } from "../TooltipHelper";
import { formatMassaFromDatabase } from "@/utils/massaConversionUtils";

interface NovoRegistroDadosIniciaisTabProps {
  form: UseFormReturn<any>;
  entrega: ListaProgramacaoEntrega;
  registroCarga: RegistroCarga | null;
  onNext: () => void;
  isReadOnly?: boolean;
}

const NovoRegistroDadosIniciaisTab: React.FC<NovoRegistroDadosIniciaisTabProps> = ({
  form,
  entrega,
  registroCarga,
  onNext,
  isReadOnly = false
}) => {
  const {
    register,
    formState: { errors },
    watch,
    setValue
  } = form;

  // Watch form values for validation
  const dataAplicacao = watch("data_aplicacao");
  const horaChegadaLocal = watch("hora_chegada_local");
  const temperaturaChegada = watch("temperatura_chegada");

  // Estado para validação de data
  const [dateValidation, setDateValidation] = useState<{
    isValid: boolean;
    message?: string;
  }>({ isValid: true });

  // Validar data em tempo real
  useEffect(() => {
    if (dataAplicacao) {
      const validation = isDateAllowed(dataAplicacao);
      setDateValidation(validation);
    }
  }, [dataAplicacao]);

  // Garantir que o logradouro seja definido corretamente para esta entrega
  useEffect(() => {
    if (entrega?.logradouro) {
      setValue("logradouro_nome", entrega.logradouro);
    }
  }, [entrega?.logradouro, setValue]);

  const isFormValid = dataAplicacao && horaChegadaLocal && dateValidation.isValid;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isReadOnly && <Eye className="h-5 w-5" />}
            <Calendar className="h-5 w-5" />
            {isReadOnly ? "Informações da Entrega (Visualização)" : "Informações da Entrega"}
          </CardTitle>
          {isReadOnly && (
            <p className="text-sm text-muted-foreground">
              Esta entrega está finalizada e os dados são somente para visualização.
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Caminhão:</span>
              </div>
              <Badge variant="outline" className="text-sm">
                {entrega.caminhao?.placa || "Não informado"}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Equipe:</span>
              </div>
              <Badge variant="outline" className="text-sm">
                {entrega.equipe?.nome_equipe || "Não informada"}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Usina:</span>
              </div>
              <Badge variant="outline" className="text-sm">
                {entrega.usina?.nome_usina || "Não informada"}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Logradouro:</span>
              </div>
              <Badge variant="outline" className="text-sm">
                {entrega.logradouro}
              </Badge>
            </div>
          </div>

          {registroCarga && (
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Informações da Carga
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white/70 p-3 rounded-md">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-blue-600 font-medium">Massa Programada</span>
                    <Badge variant="outline" className="text-xs">Planejado</Badge>
                  </div>
                  <div className="text-lg font-bold text-blue-800">{entrega.quantidade_massa}t</div>
                </div>
                <div className="bg-white/70 p-3 rounded-md">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-green-600 font-medium">Massa Real</span>
                    <Badge variant="outline" className="text-xs">Pesado</Badge>
                  </div>
                  <div className="text-lg font-bold text-green-800">
                    {registroCarga.tonelada_real 
                      ? `${formatMassaFromDatabase(registroCarga.tonelada_real, 'bd_registro_cargas', 'tonelada_real').toFixed(1)}t`
                      : "N/A"
                    }
                  </div>
                  {registroCarga.tonelada_real && entrega.quantidade_massa && (() => {
                    const massaRealConvertida = formatMassaFromDatabase(registroCarga.tonelada_real, 'bd_registro_cargas', 'tonelada_real');
                    return (
                      <div className={`text-xs mt-1 ${
                        massaRealConvertida > entrega.quantidade_massa 
                          ? 'text-orange-600' 
                          : massaRealConvertida < entrega.quantidade_massa 
                          ? 'text-yellow-600' 
                          : 'text-green-600'
                      }`}>
                        {massaRealConvertida > entrega.quantidade_massa ? '↑' : 
                         massaRealConvertida < entrega.quantidade_massa ? '↓' : '='}
                        {' '}
                        {Math.abs(massaRealConvertida - entrega.quantidade_massa).toFixed(1)}t vs programado
                      </div>
                    );
                  })()}
                </div>
                <div className="bg-white/70 p-3 rounded-md">
                  <span className="text-blue-600 font-medium">Data Saída</span>
                  <div className="font-medium text-gray-800">{registroCarga.data_saida}</div>
                </div>
                <div className="bg-white/70 p-3 rounded-md">
                  <div className="flex items-center gap-2 mb-1">
                    <Thermometer className="h-3 w-3 text-orange-500" />
                    <span className="text-orange-600 font-medium">Temp. Saída</span>
                  </div>
                  <div className="font-medium text-gray-800">
                    {registroCarga.temperatura_saida ? `${registroCarga.temperatura_saida}°C` : "Não informado"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {isReadOnly ? "Dados de Chegada (Visualização)" : "Dados de Chegada no Local"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_aplicacao" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data da Aplicação *
                <TooltipHelper 
                  content="Data em que o asfalto será aplicado. Aceita datas entre ontem e amanhã para flexibilidade no apontamento."
                />
              </Label>
              <Input
                id="data_aplicacao"
                type="date"
                {...register("data_aplicacao")}
                required
                disabled={isReadOnly}
                className={`${isReadOnly ? "bg-muted" : ""} ${
                  !dateValidation.isValid ? "border-red-500 focus:border-red-500" : ""
                }`}
              />
              {errors.data_aplicacao && (
                <span className="text-sm text-red-500">
                  {String(errors.data_aplicacao.message)}
                </span>
              )}
              {!dateValidation.isValid && dateValidation.message && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{dateValidation.message}</span>
                </div>
              )}
              {dataAplicacao && dateValidation.isValid && (
                <div className="text-sm text-green-600 bg-green-50 p-2 rounded-md">
                  ✓ Data válida: {formatDateForDisplay(dataAplicacao)}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hora_chegada_local" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Hora de Chegada * (Manual)
                <TooltipHelper 
                  content="Hora real de chegada do caminhão no local da aplicação. Deve ser informada manualmente pelo apontador."
                />
              </Label>
              <Input
                id="hora_chegada_local"
                type="time"
                {...register("hora_chegada_local")}
                required
                disabled={isReadOnly}
                className={isReadOnly ? "bg-muted" : ""}
                placeholder="HH:MM"
              />
              <div className="text-xs text-gray-500">
                Informe a hora real de chegada do caminhão no local
              </div>
              {errors.hora_chegada_local && (
                <span className="text-sm text-red-500">
                  {String(errors.hora_chegada_local.message)}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperatura_chegada" className="flex items-center gap-2">
                <Thermometer className="h-4 w-4" />
                Temperatura de Chegada (°C)
                <TooltipHelper 
                  content="Temperatura do asfalto ao chegar no local de aplicação. Campo opcional mas importante para controle de qualidade."
                />
              </Label>
              <Input
                id="temperatura_chegada"
                type="number"
                step="0.1"
                placeholder="Ex: 150.5"
                {...register("temperatura_chegada", {
                  valueAsNumber: true
                })}
                disabled={isReadOnly}
                className={isReadOnly ? "bg-muted" : ""}
              />
              {errors.temperatura_chegada && (
                <span className="text-sm text-red-500">
                  {String(errors.temperatura_chegada.message)}
                </span>
              )}
            </div>
          </div>

          {!isFormValid && !isReadOnly && (
            <Alert>
              <AlertDescription>
                {!dateValidation.isValid 
                  ? "Data inválida: escolha uma data entre ontem e amanhã."
                  : "Preencha todos os campos obrigatórios (*) antes de prosseguir."
                }
              </AlertDescription>
            </Alert>
          )}

          {/* Status Visual Aprimorado */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border">
            <h5 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Status dos Campos
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-3 p-2 bg-white rounded-md">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${dataAplicacao && dateValidation.isValid ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-700">Data da Aplicação</div>
                  <div className="text-xs text-gray-500 truncate">
                    {dataAplicacao ? (dateValidation.isValid ? formatDateForDisplay(dataAplicacao) : "Data inválida") : "Obrigatório"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-white rounded-md">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${horaChegadaLocal ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-700">Hora de Chegada</div>
                  <div className="text-xs text-gray-500 truncate">
                    {horaChegadaLocal || "Obrigatório"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 bg-white rounded-md">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${temperaturaChegada ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-700">Temperatura</div>
                  <div className="text-xs text-gray-500 truncate">
                    {temperaturaChegada ? `${temperaturaChegada}°C` : "Opcional"}
                  </div>
                </div>
              </div>
            </div>
            {!isFormValid && !isReadOnly && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {!dateValidation.isValid 
                      ? "Data inválida: escolha uma data entre ontem e amanhã."
                      : "Complete os campos obrigatórios para continuar."
                    }
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button 
          onClick={onNext} 
          disabled={!isFormValid || isReadOnly}
          className="bg-blue-500 hover:bg-blue-600"
        >
          {isReadOnly ? "Visualizar Aplicações" : "Próximo: Dados Técnicos"}
        </Button>
      </div>
    </div>
  );
};

export default NovoRegistroDadosIniciaisTab;
