import React, { useCallback } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FilterX, Calendar, Building2, Truck, CheckCircle } from "lucide-react";
import type { RegistroAplicacaoFilters as RegistroAplicacaoFiltersType } from "@/types/registroAplicacao";
import { Input } from "../ui/input";
import { getCurrentBrazilianDate, parseBrazilianDate } from "@/utils/timezoneUtils";

const filterSchema = z.object({
  centro_custo_id: z.string().optional(),
  caminhao_id: z.string().optional(),
  data_inicio: z.string().optional(),
  status: z.string().optional(),
});

type FilterValues = z.infer<typeof filterSchema>;

interface RegistroAplicacaoFiltersProps {
  onFilter: (filters: RegistroAplicacaoFiltersType) => void;
  caminhoesList: { id: string; placa: string; modelo: string }[];
  centrosCustoList: { id: string; nome_centro_custo: string }[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

const statusOptions = [
  { value: "all", label: "Todos os status" },
  { value: "Enviada", label: "Enviada" },
  { value: "Entregue", label: "Entregue" },
  { value: "Cancelada", label: "Cancelada" },
];

const RegistroAplicacaoFilters: React.FC<RegistroAplicacaoFiltersProps> = ({
  onFilter,
  caminhoesList,
  centrosCustoList,
  hasActiveFilters,
  onClearFilters,
}) => {
  // Get today's date in Brazilian timezone
  const today = getCurrentBrazilianDate();

  const form = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      centro_custo_id: "all",
      caminhao_id: "all",
      data_inicio: today,
      status: "all",
    },
  });

  const handleSubmit = useCallback((data: FilterValues) => {
    console.log("🔍 Filter form submitted with data:", data);
    
    // Convert date string to properly parsed Brazilian date
    let dateFilter: Date | undefined;
    if (data.data_inicio) {
      // Use parseBrazilianDate to convert YYYY-MM-DD string to proper Brazilian date
      dateFilter = parseBrazilianDate(data.data_inicio);
      console.log("📅 Parsed Brazilian date filter:", dateFilter, "from input:", data.data_inicio);
    }
    
    onFilter({
      centro_custo_id: data.centro_custo_id && data.centro_custo_id !== "all" ? data.centro_custo_id : undefined,
      caminhao_id: data.caminhao_id && data.caminhao_id !== "all" ? data.caminhao_id : undefined,
      data_inicio: dateFilter,
      status: data.status && data.status !== "all" ? data.status : undefined,
    });
  }, [onFilter]);

  const handleReset = useCallback(() => {
    console.log("🔄 Resetting filters to default");
    const resetValues = {
      centro_custo_id: "all",
      caminhao_id: "all",
      data_inicio: today,
      status: "all",
    };
    form.reset(resetValues);
    onClearFilters();
  }, [form, today, onClearFilters]);

  // Optimized watch - only trigger when values actually change
  React.useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      // Only submit if it's a user interaction (not programmatic)
      if (type === 'change') {
        handleSubmit(value as FilterValues);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, handleSubmit]);

  console.log("🎛️ Rendering filters with:", {
    centrosCustoCount: centrosCustoList.length,
    caminhoesCount: caminhoesList.length,
    sampleCentroCusto: centrosCustoList[0]?.nome_centro_custo,
    currentDate: today
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Filtros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(handleSubmit)(e); }} className="space-y-4">
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <FormLabel htmlFor="centro_custo_id">Centro de Custo</FormLabel>
                  <div className="relative">
                    <Building2 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <FormField
                      control={form.control}
                      name="centro_custo_id"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger id="centro_custo_id" className="pl-8">
                            <SelectValue placeholder="Selecione um centro de custo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos os centros de custo</SelectItem>
                            {centrosCustoList.length > 0 ? (
                              centrosCustoList.map((centro) => (
                                <SelectItem key={centro.id} value={centro.id}>
                                  {centro.nome_centro_custo}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-data" disabled>
                                Nenhum centro de custo encontrado
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <FormLabel htmlFor="caminhao_id">Caminhão</FormLabel>
                  <div className="relative">
                    <Truck className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <FormField
                      control={form.control}
                      name="caminhao_id"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger id="caminhao_id" className="pl-8">
                            <SelectValue placeholder="Selecione um caminhão" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos os caminhões</SelectItem>
                            {caminhoesList.length > 0 ? (
                              caminhoesList.map((caminhao) => (
                                <SelectItem key={caminhao.id} value={caminhao.id}>
                                  {`${caminhao.placa} - ${caminhao.modelo}`}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-data" disabled>
                                Nenhum caminhão encontrado
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <FormLabel htmlFor="status">Status</FormLabel>
                  <div className="relative">
                    <CheckCircle className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger id="status" className="pl-8">
                            <SelectValue placeholder="Selecione um status" />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <FormLabel htmlFor="data_inicio">Data</FormLabel>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="data_inicio"
                      type="date"
                      className="pl-8"
                      {...form.register("data_inicio")}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleReset}
                size="sm"
                className="gap-2"
                disabled={!hasActiveFilters}
              >
                <FilterX className="h-4 w-4" />
                Limpar Filtros
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default RegistroAplicacaoFilters;
