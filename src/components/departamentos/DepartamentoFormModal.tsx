
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createDepartamento, updateDepartamento, checkDepartamentoExists } from "@/services/departamentoService";
import { getEmpresas } from "@/services/empresaService";
import { useToast } from "@/hooks/use-toast";
import { Departamento, DepartamentoFormData } from "@/types/departamento";
import { useQuery } from "@tanstack/react-query";

interface DepartamentoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  departamento?: Departamento;
}

const formSchema = z.object({
  nome_departamento: z.string().min(1, { message: "Nome do departamento é obrigatório" }),
  empresa_id: z.string().min(1, { message: "Empresa é obrigatória" })
});

type FormValues = z.infer<typeof formSchema>;

const DepartamentoFormModal: React.FC<DepartamentoFormModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  departamento 
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: empresas = [], isLoading: isLoadingEmpresas } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => getEmpresas({}),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome_departamento: "",
      empresa_id: ""
    }
  });

  useEffect(() => {
    if (departamento) {
      form.reset({
        nome_departamento: departamento.nome_departamento,
        empresa_id: departamento.empresa_id
      });
    } else {
      form.reset({
        nome_departamento: "",
        empresa_id: ""
      });
    }
  }, [departamento, form, isOpen]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // Verificar se o departamento já existe na mesma empresa
      const departamentoExists = await checkDepartamentoExists(
        values.nome_departamento, 
        values.empresa_id,
        departamento?.id
      );
      
      if (departamentoExists) {
        form.setError("nome_departamento", { 
          type: "manual", 
          message: "Este departamento já existe nesta empresa" 
        });
        return;
      }

      if (departamento) {
        // Edição
        await updateDepartamento(departamento.id, values as DepartamentoFormData);
        toast({
          title: "Departamento atualizado",
          description: "O departamento foi atualizado com sucesso."
        });
      } else {
        // Criação
        await createDepartamento(values as DepartamentoFormData);
        toast({
          title: "Departamento cadastrado",
          description: "O departamento foi cadastrado com sucesso."
        });
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar departamento:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao salvar os dados do departamento.",
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
          <DialogTitle>
            {departamento ? "Editar Departamento" : "Cadastrar Novo Departamento"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="empresa_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma empresa" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingEmpresas ? (
                        <SelectItem value="" disabled>Carregando empresas...</SelectItem>
                      ) : empresas && empresas.length > 0 ? (
                        empresas.map((empresa) => (
                          <SelectItem key={empresa.id} value={empresa.id}>
                            {empresa.nome_empresa}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="" disabled>Nenhuma empresa encontrada</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="nome_departamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Departamento *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do departamento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                disabled={isSubmitting}
              >
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

export default DepartamentoFormModal;
