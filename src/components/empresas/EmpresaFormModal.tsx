
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Empresa, EmpresaFormData } from "@/types/empresa";
import { createEmpresa, updateEmpresa, checkCnpjExists } from "@/services/empresaService";
import { useToast } from "@/hooks/use-toast";

interface EmpresaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  empresa?: Empresa;
}

const formSchema = z.object({
  nome_empresa: z.string().min(1, { message: "Nome da empresa é obrigatório" }),
  cnpj: z.string().min(1, { message: "CNPJ é obrigatório" }),
  telefone: z.string().optional().nullable(),
  situacao: z.enum(["Ativa", "Inativa"])
});

const EmpresaFormModal: React.FC<EmpresaFormModalProps> = ({ isOpen, onClose, onSuccess, empresa }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome_empresa: "",
      cnpj: "",
      telefone: "",
      situacao: "Ativa" as const
    }
  });

  useEffect(() => {
    if (empresa) {
      form.reset({
        nome_empresa: empresa.nome_empresa,
        cnpj: empresa.cnpj,
        telefone: empresa.telefone || "",
        situacao: empresa.situacao
      });
    } else {
      form.reset({
        nome_empresa: "",
        cnpj: "",
        telefone: "",
        situacao: "Ativa"
      });
    }
  }, [empresa, form, isOpen]);

  const formatCnpj = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numericValue = value.replace(/\D/g, '');
    
    // Limita a 14 dígitos
    const truncated = numericValue.slice(0, 14);
    
    // Aplica a máscara do CNPJ: 00.000.000/0001-00
    if (truncated.length <= 2) {
      return truncated;
    } else if (truncated.length <= 5) {
      return `${truncated.slice(0, 2)}.${truncated.slice(2)}`;
    } else if (truncated.length <= 8) {
      return `${truncated.slice(0, 2)}.${truncated.slice(2, 5)}.${truncated.slice(5)}`;
    } else if (truncated.length <= 12) {
      return `${truncated.slice(0, 2)}.${truncated.slice(2, 5)}.${truncated.slice(5, 8)}/${truncated.slice(8)}`;
    } else {
      return `${truncated.slice(0, 2)}.${truncated.slice(2, 5)}.${truncated.slice(5, 8)}/${truncated.slice(8, 12)}-${truncated.slice(12, 14)}`;
    }
  };

  const formatTelefone = (value: string) => {
    // Remove todos os caracteres não numéricos
    const numericValue = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos (para celular com DDD)
    const truncated = numericValue.slice(0, 11);
    
    // Aplica a máscara de telefone: (00) 0000-0000 ou (00) 00000-0000
    if (truncated.length <= 2) {
      return truncated.length ? `(${truncated}` : truncated;
    } else if (truncated.length <= 6) {
      return `(${truncated.slice(0, 2)}) ${truncated.slice(2)}`;
    } else if (truncated.length <= 10) {
      return `(${truncated.slice(0, 2)}) ${truncated.slice(2, 6)}-${truncated.slice(6)}`;
    } else {
      return `(${truncated.slice(0, 2)}) ${truncated.slice(2, 7)}-${truncated.slice(7)}`;
    }
  };

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCnpj(e.target.value);
    form.setValue("cnpj", formatted);
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTelefone(e.target.value);
    form.setValue("telefone", formatted);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      // Verificar se o CNPJ já existe, excluindo o ID atual em caso de edição
      const cnpjExists = await checkCnpjExists(values.cnpj, empresa?.id);
      
      if (cnpjExists) {
        form.setError("cnpj", { 
          type: "manual", 
          message: "Este CNPJ já está cadastrado" 
        });
        return;
      }

      const empresaData: EmpresaFormData = {
        nome_empresa: values.nome_empresa,
        cnpj: values.cnpj,
        telefone: values.telefone || null,
        situacao: values.situacao
      };

      if (empresa) {
        // Edição
        await updateEmpresa(empresa.id, empresaData);
        toast({
          title: "Empresa atualizada",
          description: "Os dados da empresa foram atualizados com sucesso."
        });
      } else {
        // Criação
        await createEmpresa(empresaData);
        toast({
          title: "Empresa cadastrada",
          description: "A empresa foi cadastrada com sucesso."
        });
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar empresa:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar os dados da empresa.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{empresa ? "Editar Empresa" : "Cadastrar Nova Empresa"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome_empresa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Empresa *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da empresa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="00.000.000/0001-00" 
                      value={field.value} 
                      onChange={(e) => {
                        field.onChange(e);
                        handleCnpjChange(e);
                      }} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="(00) 00000-0000" 
                      value={field.value || ""} 
                      onChange={(e) => {
                        field.onChange(e);
                        handleTelefoneChange(e);
                      }} 
                    />
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a situação" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Ativa">Ativa</SelectItem>
                      <SelectItem value="Inativa">Inativa</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EmpresaFormModal;
