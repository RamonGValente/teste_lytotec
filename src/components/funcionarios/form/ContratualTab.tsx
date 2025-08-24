
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { 
  normalizeDateToBrazilianNoon, 
  formatBrazilianDateToString, 
  parseBrazilianDate 
} from "@/utils/timezoneUtils";
import { FuncionarioFormData } from "@/types/funcionario";

interface ContratualTabProps {
  form: UseFormReturn<FuncionarioFormData>;
  onClose: () => void;
  setActiveTab: (tab: string) => void;
}

export default function ContratualTab({ form, onClose, setActiveTab }: ContratualTabProps) {
  const handleDateChange = (field: any, date: Date | undefined) => {
    if (date) {
      const normalizedDate = normalizeDateToBrazilianNoon(date);
      const dateString = formatBrazilianDateToString(normalizedDate);
      field.onChange(dateString);
    } else {
      field.onChange(null);
    }
  };

  const getDateValue = (dateString: string | null) => {
    if (!dateString) return undefined;
    try {
      return parseBrazilianDate(dateString);
    } catch (error) {
      console.error("Erro ao fazer parse da data:", error);
      return undefined;
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Data de Admissão */}
        <FormField
          control={form.control}
          name="data_admissao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Admissão</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(getDateValue(field.value) || new Date(), "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        "Selecione a data"
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={getDateValue(field.value)}
                    onSelect={(date) => handleDateChange(field, date)}
                    disabled={(date) => date > new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Salário Base */}
        <FormField
          control={form.control}
          name="salario_base"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Salário Base</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Data de Férias */}
        <FormField
          control={form.control}
          name="data_ferias"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Férias</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(getDateValue(field.value) || new Date(), "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        "Selecione a data"
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={getDateValue(field.value)}
                    onSelect={(date) => handleDateChange(field, date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                  <SelectItem value="Aviso Prévio">Aviso Prévio</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Data de Demissão */}
        <FormField
          control={form.control}
          name="data_demissao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Demissão</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(getDateValue(field.value) || new Date(), "dd/MM/yyyy", { locale: ptBR })
                      ) : (
                        "Selecione a data"
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={getDateValue(field.value)}
                    onSelect={(date) => handleDateChange(field, date)}
                    disabled={(date) => date < new Date("1900-01-01")}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Navegação */}
      <div className="flex justify-between gap-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setActiveTab("profissional")}
        >
          Anterior
        </Button>
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            onClick={() => setActiveTab("financeiro")}
          >
            Próximo
          </Button>
        </div>
      </div>
    </div>
  );
}
