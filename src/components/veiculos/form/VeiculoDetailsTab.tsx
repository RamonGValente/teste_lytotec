
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import VeiculoImageUpload from "../VeiculoImageUpload";

interface VeiculoDetailsTabProps {
  form: UseFormReturn<any>;
  departamentos: { id: string, nome_departamento: string }[];
  empresas: { id: string, nome_empresa: string }[];
  currentImage?: string | null;
  onImageChange: (file: File) => void;
}

const VeiculoDetailsTab: React.FC<VeiculoDetailsTabProps> = ({
  form,
  departamentos,
  empresas,
  currentImage,
  onImageChange,
}) => {
  const tipoVeiculo = form.watch('tipo_veiculo');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 order-2 lg:order-1">
        <VeiculoImageUpload 
          currentImage={currentImage}
          onImageChange={onImageChange}
        />
      </div>
      
      <div className="lg:col-span-2 order-1 lg:order-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="frota"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frota *</FormLabel>
              <FormControl>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma frota" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="LYE">LYE</SelectItem>
                    <SelectItem value="LYC">LYC</SelectItem>
                    <SelectItem value="LOC">LOC</SelectItem>
                    <SelectItem value="LOK">LOK</SelectItem>
                    <SelectItem value="LYU">LYU</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="numero_frota"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número Frota</FormLabel>
              <FormControl>
                <Input placeholder="Ex: 001" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="empresa_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proprietário</FormLabel>
              <FormControl>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || ""}
                  value={field.value || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um proprietário" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="_none">Nenhum</SelectItem>
                    {empresas.map((empresa) => (
                      <SelectItem key={empresa.id} value={empresa.id}>
                        {empresa.nome_empresa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="departamento_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Departamento</FormLabel>
              <FormControl>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || ""}
                  value={field.value || ""}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um departamento" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="_none">Nenhum</SelectItem>
                    {departamentos.map((departamento) => (
                      <SelectItem key={departamento.id} value={departamento.id}>
                        {departamento.nome_departamento}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="tipo_veiculo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Veículo *</FormLabel>
              <FormControl>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  value={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Caminhão">Caminhão</SelectItem>
                    <SelectItem value="Equipamento">Equipamento</SelectItem>
                    <SelectItem value="Prancha">Prancha</SelectItem>
                    <SelectItem value="Van">Van</SelectItem>
                    <SelectItem value="Ônibus">Ônibus</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="placa"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{tipoVeiculo === "Caminhão" ? "Placa *" : "Placa"}</FormLabel>
              <FormControl>
                <Input placeholder="ABC-1234" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="marca"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Marca</FormLabel>
              <FormControl>
                <Input placeholder="Volvo, Caterpillar, etc." {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="modelo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modelo</FormLabel>
              <FormControl>
                <Input placeholder="FH 540, 320D, etc." {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="cor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cor</FormLabel>
              <FormControl>
                <Input placeholder="Branco, Amarelo, etc." {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default VeiculoDetailsTab;
