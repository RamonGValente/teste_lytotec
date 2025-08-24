
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { parseLocalDate, formatDateToString } from "@/lib/utils";
import { RegistroAplicacaoSchema } from "@/validations/registroAplicacaoSchema";
import { RegistroCarga } from "@/types/registroCargas";

interface DadosIniciaisTabProps {
  form: UseFormReturn<RegistroAplicacaoSchema>;
  onNext: () => void;
  registroCarga?: RegistroCarga | null;
}

const DadosIniciaisTab: React.FC<DadosIniciaisTabProps> = ({ 
  form, 
  onNext,
  registroCarga 
}) => {
  // Função melhorada para seleção de data que evita problemas de timezone
  const handleDateSelect = (date: Date | undefined) => {
    console.log("📅 Date selection triggered:", date);
    
    if (!date) {
      console.log("❌ No date selected, clearing field");
      form.setValue("data_aplicacao", "");
      return;
    }
    
    try {
      // Cria uma data local normalizada para evitar problemas de timezone
      const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
      const formattedDate = formatDateToString(localDate);
      
      console.log("✅ Setting date:", {
        originalSelected: date,
        localNormalized: localDate,
        formattedString: formattedDate,
        dayOfMonth: localDate.getDate(),
        month: localDate.getMonth() + 1,
        year: localDate.getFullYear()
      });
      
      // Define o valor no formulário
      form.setValue("data_aplicacao", formattedDate);
      
      // Força a atualização do formulário
      form.trigger("data_aplicacao");
      
      console.log("📝 Form value after selection:", form.getValues("data_aplicacao"));
    } catch (error) {
      console.error("❌ Error setting date:", error);
    }
  };

  // Função para manipular clique direto no dia (backup para problemas de onSelect)
  const handleDayClick = (day: Date, modifiers: any) => {
    console.log("🖱️ Day clicked:", day, "modifiers:", modifiers);
    
    if (!modifiers.disabled && !modifiers.outside) {
      handleDateSelect(day);
    }
  };

  // Obtém o valor atual da data para exibição
  const currentDateValue = form.watch("data_aplicacao");
  console.log("👀 Current form date value:", currentDateValue);

  // Converte a string de data para Date object para o componente Calendar
  const selectedDate = currentDateValue ? parseLocalDate(currentDateValue) : undefined;
  console.log("📊 Selected date for calendar:", selectedDate);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="data_aplicacao">Data da Aplicação</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !currentDateValue && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {currentDateValue ? (
                  format(parseLocalDate(currentDateValue), "dd/MM/yyyy", { locale: ptBR })
                ) : (
                  <span>Selecione uma data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-[99999] bg-white border shadow-lg" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                onDayClick={handleDayClick}
                initialFocus
                className="pointer-events-auto"
                disabled={(date) => date < new Date("2000-01-01") || date > new Date("2030-12-31")}
                fixedWeeks
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <Label htmlFor="hora_chegada_local">Hora da Chegada ao Local</Label>
          <Input
            id="hora_chegada_local"
            type="time"
            {...form.register("hora_chegada_local")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="temperatura_chegada">Temperatura da Massa na Chegada (°C)</Label>
          <Input
            id="temperatura_chegada"
            type="number"
            {...form.register("temperatura_chegada", { valueAsNumber: true })}
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button type="button" onClick={onNext}>
          Próximo
        </Button>
      </div>
    </div>
  );
};

export default DadosIniciaisTab;
