
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Permissao, PermissaoFormData } from "@/types/permissao";

interface PermissaoFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  permissao: Permissao | null;
  onSubmit: (data: PermissaoFormData) => void;
  isSubmitting: boolean;
}

const formSchema = z.object({
  nome_permissao: z.string().min(3, "Nome da permissão deve ter pelo menos 3 caracteres"),
  descricao: z.string().optional(),
  rota: z.string().optional(),
});

const PermissaoFormModal: React.FC<PermissaoFormModalProps> = ({
  isOpen,
  onClose,
  permissao,
  onSubmit,
  isSubmitting,
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome_permissao: "",
      descricao: "",
      rota: "",
    },
  });

  React.useEffect(() => {
    if (permissao) {
      form.reset({
        nome_permissao: permissao.nome_permissao,
        descricao: permissao.descricao || "",
        rota: permissao.rota || "",
      });
    } else {
      form.reset({
        nome_permissao: "",
        descricao: "",
        rota: "",
      });
    }
  }, [permissao, form]);

  const handleFormSubmit = (data: z.infer<typeof formSchema>) => {
    // Ensure all required fields are present to satisfy PermissaoFormData type
    const formData: PermissaoFormData = {
      nome_permissao: data.nome_permissao,
      descricao: data.descricao || "",
      rota: data.rota || "",
    };
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {permissao ? "Editar Permissão" : "Nova Permissão"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome_permissao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Permissão</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da permissão" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição da permissão"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rota"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rota</FormLabel>
                  <FormControl>
                    <Input placeholder="/caminho/da/rota" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PermissaoFormModal;
