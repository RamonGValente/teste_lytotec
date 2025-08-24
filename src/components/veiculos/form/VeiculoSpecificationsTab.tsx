
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VeiculoSpecificationsTabProps {
  form: UseFormReturn<any>;
}

const VeiculoSpecificationsTab: React.FC<VeiculoSpecificationsTabProps> = ({
  form,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="motor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motor</FormLabel>
              <FormControl>
                <Input placeholder="Especificações do motor" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="ano_fabricacao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ano de Fabricação</FormLabel>
              <FormControl>
                <Input placeholder="2023/2024" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="tipo_combustivel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Combustível</FormLabel>
              <FormControl>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || ''}
                  value={field.value || ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o combustível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Selecione</SelectItem>
                    <SelectItem value="Diesel">Diesel</SelectItem>
                    <SelectItem value="Diesel S10">Diesel S10</SelectItem>
                    <SelectItem value="Gasolina">Gasolina</SelectItem>
                    <SelectItem value="Etanol">Etanol</SelectItem>
                    <SelectItem value="Flex">Flex</SelectItem>
                    <SelectItem value="GNV">GNV</SelectItem>
                    <SelectItem value="Elétrico">Elétrico</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="status_ipva"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status IPVA</FormLabel>
              <FormControl>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || ''}
                  value={field.value || ''}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Selecione</SelectItem>
                    <SelectItem value="Pago">Pago</SelectItem>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="situacao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Situação *</FormLabel>
              <FormControl>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a situação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Operando">Operando</SelectItem>
                    <SelectItem value="Em Manutenção">Em Manutenção</SelectItem>
                    <SelectItem value="Disponível">Disponível</SelectItem>
                    <SelectItem value="Intempérie">Intempérie</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="capacidade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacidade</FormLabel>
              <FormControl>
                <Input placeholder="Capacidade máxima" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="aluguel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aluguel (se aplicável)</FormLabel>
              <FormControl>
                <Input placeholder="Valor do aluguel" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormField
        control={form.control}
        name="observacoes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observações</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Observações adicionais sobre o veículo ou equipamento"
                className="resize-none min-h-[100px]"
                {...field}
                value={field.value || ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default VeiculoSpecificationsTab;
