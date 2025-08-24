import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { ResponsiveContainer } from "@/components/layout/ResponsiveContainer";
import { usePermissionGuard } from "@/hooks/usePermissionGuard";
import DashboardCBUQContent from "@/components/dashboard/cbuq/DashboardCBUQContent";
import DashboardCBUQFilters from "@/components/dashboard/cbuq/DashboardCBUQFilters";

// Define period options for filter
export type PeriodFilter = "today" | "week" | "month" | "quarter" | "year" | "custom";

export interface CBUQFilters {
  periodo: PeriodFilter;
  dataInicio?: Date;
  dataFim?: Date;
  centroCustoId?: string;
  encarregadoId?: string;
  caminhaoId?: string;
}

export default function DashboardRequisicoes() {
  const [filters, setFilters] = useState<CBUQFilters>({
    periodo: "month"
  });
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Use the permission guard with the dashboard logistica permission
  const { canAccess, isLoading } = usePermissionGuard({
    requiredPermission: "dashboard_logistica_view"
  });

  useEffect(() => {
    console.log("DashboardRequisicoes mounted");
    
    const initialLoadTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => {
      clearTimeout(initialLoadTimer);
    };
  }, []);

  // If auth is still loading, render a loading state
  if (isLoading) {
    return (
      <MainLayout>
        <ResponsiveContainer className="pt-6 pb-10">
          <div className="flex justify-center items-center h-[70vh]">
            <p className="text-lg text-muted-foreground">Carregando...</p>
          </div>
        </ResponsiveContainer>
      </MainLayout>
    );
  }
  
  // If not authorized, show unauthorized message
  if (!canAccess) {
    return (
      <MainLayout>
        <ResponsiveContainer className="pt-6 pb-10">
          <div className="flex flex-col justify-center items-center h-[70vh] gap-4">
            <h1 className="text-2xl text-destructive font-bold">Acesso Negado</h1>
            <p className="text-lg text-muted-foreground">Você não tem permissão para acessar esta página.</p>
          </div>
        </ResponsiveContainer>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <ResponsiveContainer className="pt-6 pb-10">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard CBUQ</h1>
              <p className="text-muted-foreground">Monitoramento de aplicações de CBUQ e logística</p>
            </div>
          </div>

          {/* Filtros Horizontais */}
          <DashboardCBUQFilters 
            filters={filters}
            onFiltersChange={setFilters}
          />

          {/* Conteúdo Principal */}
          <DashboardCBUQContent filters={filters} />
        </div>
      </ResponsiveContainer>
    </MainLayout>
  );
}
