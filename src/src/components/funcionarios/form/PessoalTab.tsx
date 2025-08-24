"use client";

import React from "react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  normalizeDateToBrazilianNoon,
  formatBrazilianDateToString,
  parseBrazilianDate,
} from "@/utils/timezoneUtils";
import { FuncionarioFormData, Funcionario } from "@/types/funcionario";

interface PessoalTabProps {
  form: UseFormReturn<FuncionarioFormData>;
  funcionario?: Funcionario | null;
  onClose: () => void;
  setActiveTab: (tab: string) => void;
  imagePreview: string | null;
  setImagePreview: (preview: string | null) => void;
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
  isUploadingImage: boolean;
  setIsUploadingImage: (uploading: boolean) => void;
}

export default function PessoalTab({
  form,
  onClose,
  setActiveTab,
}: PessoalTabProps) {
  const handleDateChange = (field: any, date: Date | undefined) => {
    if (date) {
      const normalized = normalizeDateToBrazilianNoon(date);
      const formatted = formatBrazilianDateToString(normalized);
      field.onChange(formatted);
    } else {
      field.onChange(null);
    }
  };

  const getDateValue = (dateString: string | null) => {
    if (!dateString) return undefined;
    try {
      return parseBrazilianDate(dateString);
    } catch (err) {
      console.error("Erro ao fazer parse da data:", err);
      return undefined;
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nome Completo */}
        <FormField
          control={form.control}
          name="nome_completo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome Completo *</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome completo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* CPF */}
        <FormField
          control={form.control}
          name="cpf"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CPF</FormLabel>
              <FormControl>
                <Input placeholder="000.000.000-00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Gênero */}
        <FormField
          control={form.control}
          name="genero"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gênero</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Masculino">Masculino</SelectItem>
                  <SelectItem value="Feminino">Feminino</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                  <SelectItem value="Prefiro não informar">Prefiro não informar</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Data de Nascimento com react-day-picker */}
        <FormField
          control={form.control}
          name="data_nascimento"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data de Nascimento</FormLabel>
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
                      {field.value
                        ? format(getDateValue(field.value) || new Date(), "dd/MM/yyyy", {
                            locale: ptBR,
                          })
                        : "Selecione a data"}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <DayPicker
                    mode="single"
                    selected={getDateValue(field.value)}
                    onSelect={(date) => handleDateChange(field, date)}
                    locale={ptBR}
                    captionLayout="dropdown"
                    fromYear={1900}
                    toYear={new Date().getFullYear()}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Escolaridade */}
        <FormField
          control={form.control}
          name="escolaridade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Escolaridade</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Ensino Fundamental Incompleto">Ensino Fundamental Incompleto</SelectItem>
                  <SelectItem value="Ensino Fundamental Completo">Ensino Fundamental Completo</SelectItem>
                  <SelectItem value="Ensino Médio Incompleto">Ensino Médio Incompleto</SelectItem>
                  <SelectItem value="Ensino Médio Completo">Ensino Médio Completo</SelectItem>
                  <SelectItem value="Ensino Superior Incompleto">Ensino Superior Incompleto</SelectItem>
                  <SelectItem value="Ensino Superior Completo">Ensino Superior Completo</SelectItem>
                  <SelectItem value="Pós-graduação">Pós-graduação</SelectItem>
                  <SelectItem value="Mestrado">Mestrado</SelectItem>
                  <SelectItem value="Doutorado">Doutorado</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="email@exemplo.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Endereço Completo */}
      <FormField
        control={form.control}
        name="endereco_completo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Endereço Completo</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Rua, número, complemento, bairro, cidade - CEP"
                className="min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Navegação */}
      <div className="flex justify-between gap-2 pt-4">
        <div></div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={() => setActiveTab("profissional")}>
            Próximo
          </Button>
        </div>
      </div>
    </div>
  );
}
