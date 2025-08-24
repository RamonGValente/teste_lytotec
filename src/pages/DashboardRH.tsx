import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { ResponsiveContainer } from "@/components/layout/ResponsiveContainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePermissionGuard } from "@/hooks/usePermissionGuard";
import { useToast } from "@/hooks/use-toast";

// Dashboard Sections
import RhSection from "@/components/dashboard/RhSection";
import MaquinasSection from "@/components/dashboard/MaquinasSection";
import RequisicaoSection from "@/components/dashboard/RequisicaoSection";
import RhDashboardComplete from "@/components/dashboard/rh/RhDashboardComplete";

// Define period options for filter
type PeriodFilter = "day" | "week" | "month" | "all";

export default function DashboardRH() {
  console.log("DashboardRH component rendering");
  const navigate = useNavigate();
  const [period, setPeriod] = useState<PeriodFilter>("day");
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();
  
  // Use the permission guard with the dashboard RH permission
  const { canAccess, isLoading } = usePermissionGuard({
    requiredPermission: "dashboard_rh_view"
  });

  useEffect(() => {
    console.log("DashboardRH mounted");
    console.log("Auth status:", { loading: isLoading, canAccess });
    
    // Force a proper initialization when component mounts
    const initialLoadTimer = setTimeout(() => {
      console.log("DashboardRH initial load");
      setIsLoaded(true);
      // Force data refresh
      setPeriod(prev => prev);
    }, 100);
    
    // Force a re-render after a short delay to ensure data loads
    const refreshTimer = setTimeout(() => {
      console.log("DashboardRH forcing refresh");
      setPeriod(prev => prev);
    }, 300);
    
    return () => {
      clearTimeout(initialLoadTimer);
      clearTimeout(refreshTimer);
      console.log("DashboardRH unmounted");
    };
  }, [isLoading, canAccess]);

  // Function to calculate date range based on period filter
  const getDateRange = (period: PeriodFilter) => {
    const today = new Date();
    const startDate = new Date();
    
    switch (period) {
      case "day":
        startDate.setHours(0, 0, 0, 0);
        break;
      case "week":
        startDate.setDate(today.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(today.getMonth() - 1);
        break;
      case "all":
        startDate.setFullYear(2000); // A long time ago (effectively "all")
        break;
    }
    
    return {
      start: startDate.toISOString(),
      end: today.toISOString(),
    };
  };

  // Chart colors for consistent display
  const COLORS = {
    primary: '#6E31AB',
    secondary: '#8B5CF6', 
    tertiary: '#9B87F5',
    quarternary: '#D6BCFA',
    success: '#10B981',
    warning: '#FBBF24',
    error: '#EF4444',
    info: '#3B82F6',
    gray: '#8E9196',
    low: '#3B82F6',
    medium: '#FBBF24',
    high: '#F97316',
    critical: '#EF4444',
    inactive: '#8E9196'
  };

  const statusColors = {
    'Pendente': COLORS.info,
    'Enviada': COLORS.warning,
    'Entregue': COLORS.success,
    'Cancelada': COLORS.error,
    'Operando': COLORS.success,
    'Em Manutenção': COLORS.warning,
    'Outros': COLORS.gray,
    // Vehicle types
    'Caminhão': COLORS.primary,
    'Equipamento': COLORS.secondary,
    'Prancha': COLORS.tertiary,
    'Van': COLORS.quarternary,
    'Ônibus': COLORS.info,
    'Caminhões': COLORS.primary,
    'Equipamentos': COLORS.secondary,
    // Priorities
    'Emergencial': COLORS.critical,
    'Alta': COLORS.high,
    'Média': COLORS.medium,
    'Baixa': COLORS.low,
    // Status
    'Abertas': COLORS.info,
    'Em Andamento': COLORS.warning,
    'Concluídas': COLORS.success,
    'Canceladas': COLORS.error
  };

  // Navigation helper
  const navigateTo = (path: string) => {
    navigate(path);
  };

  console.log("DashboardRH rendering with period:", period, "isLoaded:", isLoaded);

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
  
  // If not authorized, show unauthorized message instead of redirecting
  // This ensures we don't get stuck in a redirect loop
  if (!canAccess) {
    return (
      <MainLayout>
        <ResponsiveContainer className="pt-6 pb-10">
          <div className="flex flex-col justify-center items-center h-[70vh] gap-4">
            <h1 className="text-2xl text-destructive font-bold">Acesso Negado</h1>
            <p className="text-lg text-muted-foreground">Você não tem permissão para acessar esta página.</p>
            <button 
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
              onClick={() => navigate("/dashboard")}
            >
              Voltar para Dashboard
            </button>
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
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard RH</h1>
              <p className="text-muted-foreground">Visão geral dos indicadores de Recursos Humanos</p>
            </div>
            
            {/* Period Selector */}
            <Tabs defaultValue="day" value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)} className="w-full sm:w-auto">
              <TabsList className="grid grid-cols-4 w-full sm:w-[400px]">
                <TabsTrigger value="day">Hoje</TabsTrigger>
                <TabsTrigger value="week">Semana</TabsTrigger>
                <TabsTrigger value="month">Mês</TabsTrigger>
                <TabsTrigger value="all">Todos</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* DASHBOARD RH COMPLETO */}
          <RhDashboardComplete />

          {/* (Comentado: se quiser manter painéis parciais, pode) */}
          {/* 
          <RhSection 
            navigateTo={navigateTo} 
            period={period} 
          />

          <MaquinasSection 
            navigateTo={navigateTo} 
            period={period} 
            statusColors={statusColors} 
          />

          <RequisicaoSection 
            navigateTo={navigateTo} 
            period={period} 
            statusColors={statusColors}
            getDateRange={getDateRange}
          />
          */}
        </div>
      </ResponsiveContainer>
    </MainLayout>
  );
}
