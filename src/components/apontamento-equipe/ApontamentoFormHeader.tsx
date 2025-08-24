
import React from "react";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { Equipe } from "@/types/equipe";

interface ApontamentoFormHeaderProps {
  form: UseFormReturn<any>;
  equipes: Equipe[];
  isLoading: boolean;
  isEditing: boolean;
}

const ApontamentoFormHeader: React.FC<ApontamentoFormHeaderProps> = ({
  form,
  equipes,
  isLoading,
  isEditing
}) => {
  // Função de manipulação para normalizar a data selecionada
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      form.setValue("data_registro", undefined);
      return;
    }

    // Cria uma nova data com hora meio-dia para evitar problemas de timezone
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
    form.setValue("data_registro", normalizedDate);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
      <FormField
        control={form.control}
        name="equipe_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium">Equipe</FormLabel>
            <Select
              disabled={isLoading || isEditing}
              value={field.value}
              onValueChange={field.onChange}
            >
              <FormControl>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Selecione uma equipe" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {equipes.map((equipe) => (
                  <SelectItem key={equipe.id} value={equipe.id}>
                    {equipe.nome_equipe}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="data_registro"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-medium">Data</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full h-10 pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "dd/MM/yyyy", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={handleDateSelect}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </FormItem>
        )}
      />
    </div>
  );
};

export default ApontamentoFormHeader;
