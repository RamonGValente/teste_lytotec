
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { ResponsiveContainer } from "@/components/layout/ResponsiveContainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SystemFixedNotification from "@/components/system/SystemFixedNotification";

// Dashboard Sections
import RhSection from "@/components/dashboard/RhSection";
import MaquinasSection from "@/components/dashboard/MaquinasSection";
import RequisicaoSection from "@/components/dashboard/RequisicaoSection";

// Define period options for filter
type PeriodFilter = "day" | "week" | "month" | "all";

export default function Dashboard() {
  console.log("Dashboard component rendering");
  const navigate = useNavigate();
  const [period, setPeriod] = useState<PeriodFilter>("day");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    console.log("Dashboard mounted");
    
    // Force a proper initialization when component mounts
    const initialLoadTimer = setTimeout(() => {
      console.log("Dashboard initial load");
      setIsLoaded(true);
      // Force data refresh
      setPeriod(prev => prev);
    }, 100);
    
    // Force a re-render after a short delay to ensure data loads
    const refreshTimer = setTimeout(() => {
      console.log("Dashboard forcing refresh");
      setPeriod(prev => prev);
    }, 300);
    
    return () => {
      clearTimeout(initialLoadTimer);
      clearTimeout(refreshTimer);
      console.log("Dashboard unmounted");
    };
  }, []);

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

  console.log("Dashboard rendering with period:", period, "isLoaded:", isLoaded);

  return (
    <MainLayout>
      <ResponsiveContainer className="pt-6 pb-10">
        <SystemFixedNotification onRefresh={() => window.location.reload()} />
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">Visão geral dos principais indicadores do sistema</p>
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

          {/* RH Module */}
          <RhSection 
            navigateTo={navigateTo} 
            period={period} 
          />

          {/* Máquinas e Equipamentos Module */}
          <MaquinasSection 
            navigateTo={navigateTo} 
            period={period} 
            statusColors={statusColors} 
          />

          {/* Requisições e Logística Module */}
          <RequisicaoSection 
            navigateTo={navigateTo} 
            period={period} 
            statusColors={statusColors}
            getDateRange={getDateRange}
          />
        </div>
      </ResponsiveContainer>
    </MainLayout>
  );
}
