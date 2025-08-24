
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Scale } from "lucide-react";

interface WeightInputProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  isRetorno?: boolean;
  className?: string;
}

const WeightInput: React.FC<WeightInputProps> = ({
  form,
  name,
  label,
  isRetorno = false,
  className = "",
}) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2">
            <Scale className="h-4 w-4" />
            {label}
          </FormLabel>
          <FormControl>
            <Input
              type="number"
              step="1"
              min="0"
              placeholder={isRetorno ? "Ex: 2500" : "Ex: 26000"}
              className={className}
              {...field}
              onChange={(e) => {
                // Store the value directly as entered (in kg), allow empty value
                const value = e.target.value;
                field.onChange(value === '' ? '' : Number(value));
              }}
              value={field.value === null || field.value === undefined ? '' : field.value}
            />
          </FormControl>
          <FormMessage />
          <p className="text-xs text-muted-foreground">
            {isRetorno 
              ? "Peso do caminhão vazio em quilogramas (opcional)" 
              : "Peso total do caminhão carregado em quilogramas"}
          </p>
        </FormItem>
      )}
    />
  );
};

export default WeightInput;
