
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import VeiculoDetailsTab from "./VeiculoDetailsTab";
import VeiculoSpecificationsTab from "./VeiculoSpecificationsTab";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface VeiculoFormTabsProps {
  form: UseFormReturn<any>;
  onSubmit: (values: any) => Promise<void>;
  isSubmitting: boolean;
  onClose: () => void;
  currentImage?: string | null;
  onImageChange: (file: File) => void;
  departamentos: { id: string, nome_departamento: string }[];
  empresas: { id: string, nome_empresa: string }[];
}

const VeiculoFormTabs: React.FC<VeiculoFormTabsProps> = ({
  form,
  onSubmit,
  isSubmitting,
  onClose,
  currentImage,
  onImageChange,
  departamentos,
  empresas,
}) => {
  const [activeTab, setActiveTab] = useState("details");

  const handleNextTab = () => {
    setActiveTab("specifications");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Dados Básicos</TabsTrigger>
            <TabsTrigger value="specifications">Especificações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4 pt-4 flex-1 overflow-y-auto">
            <VeiculoDetailsTab 
              form={form} 
              departamentos={departamentos}
              empresas={empresas}
              currentImage={currentImage}
              onImageChange={onImageChange}
            />
            
            {/* Botão Seguir na aba de Dados Básicos */}
            <div className="flex justify-end pt-4 sticky bottom-0 bg-background border-t mt-4 pt-4">
              <Button type="button" onClick={handleNextTab} className="gap-2">
                Seguir
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="specifications" className="space-y-4 pt-4 flex-1 overflow-y-auto">
            <VeiculoSpecificationsTab form={form} />
            
            {/* Botões de cancelar e salvar na aba de Especificações */}
            <DialogFooter className="pt-4 sticky bottom-0 bg-background border-t mt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  );
};

export default VeiculoFormTabs;
