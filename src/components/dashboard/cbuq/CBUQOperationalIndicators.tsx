
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CBUQFilters } from "@/pages/DashboardRequisicoes";
import { ClipboardList, CheckCircle, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface CBUQOperationalIndicatorsProps {
  filters: CBUQFilters;
}

export default function CBUQOperationalIndicators({ filters }: CBUQOperationalIndicatorsProps) {
  console.log("🔍 CBUQOperationalIndicators - Filters:", filters);

  // Requisições do dia (corrigido)
  const { data: requisicoesHoje } = useQuery({
    queryKey: ['requisicoes-hoje-cbuq', filters],
    queryFn: async () => {
      const hoje = format(new Date(), 'yyyy-MM-dd');
      console.log("📅 Buscando requisições para hoje:", hoje);
      
      let query = supabase
        .from('bd_lista_programacao_entrega')
        .select(`
          id, 
          status,
          requisicao:requisicao_id!inner(centro_custo_id)
        `)
        .eq('data_entrega', hoje);

      const { data, error } = await query;
      if (error) {
        console.error("❌ Erro ao buscar requisições hoje:", error);
        throw error;
      }
      
      console.log("📋 Requisições encontradas para hoje:", data?.length || 0);

      // Aplicar filtro de centro de custo se fornecido
      let filteredData = data || [];
      if (filters.centroCustoId) {
        filteredData = filteredData.filter(item => {
          const requisicao = Array.isArray(item.requisicao) ? item.requisicao[0] : item.requisicao;
          return requisicao?.centro_custo_id === filters.centroCustoId;
        });
      }
      
      console.log("📋 Requisições após filtros:", filteredData.length);
      return filteredData.length;
    }
  });

  // Aplicações finalizadas hoje (corrigido)
  const { data: aplicacoesHoje } = useQuery({
    queryKey: ['aplicacoes-hoje-cbuq', filters],
    queryFn: async () => {
      const hoje = format(new Date(), 'yyyy-MM-dd');
      console.log("📅 Buscando aplicações para hoje:", hoje);
      
      let query = supabase
        .from('bd_registro_aplicacao_detalhes')
        .select(`
          id,
          lista_entrega:lista_entrega_id!inner (
            id,
            status,
            caminhao_id,
            requisicao:requisicao_id!inner (centro_custo_id)
          )
        `)
        .eq('data_aplicacao', hoje);

      const { data, error } = await query;
      if (error) {
        console.error("❌ Erro ao buscar aplicações hoje:", error);
        throw error;
      }

      console.log("📊 Aplicações encontradas para hoje:", data?.length || 0);

      // Aplicar filtros
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

      console.log("📊 Aplicações após filtros:", filteredData.length);
      return filteredData.length;
    }
  });

  // Massa solicitada vs aplicada (corrigido)
  const { data: massaComparacao } = useQuery({
    queryKey: ['massa-comparacao-cbuq', filters],
    queryFn: async () => {
      console.log("⚖️ Calculando comparação de massa...");

      // Buscar massa solicitada
      let querySolicitada = supabase
        .from('bd_lista_programacao_entrega')
        .select(`
          quantidade_massa,
          requisicao:requisicao_id!inner (centro_custo_id)
        `);

      if (filters.dataInicio) {
        querySolicitada = querySolicitada.gte('data_entrega', format(filters.dataInicio, 'yyyy-MM-dd'));
      }
      if (filters.dataFim) {
        querySolicitada = querySolicitada.lte('data_entrega', format(filters.dataFim, 'yyyy-MM-dd'));
      }

      const { data: solicitadaData, error: solicitadaError } = await querySolicitada;
      if (solicitadaError) {
        console.error("❌ Erro ao buscar massa solicitada:", solicitadaError);
        throw solicitadaError;
      }

      // Buscar massa aplicada dos detalhes
      let queryAplicada = supabase
        .from('bd_registro_aplicacao_detalhes')
        .select(`
          tonelada_aplicada,
          lista_entrega:lista_entrega_id!inner (
            id,
            status,
            caminhao_id,
            requisicao:requisicao_id!inner (centro_custo_id)
          )
        `)
        .not('tonelada_aplicada', 'is', null);

      if (filters.dataInicio) {
        queryAplicada = queryAplicada.gte('data_aplicacao', format(filters.dataInicio, 'yyyy-MM-dd'));
      }
      if (filters.dataFim) {
        queryAplicada = queryAplicada.lte('data_aplicacao', format(filters.dataFim, 'yyyy-MM-dd'));
      }

      const { data: aplicadaData, error: aplicadaError } = await queryAplicada;
      if (aplicadaError) {
        console.error("❌ Erro ao buscar massa aplicada:", aplicadaError);
        throw aplicadaError;
      }

      console.log("📊 Dados massa solicitada:", solicitadaData?.length || 0);
      console.log("📊 Dados massa aplicada:", aplicadaData?.length || 0);

      // Filtrar dados
      let solicitadaFiltrada = solicitadaData || [];
      let aplicadaFiltrada = aplicadaData || [];

      if (filters.centroCustoId) {
        solicitadaFiltrada = solicitadaFiltrada.filter(item => {
          const requisicao = Array.isArray(item.requisicao) ? item.requisicao[0] : item.requisicao;
          return requisicao?.centro_custo_id === filters.centroCustoId;
        });
        
        aplicadaFiltrada = aplicadaFiltrada.filter(item => {
          const listaEntrega = Array.isArray(item.lista_entrega) ? item.lista_entrega[0] : item.lista_entrega;
          if (!listaEntrega?.requisicao) return false;
          
          const requisicao = Array.isArray(listaEntrega.requisicao) ? listaEntrega.requisicao[0] : listaEntrega.requisicao;
          return requisicao?.centro_custo_id === filters.centroCustoId;
        });
      }

      if (filters.caminhaoId) {
        aplicadaFiltrada = aplicadaFiltrada.filter(item => {
          const listaEntrega = Array.isArray(item.lista_entrega) ? item.lista_entrega[0] : item.lista_entrega;
          return listaEntrega?.caminhao_id === filters.caminhaoId;
        });
      }

      const massaSolicitada = solicitadaFiltrada.reduce((sum, item) => 
        sum + (item.quantidade_massa || 0), 0
      );

      const massaAplicada = aplicadaFiltrada.reduce((sum, item) => 
        sum + (item.tonelada_aplicada || 0), 0
      );

      const percentual = massaSolicitada > 0 ? (massaAplicada / massaSolicitada) * 100 : 0;

      const resultado = {
        massaSolicitada,
        massaAplicada,
        percentual
      };

      console.log("⚖️ Comparação calculada:", resultado);
      return resultado;
    }
  });

  const formatNumber = (num: number, decimals: number = 1) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Requisições do Dia */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Requisições do Dia
          </CardTitle>
          <ClipboardList className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {requisicoesHoje || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Entregas programadas hoje
          </p>
        </CardContent>
      </Card>

      {/* Aplicações Finalizadas Hoje */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Aplicações Finalizadas Hoje
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900 dark:text-green-100">
            {aplicacoesHoje || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Aplicações realizadas hoje
          </p>
        </CardContent>
      </Card>

      {/* Massa Solicitada vs Aplicada */}
      <Card className="md:col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Massa Solicitada vs Aplicada
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Aplicada: {formatNumber(massaComparacao?.massaAplicada || 0)}t</span>
            <span>Solicitada: {formatNumber(massaComparacao?.massaSolicitada || 0)}t</span>
          </div>
          <Progress 
            value={Math.min(massaComparacao?.percentual || 0, 100)} 
            className="h-2"
          />
          <p className="text-xs text-muted-foreground">
            {formatNumber(massaComparacao?.percentual || 0, 1)}% do solicitado foi aplicado
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
