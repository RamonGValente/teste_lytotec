
import React, { useState, useMemo } from "react";
import { useMaquinasDashboard } from "@/hooks/dashboard/useMaquinasDashboard";
import { MaquinasFilters } from "@/types/maquinas";
import MainLayout from "@/components/layout/MainLayout";
import MaquinasKpiCards from "@/components/dashboard/maquinas/MaquinasKpiCards";
import MaquinasFiltros from "@/components/dashboard/maquinas/MaquinasFilters";
import VisaoGeralFrotaMelhorada from "@/components/dashboard/maquinas/VisaoGeralFrotaMelhorada";
import EquipamentosPorCentroCusto from "@/components/dashboard/maquinas/EquipamentosPorCentroCusto";
import UtilizacaoEficienciaRosca from "@/components/dashboard/maquinas/UtilizacaoEficienciaRosca";
import SaudeFrota from "@/components/dashboard/maquinas/SaudeFrota";
import ResumoCustos from "@/components/dashboard/maquinas/ResumoCustos";
import UpdateEquipmentStatusButton from "@/components/dashboard/maquinas/UpdateEquipmentStatusButton";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardMaquinas() {
  const isMobile = useIsMobile();
  
  // Estado dos filtros
  const [filters, setFilters] = useState<MaquinasFilters>(() => {
    const hoje = new Date();
    const data30d = new Date();
    data30d.setDate(hoje.getDate() - 30);
    
    const proximos7d = new Date();
    proximos7d.setDate(hoje.getDate() + 7);
    
    return {
      periodStart: data30d.toISOString().split("T")[0],
      periodEnd: hoje.toISOString().split("T")[0],
      tipoVeiculo: [],
      empresaId: undefined,
      centroCustoId: undefined,
      ativoEspecifico: undefined,
      dataInicioPlanejamanento: hoje.toISOString().split("T")[0],
      dataFimPlanejamento: proximos7d.toISOString().split("T")[0]
    };
  });

  // Buscar dados do dashboard
  const {
    kpisQuery,
    tipoVeiculoQuery,
    statusOperacionalQuery,
    idadeFrotaQuery,
    equipamentosPorCentroCustoQuery,
    centroCustoQuery,
    chamadosQuery,
    tipoFalhaQuery,
    custoLocacaoQuery,
    caminhoesProgramadosQuery,
    distribuicaoCentroCustoQuery
  } = useMaquinasDashboard(filters);

  const handleFilterChange = (newFilters: Partial<MaquinasFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    const hoje = new Date();
    const data30d = new Date();
    data30d.setDate(hoje.getDate() - 30);
    
    const proximos7d = new Date();
    proximos7d.setDate(hoje.getDate() + 7);
    
    setFilters({
      periodStart: data30d.toISOString().split("T")[0],
      periodEnd: hoje.toISOString().split("T")[0],
      tipoVeiculo: [],
      empresaId: undefined,
      centroCustoId: undefined,
      ativoEspecifico: undefined,
      dataInicioPlanejamanento: hoje.toISOString().split("T")[0],
      dataFimPlanejamento: proximos7d.toISOString().split("T")[0]
    });
  };

  const handleStatusUpdated = () => {
    // Refetch KPIs e outros dados após atualização
    kpisQuery.refetch();
    statusOperacionalQuery.refetch();
    distribuicaoCentroCustoQuery.refetch();
  };

  const filtrosAtivos = useMemo(() => {
    let count = 0;
    if (filters.tipoVeiculo && filters.tipoVeiculo.length > 0) count++;
    if (filters.empresaId) count++;
    if (filters.centroCustoId) count++;
    if (filters.ativoEspecifico) count++;
    
    const hoje = new Date().toISOString().split("T")[0];
    const proximos7d = new Date();
    proximos7d.setDate(new Date().getDate() + 7);
    const defaultDataFim = proximos7d.toISOString().split("T")[0];
    
    if (filters.dataInicioPlanejamanento !== hoje || filters.dataFimPlanejamento !== defaultDataFim) {
      count++;
    }
    
    return count;
  }, [filters]);

  const isLoading = kpisQuery.isLoading || 
                   tipoVeiculoQuery.isLoading || 
                   statusOperacionalQuery.isLoading;

  // Layout mobile com tabs
  if (isMobile) {
    return (
      <MainLayout>
        <div className="flex flex-col gap-4 p-2">
          {/* Header compacto com botão de atualização */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold">Gestão de Máquinas</h1>
                <p className="text-sm text-muted-foreground">
                  Acompanhamento da frota
                </p>
              </div>
              <UpdateEquipmentStatusButton onStatusUpdated={handleStatusUpdated} />
            </div>
          </div>

          {/* Filtros compactos */}
          <MaquinasFiltros
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={resetFilters}
            filtrosAtivos={filtrosAtivos}
          />

          {/* KPIs sempre visíveis */}
          <MaquinasKpiCards
            kpis={kpisQuery.data || {
              totalAtivos: 0,
              ativosOperando: 0,
              ativosDisponiveis: 0,
              ativosManutencao: 0,
              chamadosAbertos: 0,
              tempoMedioReparo: 0
            }}
            isLoading={isLoading}
          />

          {/* Tabs para organizar conteúdo no mobile */}
          <Tabs defaultValue="visao-geral" className="w-full">
            <TabsList className="grid w-full grid-cols-4 text-xs">
              <TabsTrigger value="visao-geral" className="text-xs">Frota</TabsTrigger>
              <TabsTrigger value="custos" className="text-xs">Custos</TabsTrigger>
              <TabsTrigger value="utilizacao" className="text-xs">Uso</TabsTrigger>
              <TabsTrigger value="saude" className="text-xs">Saúde</TabsTrigger>
            </TabsList>
            
            <TabsContent value="visao-geral" className="mt-4">
              <div className="space-y-4">
                <VisaoGeralFrotaMelhorada
                  statusOperacional={statusOperacionalQuery.data || []}
                  idadeFrota={idadeFrotaQuery.data || []}
                  centroCustoData={centroCustoQuery.data || []}
                  distribuicaoCentroCusto={distribuicaoCentroCustoQuery.data || []}
                  isLoading={isLoading || distribuicaoCentroCustoQuery.isLoading}
                />
                
                <EquipamentosPorCentroCusto
                  equipamentosData={equipamentosPorCentroCustoQuery.data || []}
                  isLoading={equipamentosPorCentroCustoQuery.isLoading}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="custos" className="mt-4">
              <ResumoCustos
                custoData={custoLocacaoQuery.data || {
                  valorTotal: 0,
                  totalDescontos: 0,
                  valorLiquido: 0,
                  diasManutencao: 0,
                  horasManutencao: 0
                }}
                caminhoesProgramados={caminhoesProgramadosQuery.data || []}
                isLoading={custoLocacaoQuery.isLoading || caminhoesProgramadosQuery.isLoading}
              />
            </TabsContent>
            
            <TabsContent value="utilizacao" className="mt-4">
              <UtilizacaoEficienciaRosca
                centroCustoData={centroCustoQuery.data || []}
                isLoading={centroCustoQuery.isLoading}
              />
            </TabsContent>
            
            <TabsContent value="saude" className="mt-4">
              <SaudeFrota
                chamadosData={chamadosQuery.data || []}
                tipoFalhaData={tipoFalhaQuery.data || []}
                isLoading={chamadosQuery.isLoading || tipoFalhaQuery.isLoading}
              />
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    );
  }

  // Layout desktop (mantém o original)
  return (
    <MainLayout>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard de Gestão de Máquinas</h1>
            <p className="text-muted-foreground">
              Acompanhamento completo da frota de caminhões e equipamentos
            </p>
          </div>
          
          {/* Botão de atualização de status */}
          <UpdateEquipmentStatusButton onStatusUpdated={handleStatusUpdated} />
        </div>

        <MaquinasFiltros
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={resetFilters}
          filtrosAtivos={filtrosAtivos}
        />

        <MaquinasKpiCards
          kpis={kpisQuery.data || {
            totalAtivos: 0,
            ativosOperando: 0,
            ativosDisponiveis: 0,
            ativosManutencao: 0,
            chamadosAbertos: 0,
            tempoMedioReparo: 0
          }}
          isLoading={isLoading}
        />

        <ResumoCustos
          custoData={custoLocacaoQuery.data || {
            valorTotal: 0,
            totalDescontos: 0,
            valorLiquido: 0,
            diasManutencao: 0,
            horasManutencao: 0
          }}
          caminhoesProgramados={caminhoesProgramadosQuery.data || []}
          isLoading={custoLocacaoQuery.isLoading || caminhoesProgramadosQuery.isLoading}
        />

        <EquipamentosPorCentroCusto
          equipamentosData={equipamentosPorCentroCustoQuery.data || []}
          isLoading={equipamentosPorCentroCustoQuery.isLoading}
        />

        <VisaoGeralFrotaMelhorada
          statusOperacional={statusOperacionalQuery.data || []}
          idadeFrota={idadeFrotaQuery.data || []}
          centroCustoData={centroCustoQuery.data || []}
          distribuicaoCentroCusto={distribuicaoCentroCustoQuery.data || []}
          isLoading={isLoading || distribuicaoCentroCustoQuery.isLoading}
        />

        <UtilizacaoEficienciaRosca
          centroCustoData={centroCustoQuery.data || []}
          isLoading={centroCustoQuery.isLoading}
        />

        <SaudeFrota
          chamadosData={chamadosQuery.data || []}
          tipoFalhaData={tipoFalhaQuery.data || []}
          isLoading={chamadosQuery.isLoading || tipoFalhaQuery.isLoading}
        />
      </div>
    </MainLayout>
  );
}
