
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CBUQFilters } from "@/pages/DashboardRequisicoes";
import { Truck, Package, TrendingUp, Activity, Square, Weight, Ruler, CheckCircle } from "lucide-react";
import { format } from "date-fns";

interface CBUQKpiCardsProps {
  filters: CBUQFilters;
}

export default function CBUQKpiCards({ filters }: CBUQKpiCardsProps) {
  console.log("🔍 CBUQKpiCards - Filters aplicados:", filters);

  // Total de entregas programadas (corrigido)
  const { data: totalEntregas } = useQuery({
    queryKey: ['total-entregas-cbuq', filters],
    queryFn: async () => {
      console.log("📊 Buscando total de entregas programadas...");
      
      let query = supabase
        .from('bd_lista_programacao_entrega')
        .select(`
          id,
          status,
          caminhao_id,
          data_entrega,
          requisicao:requisicao_id!inner (
            centro_custo_id
          )
        `);

      if (filters.dataInicio) {
        query = query.gte('data_entrega', format(filters.dataInicio, 'yyyy-MM-dd'));
      }
      if (filters.dataFim) {
        query = query.lte('data_entrega', format(filters.dataFim, 'yyyy-MM-dd'));
      }

      const { data, error } = await query;
      if (error) {
        console.error("❌ Erro ao buscar entregas:", error);
        throw error;
      }

      console.log("📋 Entregas encontradas:", data?.length || 0);

      // Aplicar filtros
      let filteredData = data || [];

      if (filters.centroCustoId) {
        filteredData = filteredData.filter(item => {
          const requisicao = Array.isArray(item.requisicao) ? item.requisicao[0] : item.requisicao;
          return requisicao?.centro_custo_id === filters.centroCustoId;
        });
      }

      if (filters.caminhaoId) {
        filteredData = filteredData.filter(item => 
          item.caminhao_id === filters.caminhaoId
        );
      }

      console.log("📋 Entregas após filtros:", filteredData.length);
      return filteredData.length;
    }
  });

  // KPIs principais baseados em bd_registro_aplicacao_detalhes (CORRIGIDO)
  const { data: kpiData, isLoading } = useQuery({
    queryKey: ['cbuq-kpis-detalhes', filters],
    queryFn: async () => {
      console.log("🔍 Buscando KPIs dos detalhes de aplicação...");
      
      let query = supabase
        .from('bd_registro_aplicacao_detalhes')
        .select(`
          id,
          tonelada_aplicada,
          area_aplicada,
          espessura_aplicada,
          data_aplicacao,
          registro_aplicacao_id,
          lista_entrega_id,
          lista_entrega:lista_entrega_id!inner (
            id,
            status,
            caminhao_id,
            data_entrega,
            requisicao:requisicao_id!inner (
              centro_custo_id
            )
          )
        `)
        .not('tonelada_aplicada', 'is', null)
        .not('area_aplicada', 'is', null);

      // Aplicar filtros de data
      if (filters.dataInicio) {
        query = query.gte('data_aplicacao', format(filters.dataInicio, 'yyyy-MM-dd'));
      }
      if (filters.dataFim) {
        query = query.lte('data_aplicacao', format(filters.dataFim, 'yyyy-MM-dd'));
      }

      const { data, error } = await query;
      if (error) {
        console.error("❌ Erro ao buscar detalhes de aplicação:", error);
        throw error;
      }

      console.log("📊 Detalhes de aplicação encontrados:", data?.length || 0);

      // Filtrar dados baseado nos filtros
      let filteredData = data || [];

      if (filters.centroCustoId) {
        filteredData = filteredData.filter(item => {
          const listaEntrega = Array.isArray(item.lista_entrega) ? item.lista_entrega[0] : item.lista_entrega;
          if (!listaEntrega?.requisicao) return false;
          
          const requisicao = Array.isArray(listaEntrega.requisicao) ? listaEntrega.requisicao[0] : listaEntrega.requisicao;
          return requisicao?.centro_custo_id === filters.centroCustoId;
        });
      }

      if (filters.caminhaoId) {
        filteredData = filteredData.filter(item => {
          const listaEntrega = Array.isArray(item.lista_entrega) ? item.lista_entrega[0] : item.lista_entrega;
          return listaEntrega?.caminhao_id === filters.caminhaoId;
        });
      }

      console.log("📊 Detalhes após filtros:", filteredData.length);

      // Calcular KPIs corretamente
      const areaTotal = filteredData.reduce((sum, item) => {
        return sum + (item.area_aplicada || 0);
      }, 0);

      const massaTotal = filteredData.reduce((sum, item) => {
        return sum + (item.tonelada_aplicada || 0);
      }, 0);

      // CORREÇÃO DA ESPESSURA MÉDIA - valor já em centímetros
      let espessuraMedia = 0;
      let aplicacoesComEspessura = 0;

      if (filteredData.length > 0) {
        // Primeira tentativa: usar espessura_aplicada (já em centímetros)
        const espessurasValidas = filteredData.filter(item => item.espessura_aplicada && item.espessura_aplicada > 0);
        
        if (espessurasValidas.length > 0) {
          console.log("📏 Usando espessura_aplicada salva no banco (já em cm)");
          const somaEspessuras = espessurasValidas.reduce((sum, item) => {
            const espessuraCm = (item.espessura_aplicada || 0); // Já está em centímetros
            console.log(`📏 Espessura: ${espessuraCm}cm`);
            return sum + espessuraCm;
          }, 0);
          espessuraMedia = somaEspessuras / espessurasValidas.length;
          aplicacoesComEspessura = espessurasValidas.length;
        } else {
          // Segunda tentativa: calcular usando fórmula (tonelada / área / 2.4) * 100
          console.log("📏 Calculando espessura usando fórmula (tonelada / área / 2.4) * 100");
          const aplicacoesCalculaveis = filteredData.filter(item => 
            (item.tonelada_aplicada || 0) > 0 && (item.area_aplicada || 0) > 0
          );
          
          if (aplicacoesCalculaveis.length > 0) {
            const somaEspessuras = aplicacoesCalculaveis.reduce((sum, item) => {
              const espessuraCalculada = ((item.tonelada_aplicada || 0) / (item.area_aplicada || 0) / 2.4) * 100;
              console.log(`📏 Calculada: ${item.tonelada_aplicada}t / ${item.area_aplicada}m² / 2.4 = ${espessuraCalculada.toFixed(2)}cm`);
              return sum + espessuraCalculada;
            }, 0);
            espessuraMedia = somaEspessuras / aplicacoesCalculaveis.length;
            aplicacoesComEspessura = aplicacoesCalculaveis.length;
          }
        }
      }

      const totalAplicacoes = filteredData.length;

      const resultado = {
        areaTotal,
        massaTotal,
        espessuraMedia,
        totalAplicacoes,
        aplicacoesComEspessura
      };

      console.log("📈 KPIs calculados:", resultado);
      console.log(`📏 Espessura média final: ${espessuraMedia.toFixed(1)}cm (baseado em ${aplicacoesComEspessura} aplicações)`);
      
      return resultado;
    }
  });

  const formatNumber = (num: number, decimals: number = 2) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-100 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Total de Entregas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total de Entregas
          </CardTitle>
          <Truck className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {totalEntregas || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Entregas programadas
          </p>
        </CardContent>
      </Card>

      {/* Área Total Executada */}
      <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Área Executada
          </CardTitle>
          <Square className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {formatNumber(kpiData?.areaTotal || 0, 0)} m²
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400">
            Área total aplicada
          </p>
        </CardContent>
      </Card>

      {/* Volume de Massa */}
      <Card className="bg-cyan-50 border-cyan-200 dark:bg-cyan-950 dark:border-cyan-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
            Volume de Massa
          </CardTitle>
          <Weight className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">
            {formatNumber(kpiData?.massaTotal || 0, 1)} t
          </div>
          <p className="text-xs text-cyan-600 dark:text-cyan-400">
            Massa aplicada total
          </p>
        </CardContent>
      </Card>

      {/* Espessura Média CORRIGIDA */}
      <Card className="bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">
            Espessura Média
          </CardTitle>
          <Ruler className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {formatNumber(kpiData?.espessuraMedia || 0, 1)} cm
          </div>
          <p className="text-xs text-purple-600 dark:text-purple-400">
            Baseado em {kpiData?.aplicacoesComEspessura || 0} aplicações
          </p>
        </CardContent>
      </Card>

      {/* Total de Aplicações */}
      <Card className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
            Total de Aplicações
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900 dark:text-green-100">
            {kpiData?.totalAplicacoes || 0}
          </div>
          <p className="text-xs text-green-600 dark:text-green-400">
            Aplicações realizadas
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
