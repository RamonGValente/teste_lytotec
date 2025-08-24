
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ConvertToOsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (osData: any) => Promise<void>;
  chamado: any | null;
  isLoading: boolean;
}

// Define the form schema for OS conversion
const osConversionSchema = z.object({
  tipo_falha: z.enum(["Mecânica", "Elétrica", "Hidráulica", "Pneus", "Manutenção", "Outras"]),
});

const ConvertToOsModal: React.FC<ConvertToOsModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  chamado,
  isLoading,
}) => {
  const form = useForm<z.infer<typeof osConversionSchema>>({
    resolver: zodResolver(osConversionSchema),
    defaultValues: {
      tipo_falha: "Mecânica",
    },
  });

  if (!chamado) return null;

  const handleSubmit = async (data: z.infer<typeof osConversionSchema>) => {
    await onConfirm(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Converter para Ordem de Serviço</DialogTitle>
          <DialogDescription>
            Você está convertendo o chamado #{chamado.numero_chamado} para uma Ordem de Serviço (OS).
            Forneça as informações adicionais necessárias.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Dados da OS a ser criada</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Número</label>
                  <p className="mt-1 text-sm">{chamado.numero_chamado}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Prioridade</label>
                  <p className="mt-1 text-sm">{chamado.prioridade}</p>
                </div>
              </div>
              
              <Separator />
              
              <FormField
                control={form.control}
                name="tipo_falha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">
                      Tipo de Falha <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger className="border bg-white">
                          <SelectValue placeholder="Selecione o tipo de falha" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        <SelectItem value="Mecânica">Mecânica</SelectItem>
                        <SelectItem value="Elétrica">Elétrica</SelectItem>
                        <SelectItem value="Hidráulica">Hidráulica</SelectItem>
                        <SelectItem value="Pneus">Pneus</SelectItem>
                        <SelectItem value="Manutenção">Manutenção</SelectItem>
                        <SelectItem value="Outras">Outras</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={onClose}
                type="button"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Convertendo...
                  </>
                ) : (
                  "Converter para OS"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ConvertToOsModal;
