
import React, { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ListaProgramacaoEntrega } from "@/types/programacaoEntrega";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Truck, MapPin, Clock, Thermometer, AlertTriangle } from "lucide-react";
import { isDateAllowed, formatDateForDisplay } from "@/utils/dateValidation";
import { formatBrazilianDateForDisplay } from "@/utils/timezoneUtils";

interface RegistroCargaHeaderProps {
  form: UseFormReturn<any>;
  currentEntrega: ListaProgramacaoEntrega;
  centroCustoInfo: string;
}

const RegistroCargaHeader: React.FC<RegistroCargaHeaderProps> = ({
  form,
  currentEntrega,
  centroCustoInfo,
}) => {
  // Estado para validação de data
  const [dateValidation, setDateValidation] = useState<{
    isValid: boolean;
    message?: string;
  }>({ isValid: true });

  // Watch data_saida para validação em tempo real
  const dataSaida = form.watch("data_saida");

  // Validar data em tempo real
  useEffect(() => {
    if (dataSaida) {
      const validation = isDateAllowed(dataSaida);
      setDateValidation(validation);
    }
  }, [dataSaida]);
  // Helper function to format truck info
  const getTruckInfo = (): string => {
    if (currentEntrega.caminhao && typeof currentEntrega.caminhao === 'object') {
      const truck = currentEntrega.caminhao;
      if (truck.placa && truck.modelo) {
        return `${truck.placa} - ${truck.modelo}`;
      }
      return truck.placa || truck.modelo || 'Informação do caminhão não disponível';
    }
    return 'Caminhão não informado';
  };

  // Helper function to format date - usando a mesma função da tabela
  const formatEntregaDate = (dateString: string): string => {
    return formatBrazilianDateForDisplay(dateString);
  };

  return (
    <div className="space-y-4">
      {/* Informações da Entrega */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-blue-800 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Informações da Entrega
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="font-medium">Logradouro:</span>
                  <p className="text-sm">{currentEntrega.logradouro || 'Não informado'}</p>
                </div>
              </div>
              
              {/* Show bairro if available */}
              {currentEntrega.bairro && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="font-medium">Bairro:</span>
                    <p className="text-sm">{currentEntrega.bairro}</p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="font-medium">Data de Entrega:</span>
                  <p className="text-sm">{formatEntregaDate(currentEntrega.data_entrega)}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="font-medium">Caminhão:</span>
                  <p className="text-sm">{getTruckInfo()}</p>
                </div>
              </div>
              
              <div>
                <span className="font-medium">Centro de Custo:</span>
                <p className="text-sm">{centroCustoInfo}</p>
              </div>
              
              <div>
                <span className="font-medium">Quantidade Programada:</span>
                <p className="text-sm">{currentEntrega.quantidade_massa} kg</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dados de Saída */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="data_saida"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data de Saída *
              </FormLabel>
              <FormControl>
                <Input 
                  type="date" 
                  {...field}
                  className={!dateValidation.isValid ? "border-red-500 focus:border-red-500" : ""}
                />
              </FormControl>
              <FormMessage />
              {!dateValidation.isValid && dateValidation.message && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{dateValidation.message}</span>
                </div>
              )}
              {dataSaida && dateValidation.isValid && (
                <div className="text-sm text-green-600 bg-green-50 p-2 rounded-md">
                  ✓ Data válida: {formatDateForDisplay(dataSaida)}
                </div>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hora_saida"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Hora de Saída
              </FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="temperatura_saida"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Thermometer className="h-4 w-4" />
                Temperatura (°C)
              </FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.1"
                  placeholder="Ex: 150.5"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default RegistroCargaHeader;
