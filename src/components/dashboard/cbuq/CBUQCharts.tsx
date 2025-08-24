
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CBUQFilters } from "@/pages/DashboardRequisicoes";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { format } from "date-fns";

interface CBUQChartsProps {
  filters: CBUQFilters;
}

export default function CBUQCharts({ filters }: CBUQChartsProps) {
  console.log("📊 CBUQCharts - Filters:", filters);

  // Gráfico de Performance por Caminhão (corrigido)
  const { data: performanceCaminhoes } = useQuery({
    queryKey: ['performance-caminhoes-cbuq', filters],
    queryFn: async () => {
      console.log("🚛 Buscando performance por caminhão...");
      
      let query = supabase
        .from('bd_lista_programacao_entrega')
        .select(`
          id,
          status,
          caminhao_id,
          data_entrega,
          caminhao:caminhao_id!inner (
            frota,
            numero_frota,
            placa
          ),
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
        console.error("❌ Erro ao buscar performance caminhões:", error);
        throw error;
      }

      console.log("🚛 Entregas para performance:", data?.length || 0);

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

      // Agrupar por caminhão
      const grouped = filteredData.reduce((acc, item) => {
        const caminhaoId = item.caminhao_id;
        const caminhaoInfo = Array.isArray(item.caminhao) ? item.caminhao[0] : item.caminhao;
        
        if (!acc[caminhaoId]) {
          acc[caminhaoId] = {
            name: caminhaoInfo?.frota && caminhaoInfo?.numero_frota
              ? `${caminhaoInfo.frota} - ${caminhaoInfo.numero_frota}` 
              : 'Desconhecido',
            Entregue: 0,
            Enviada: 0,
            Ativa: 0,
            Cancelada: 0,
            total: 0
          };
        }
        
        const status = item.status || 'Ativa';
        acc[caminhaoId][status] = (acc[caminhaoId][status] || 0) + 1;
        acc[caminhaoId].total++;
        
        return acc;
      }, {} as any);

      const resultado = Object.values(grouped);
      console.log("🚛 Performance agrupada:", resultado);
      return resultado;
    }
  });

  // Gráfico de Distribuição por Encarregado (corrigido)
  const { data: distribuicaoEncarregados } = useQuery({
    queryKey: ['distribuicao-encarregados-cbuq', filters],
    queryFn: async () => {
      console.log("👥 Buscando distribuição por encarregado...");
      
      let query = supabase
        .from('bd_lista_programacao_entrega')
        .select(`
          id,
          status,
          data_entrega,
          equipe:equipe_id!inner (
            id,
            nome_equipe,
            encarregado:encarregado_id (
              id,
              nome_completo
            )
          ),
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
        console.error("❌ Erro ao buscar distribuição encarregados:", error);
        throw error;
      }

      console.log("👥 Entregas para encarregados:", data?.length || 0);

      // Aplicar filtros
      let filteredData = data || [];

      if (filters.centroCustoId) {
        filteredData = filteredData.filter(item => {
          const requisicao = Array.isArray(item.requisicao) ? item.requisicao[0] : item.requisicao;
          return requisicao?.centro_custo_id === filters.centroCustoId;
        });
      }

      if (filters.encarregadoId) {
        filteredData = filteredData.filter(item => {
          const equipe = Array.isArray(item.equipe) ? item.equipe[0] : item.equipe;
          if (!equipe?.encarregado) return false;
          
          const encarregado = Array.isArray(equipe.encarregado) ? equipe.encarregado[0] : equipe.encarregado;
          return encarregado?.id === filters.encarregadoId;
        });
      }

      // Agrupar por encarregado
      const grouped = filteredData.reduce((acc, item) => {
        const equipe = Array.isArray(item.equipe) ? item.equipe[0] : item.equipe;
        let encarregadoId = 'sem-encarregado';
        let encarregadoNome = 'Sem Encarregado';
        
        if (equipe?.encarregado) {
          const encarregado = Array.isArray(equipe.encarregado) ? equipe.encarregado[0] : equipe.encarregado;
          if (encarregado?.id && encarregado?.nome_completo) {
            encarregadoId = encarregado.id;
            encarregadoNome = encarregado.nome_completo;
          }
        }
        
        if (!acc[encarregadoId]) {
          acc[encarregadoId] = {
            name: encarregadoNome,
            value: 0
          };
        }
        
        acc[encarregadoId].value++;
        
        return acc;
      }, {} as any);

      const resultado = Object.values(grouped);
      console.log("👥 Distribuição agrupada:", resultado);
      return resultado;
    }
  });

  // Gráfico de Status das Entregas (corrigido)
  const { data: statusEntregas } = useQuery({
    queryKey: ['status-entregas-cbuq', filters],
    queryFn: async () => {
      console.log("📈 Buscando status das entregas...");
      
      let query = supabase
        .from('bd_lista_programacao_entrega')
        .select(`
          id,
          status,
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
        console.error("❌ Erro ao buscar status entregas:", error);
        throw error;
      }

      console.log("📈 Entregas para status:", data?.length || 0);

      // Aplicar filtros
      let filteredData = data || [];

      if (filters.centroCustoId) {
        filteredData = filteredData.filter(item => {
          const requisicao = Array.isArray(item.requisicao) ? item.requisicao[0] : item.requisicao;
          return requisicao?.centro_custo_id === filters.centroCustoId;
        });
      }

      // Agrupar por status
      const statusCount = filteredData.reduce((acc, item) => {
        const status = item.status || 'Ativa';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as any);

      const resultado = Object.entries(statusCount).map(([name, value]) => ({
        name,
        value
      }));

      console.log("📈 Status agrupados:", resultado);
      return resultado;
    }
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Performance por Caminhão */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Performance por Caminhão</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceCaminhoes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Entregue" fill="#00C49F" name="Entregue" />
              <Bar dataKey="Enviada" fill="#0088FE" name="Enviada" />
              <Bar dataKey="Ativa" fill="#FFBB28" name="Ativa" />
              <Bar dataKey="Cancelada" fill="#FF8042" name="Cancelada" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distribuição por Encarregado */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Encarregado</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distribuicaoEncarregados}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {distribuicaoEncarregados?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Status das Entregas */}
      <Card>
        <CardHeader>
          <CardTitle>Status das Entregas</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusEntregas}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusEntregas?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
