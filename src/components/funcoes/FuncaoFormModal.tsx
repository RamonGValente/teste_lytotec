
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Funcao, FuncaoFormData } from "@/types/funcao";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { checkFuncaoExists, createFuncao, updateFuncao } from "@/services/funcaoService";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  nome_funcao: z.string().min(1, "Nome da função é obrigatório")
});

interface FuncaoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  funcao?: Funcao;
}

const FuncaoFormModal: React.FC<FuncaoFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  funcao
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!funcao;
  
  const form = useForm<FuncaoFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome_funcao: funcao?.nome_funcao || ""
    }
  });
  
  React.useEffect(() => {
    if (isOpen) {
      form.reset({
        nome_funcao: funcao?.nome_funcao || ""
      });
    }
  }, [isOpen, funcao, form]);
  
  const createMutation = useMutation({
    mutationFn: createFuncao,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funcoes"] });
      toast({
        title: "Função cadastrada com sucesso",
        description: "A função foi adicionada ao sistema"
      });
      onSuccess();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao cadastrar função",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FuncaoFormData }) => 
      updateFuncao(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["funcoes"] });
      toast({
        title: "Função atualizada com sucesso",
        description: "As alterações foram salvas com sucesso."
      });
      onSuccess();
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar função",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const isPending = createMutation.isPending || updateMutation.isPending;
  
  const onSubmit = async (data: FuncaoFormData) => {
    try {
      // Check if function name already exists
      const exists = await checkFuncaoExists(data.nome_funcao, funcao?.id);
      if (exists) {
        form.setError("nome_funcao", { 
          message: "Já existe uma função com este nome" 
        });
        return;
      }
      
      if (isEditing && funcao) {
        updateMutation.mutate({ id: funcao.id, data });
      } else {
        createMutation.mutate(data);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao processar o formulário";
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Função" : "Cadastrar Nova Função"}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome_funcao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Função</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Motorista" />
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
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Salvar Alterações" : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default FuncaoFormModal;
