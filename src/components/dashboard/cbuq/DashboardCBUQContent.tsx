
import React from "react";
import { CBUQFilters } from "@/pages/DashboardRequisicoes";
import CBUQKpiCards from "./CBUQKpiCards";
import CBUQOperationalIndicators from "./CBUQOperationalIndicators";
import CBUQCharts from "./CBUQCharts";

interface DashboardCBUQContentProps {
  filters: CBUQFilters;
}

export default function DashboardCBUQContent({ filters }: DashboardCBUQContentProps) {
  return (
    <div className="space-y-6">
      {/* KPIs Principais */}
      <CBUQKpiCards filters={filters} />
      
      {/* Indicadores Operacionais */}
      <CBUQOperationalIndicators filters={filters} />
      
      {/* Gráficos e Tabelas */}
      <CBUQCharts filters={filters} />
    </div>
  );
}
