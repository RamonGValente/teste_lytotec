
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Filter, RefreshCw, Calendar } from "lucide-react";
import { MaquinasFilters } from "@/types/maquinas";

interface MaquinasFiltrosProps {
  filters: MaquinasFilters;
  onFilterChange: (filters: Partial<MaquinasFilters>) => void;
  onResetFilters: () => void;
  filtrosAtivos: number;
}

export default function MaquinasFiltros({ 
  filters, 
  onFilterChange, 
  onResetFilters, 
  filtrosAtivos 
}: MaquinasFiltrosProps) {
  const periodos = [
    { value: "30d", label: "Últimos 30 dias" },
    { value: "month", label: "Mês Atual" },
    { value: "prev-month", label: "Mês Anterior" },
    { value: "quarter", label: "Trimestre Atual" },
    { value: "custom", label: "Período Personalizado" }
  ];

  const tiposVeiculo = [
    { value: "Caminhão", label: "Caminhão" },
    { value: "Equipamento", label: "Equipamento" },
    { value: "Prancha", label: "Prancha" },
    { value: "Van", label: "Van" },
    { value: "Ônibus", label: "Ônibus" }
  ];

  const periodosPlanejamento = [
    { value: "hoje", label: "Hoje" },
    { value: "ontem", label: "Ontem" },
    { value: "ultimos-3d", label: "Últimos 3 dias" },
    { value: "ultimos-7d", label: "Últimos 7 dias" },
    { value: "proximos-7d", label: "Próximos 7 dias" },
    { value: "este-mes", label: "Este mês" },
    { value: "custom", label: "Período personalizado" }
  ];

  const handlePeriodoChange = (periodo: string) => {
    const hoje = new Date();
    let periodStart = "";
    let periodEnd = hoje.toISOString().split("T")[0];

    switch (periodo) {
      case "30d":
        const data30d = new Date();
        data30d.setDate(hoje.getDate() - 30);
        periodStart = data30d.toISOString().split("T")[0];
        break;
      case "month":
        periodStart = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split("T")[0];
        break;
      case "prev-month":
        const mesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
        periodStart = mesAnterior.toISOString().split("T")[0];
        const ultimoDiaMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
        periodEnd = ultimoDiaMesAnterior.toISOString().split("T")[0];
        break;
      case "quarter":
        const trimestre = Math.floor(hoje.getMonth() / 3);
        periodStart = new Date(hoje.getFullYear(), trimestre * 3, 1).toISOString().split("T")[0];
        break;
    }

    onFilterChange({ periodStart, periodEnd });
  };

  const handlePeriodoPlanejamentoChange = (periodo: string) => {
    const hoje = new Date();
    let dataInicio = "";
    let dataFim = "";

    switch (periodo) {
      case "hoje":
        dataInicio = dataFim = hoje.toISOString().split("T")[0];
        break;
      case "ontem":
        const ontem = new Date(hoje);
        ontem.setDate(hoje.getDate() - 1);
        dataInicio = dataFim = ontem.toISOString().split("T")[0];
        break;
      case "ultimos-3d":
        const data3d = new Date(hoje);
        data3d.setDate(hoje.getDate() - 3);
        dataInicio = data3d.toISOString().split("T")[0];
        dataFim = hoje.toISOString().split("T")[0];
        break;
      case "ultimos-7d":
        const data7d = new Date(hoje);
        data7d.setDate(hoje.getDate() - 7);
        dataInicio = data7d.toISOString().split("T")[0];
        dataFim = hoje.toISOString().split("T")[0];
        break;
      case "proximos-7d":
        dataInicio = hoje.toISOString().split("T")[0];
        const proximos7d = new Date(hoje);
        proximos7d.setDate(hoje.getDate() + 7);
        dataFim = proximos7d.toISOString().split("T")[0];
        break;
      case "este-mes":
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split("T")[0];
        dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString().split("T")[0];
        break;
    }

    if (dataInicio && dataFim) {
      onFilterChange({ 
        dataInicioPlanejamanento: dataInicio, 
        dataFimPlanejamento: dataFim 
      });
    }
  };

  const handleTipoVeiculoChange = (value: string) => {
    if (value === "_all") {
      onFilterChange({ tipoVeiculo: [] });
    } else {
      onFilterChange({ tipoVeiculo: [value] });
    }
  };

  const handleEmpresaChange = (value: string) => {
    if (value === "_all") {
      onFilterChange({ empresaId: undefined });
    } else {
      onFilterChange({ empresaId: value });
    }
  };

  return (
    <Card className="p-4 mb-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtros</span>
            {filtrosAtivos > 0 && (
              <Badge variant="outline" className="text-xs">
                {filtrosAtivos} filtro{filtrosAtivos > 1 ? 's' : ''} ativo{filtrosAtivos > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onResetFilters}
            className="text-xs h-8 px-3 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
            title="Limpar todos os filtros"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Limpar Filtros
          </Button>
        </div>

        {/* Filtros Unificados */}
        <div className="flex flex-wrap items-end gap-4">
          {/* Período */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Período</label>
            <Select onValueChange={handlePeriodoChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                {periodos.map(periodo => (
                  <SelectItem key={periodo.value} value={periodo.value}>
                    {periodo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tipo de Veículo */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Tipo de Veículo</label>
            <Select 
              value={filters.tipoVeiculo && filters.tipoVeiculo.length > 0 ? filters.tipoVeiculo[0] : "_all"} 
              onValueChange={handleTipoVeiculoChange}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">Todos os tipos</SelectItem>
                {tiposVeiculo.map(tipo => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Empresa */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Empresa</label>
            <Select 
              value={filters.empresaId || "_all"} 
              onValueChange={handleEmpresaChange}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todas as empresas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">Todas as empresas</SelectItem>
                <SelectItem value="lytoranea">LYTORANEA</SelectItem>
                <SelectItem value="construtora-acam">CONSTRUTORA ACAM</SelectItem>
                <SelectItem value="abra">ABRA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Período Rápido (Caminhões) */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Período Rápido</label>
            <Select onValueChange={handlePeriodoPlanejamentoChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Próximos 7 dias" />
              </SelectTrigger>
              <SelectContent>
                {periodosPlanejamento.map(periodo => (
                  <SelectItem key={periodo.value} value={periodo.value}>
                    {periodo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data Início */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Data Início</label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground z-10" />
              <Input
                type="date"
                value={filters.dataInicioPlanejamanento || ""}
                onChange={(e) => onFilterChange({ dataInicioPlanejamanento: e.target.value })}
                className="pl-8 w-48"
              />
            </div>
          </div>

          {/* Data Fim */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Data Fim</label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground z-10" />
              <Input
                type="date"
                value={filters.dataFimPlanejamento || ""}
                onChange={(e) => onFilterChange({ dataFimPlanejamento: e.target.value })}
                className="pl-8 w-48"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
