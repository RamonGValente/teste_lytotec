
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, RotateCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CBUQFilters, PeriodFilter } from "@/pages/DashboardRequisicoes";
import { subDays, subMonths, subQuarters, subYears } from "date-fns";
import { 
  normalizeDateToBrazilianNoon, 
  formatBrazilianDateToString, 
  parseBrazilianDate 
} from "@/utils/timezoneUtils";

interface DashboardCBUQFiltersProps {
  filters: CBUQFilters;
  onFiltersChange: (filters: CBUQFilters) => void;
}

export default function DashboardCBUQFilters({ filters, onFiltersChange }: DashboardCBUQFiltersProps) {
  console.log("🎛️ DashboardCBUQFilters - Current filters:", filters);

  // Fetch centers de custo
  const { data: centrosCusto } = useQuery({
    queryKey: ['centros-custo-filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bd_centros_custo')
        .select('id, nome_centro_custo')
        .eq('situacao', 'Ativo')
        .order('nome_centro_custo');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch encarregados
  const { data: encarregados } = useQuery({
    queryKey: ['encarregados-filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bd_funcionarios')
        .select(`
          id, 
          nome_completo,
          funcao:funcao_id(nome_funcao)
        `)
        .eq('status', 'Ativo')
        .order('nome_completo');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch caminhões
  const { data: caminhoes } = useQuery({
    queryKey: ['caminhoes-filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bd_caminhoes_equipamentos')
        .select('id, frota, numero_frota, placa')
        .eq('situacao', 'Operando')
        .order('frota');
      
      if (error) throw error;
      return data;
    }
  });

  const handlePeriodChange = (period: PeriodFilter) => {
    console.log("📅 Changing period to:", period);
    
    const today = normalizeDateToBrazilianNoon();
    let dataInicio: Date;
    let dataFim = today;

    switch (period) {
      case "today":
        dataInicio = normalizeDateToBrazilianNoon(today);
        break;
      case "week":
        dataInicio = normalizeDateToBrazilianNoon(subDays(today, 7));
        break;
      case "month":
        dataInicio = normalizeDateToBrazilianNoon(subMonths(today, 1));
        break;
      case "quarter":
        dataInicio = normalizeDateToBrazilianNoon(subQuarters(today, 1));
        break;
      case "year":
        dataInicio = normalizeDateToBrazilianNoon(subYears(today, 1));
        break;
      default:
        console.log("📅 Period is custom, keeping current dates");
        return onFiltersChange({ ...filters, periodo: period });
    }

    console.log("📅 New period dates:", { dataInicio, dataFim });
    onFiltersChange({ 
      ...filters, 
      periodo: period,
      dataInicio,
      dataFim
    });
  };

  const handleStartDateChange = (dateString: string) => {
    console.log("📅 Changing start date from input:", dateString);
    
    if (!dateString) {
      onFiltersChange({
        ...filters,
        dataInicio: undefined
      });
      return;
    }

    try {
      const parsedDate = parseBrazilianDate(dateString);
      const normalizedDate = normalizeDateToBrazilianNoon(parsedDate);
      
      console.log("📅 Parsed and normalized start date:", normalizedDate);
      
      onFiltersChange({
        ...filters,
        dataInicio: normalizedDate
      });
    } catch (error) {
      console.error("❌ Error parsing start date:", error);
    }
  };

  const handleEndDateChange = (dateString: string) => {
    console.log("📅 Changing end date from input:", dateString);
    
    if (!dateString) {
      onFiltersChange({
        ...filters,
        dataFim: undefined
      });
      return;
    }

    try {
      const parsedDate = parseBrazilianDate(dateString);
      const normalizedDate = normalizeDateToBrazilianNoon(parsedDate);
      
      console.log("📅 Parsed and normalized end date:", normalizedDate);
      
      // Validar se data fim não é anterior à data início
      if (filters.dataInicio && normalizedDate < filters.dataInicio) {
        console.warn("⚠️ End date is before start date, adjusting...");
        onFiltersChange({
          ...filters,
          dataInicio: normalizedDate,
          dataFim: normalizedDate
        });
      } else {
        onFiltersChange({
          ...filters,
          dataFim: normalizedDate
        });
      }
    } catch (error) {
      console.error("❌ Error parsing end date:", error);
    }
  };

  const handleClearFilters = () => {
    console.log("🔄 Clearing all filters");
    const today = normalizeDateToBrazilianNoon();
    const lastMonth = normalizeDateToBrazilianNoon(subMonths(today, 1));
    
    onFiltersChange({
      periodo: "month",
      dataInicio: lastMonth,
      dataFim: today
    });
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 items-end">
          {/* Período */}
          <div className="w-40">
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              Período
            </label>
            <Select value={filters.periodo} onValueChange={handlePeriodChange}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Última Semana</SelectItem>
                <SelectItem value="month">Último Mês</SelectItem>
                <SelectItem value="quarter">Último Trimestre</SelectItem>
                <SelectItem value="year">Último Ano</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data Início - só aparece se período for personalizado */}
          {filters.periodo === "custom" && (
            <div className="w-36">
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                Data Início
              </label>
              <input
                type="date"
                value={filters.dataInicio ? formatBrazilianDateToString(filters.dataInicio) : ''}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          )}

          {/* Data Fim - só aparece se período for personalizado */}
          {filters.periodo === "custom" && (
            <div className="w-36">
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                Data Fim
              </label>
              <input
                type="date"
                value={filters.dataFim ? formatBrazilianDateToString(filters.dataFim) : ''}
                onChange={(e) => handleEndDateChange(e.target.value)}
                min={filters.dataInicio ? formatBrazilianDateToString(filters.dataInicio) : undefined}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          )}

          {/* Centro de Custo */}
          <div className="w-44">
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              Centro de Custo
            </label>
            <Select 
              value={filters.centroCustoId || "all"} 
              onValueChange={(value) => 
                onFiltersChange({ 
                  ...filters, 
                  centroCustoId: value === "all" ? undefined : value 
                })
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todos os centros" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os centros</SelectItem>
                {centrosCusto?.map((centro) => (
                  <SelectItem key={centro.id} value={centro.id}>
                    {centro.nome_centro_custo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Encarregado */}
          <div className="w-44">
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              Encarregado
            </label>
            <Select 
              value={filters.encarregadoId || "all"} 
              onValueChange={(value) => 
                onFiltersChange({ 
                  ...filters, 
                  encarregadoId: value === "all" ? undefined : value 
                })
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todos os encarregados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os encarregados</SelectItem>
                {encarregados?.map((funcionario) => (
                  <SelectItem key={funcionario.id} value={funcionario.id}>
                    {funcionario.nome_completo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Caminhão */}
          <div className="w-48">
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              Caminhão
            </label>
            <Select 
              value={filters.caminhaoId || "all"} 
              onValueChange={(value) => 
                onFiltersChange({ 
                  ...filters, 
                  caminhaoId: value === "all" ? undefined : value 
                })
              }
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Todos os caminhões" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os caminhões</SelectItem>
                {caminhoes?.map((caminhao) => (
                  <SelectItem key={caminhao.id} value={caminhao.id}>
                    {caminhao.frota} - {caminhao.numero_frota} ({caminhao.placa})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Botão Limpar Filtros */}
          <div className="ml-auto">
            <Button 
              variant="outline" 
              onClick={handleClearFilters}
              className="h-9"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Limpar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
