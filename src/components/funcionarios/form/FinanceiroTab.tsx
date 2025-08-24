
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface FinanceiroTabProps {
  form: UseFormReturn<any>;
  onClose: () => void;
  setActiveTab: (tab: string) => void;
  isSubmitting: boolean;
}

const FinanceiroTab: React.FC<FinanceiroTabProps> = ({
  form,
  onClose,
  setActiveTab,
  isSubmitting
}) => {
  // Função para tratar valores de entrada numéricos
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: number | undefined) => void) => {
    const value = e.target.value;
    if (value === "" || value === null || value === undefined) {
      onChange(undefined);
    } else {
      // Converte para número e garante que seja um valor válido
      const numValue = parseFloat(value);
      onChange(isNaN(numValue) ? undefined : numValue);
    }
  };

  return (
    <div className="space-y-4">
      {/* Salários e Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  placeholder="0,00"
                  onChange={(e) => handleNumberChange(e, field.onChange)} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="insalubridade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Insalubridade</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="0,00"
                  onChange={(e) => handleNumberChange(e, field.onChange)} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="periculosidade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Periculosidade</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="0,00"
                  onChange={(e) => handleNumberChange(e, field.onChange)} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="gratificacao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gratificação</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="0,00"
                  onChange={(e) => handleNumberChange(e, field.onChange)} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="adicional_noturno"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adicional Noturno</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="0,00"
                  onChange={(e) => handleNumberChange(e, field.onChange)} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="custo_passagem"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custo com Passagem</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="0,00"
                  onChange={(e) => handleNumberChange(e, field.onChange)} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="refeicao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Refeição</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="0,00"
                  onChange={(e) => handleNumberChange(e, field.onChange)} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="diarias"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Diárias</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  placeholder="0,00"
                  onChange={(e) => handleNumberChange(e, field.onChange)} 
                  value={field.value || ""}
                />
              </FormControl>
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
          onClick={() => setActiveTab("contratual")}
        >
          Anterior
        </Button>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Cadastro"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FinanceiroTab;
