
import React from "react";
import { Truck, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveGrid } from "@/components/layout/ResponsiveContainer";
import PieChartCard from "./PieChartCard";
import BarChartCard from "./BarChartCard";
import CustomSituacaoTooltip from "./CustomSituacaoTooltip";

interface MaquinasSectionProps {
  navigateTo: (path: string) => void;
  period: string;
  statusColors: Record<string, string>;
}

const MaquinasSection: React.FC<MaquinasSectionProps> = ({ navigateTo, period, statusColors }) => {
  const handleSituacaoClick = (situacao: string) => {
    navigateTo(`/gestao-maquinas/caminhoes?situacao=${encodeURIComponent(situacao)}`);
  };
  // Máquinas & Equipamentos Module Queries
  const { data: veiculosData, isLoading: loadingVeiculos } = useQuery({
    queryKey: ['veiculos-distribution', period],
    queryFn: async () => {
      try {
        // Get vehicles with related department information
        const { data, error } = await supabase
          .from('bd_caminhoes_equipamentos')
          .select(`
            id, tipo_veiculo, situacao, frota, numero_frota, departamento_id,
            departamento:departamento_id (id, nome_departamento)
          `);
          
        if (error) throw error;
        
        // Count by detailed vehicle types
        const tipoCount = {
          Caminhão: 0,
          Equipamento: 0,
          Prancha: 0,
          Van: 0,
          Ônibus: 0,
          Outros: 0
        };
        
        const situacaoDetails = {
          operando: [] as Array<{frota: string, numero_frota: string}>,
          manutencao: [] as Array<{frota: string, numero_frota: string}>,
          outros: [] as Array<{frota: string, numero_frota: string}>
        };
        
        data?.forEach(item => {
          // Categorize by vehicle type more precisely
          if (item.tipo_veiculo) {
            if (item.tipo_veiculo.includes('Caminhão')) {
              tipoCount.Caminhão += 1;
            } else if (item.tipo_veiculo.includes('Equipamento')) {
              tipoCount.Equipamento += 1;
            } else if (item.tipo_veiculo.includes('Prancha')) {
              tipoCount.Prancha += 1;
            } else if (item.tipo_veiculo.includes('Van')) {
              tipoCount.Van += 1;
            } else if (item.tipo_veiculo.includes('Ônibus')) {
              tipoCount.Ônibus += 1;
            } else {
              tipoCount.Outros += 1;
            }
          } else {
            tipoCount.Outros += 1;
          }
          
          const frotaInfo = {
            frota: item.frota || 'Sem frota',
            numero_frota: item.numero_frota || 'N/A'
          };
          
          if (item.situacao === 'Operando') {
            situacaoDetails.operando.push(frotaInfo);
          } else if (item.situacao === 'Em Manutenção') {
            situacaoDetails.manutencao.push(frotaInfo);
          } else {
            situacaoDetails.outros.push(frotaInfo);
          }
        });
        
        // Convert to array format for chart
        const distribuicaoArray = Object.entries(tipoCount)
          .filter(([_, count]) => count > 0) // Only include types that have at least one vehicle
          .map(([name, value]) => ({ name, value }));
        
        return {
          distribuicao: distribuicaoArray,
          situacao: [
            { 
              name: 'Operando', 
              value: situacaoDetails.operando.length,
              frotas: situacaoDetails.operando
            },
            { 
              name: 'Em Manutenção', 
              value: situacaoDetails.manutencao.length,
              frotas: situacaoDetails.manutencao
            },
            { 
              name: 'Outros', 
              value: situacaoDetails.outros.length,
              frotas: situacaoDetails.outros
            }
          ]
        };
      } catch (error) {
        console.error('Error fetching veiculos:', error);
        return { distribuicao: [], situacao: [] };
      }
    },
  });

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Truck className="h-5 w-5 text-primary" />
        Máquinas e Equipamentos
      </h2>
      
      <ResponsiveGrid cols={{ sm: 1, md: 2, lg: 2 }} gap="md">
        {/* Distribuição entre Caminhões e Equipamentos */}
        <PieChartCard
          title="Caminhões e Equipamentos"
          icon={Truck}
          data={veiculosData?.distribuicao || []}
          colors={statusColors}
          isLoading={loadingVeiculos}
          onClick={() => navigateTo("/gestao-maquinas/caminhoes")}
        />

        {/* Situação Operacional dos Veículos */}
        <BarChartCard
          title="Situação Operacional"
          icon={Settings}
          data={veiculosData?.situacao || []}
          colors={statusColors}
          isLoading={loadingVeiculos}
          onClick={() => navigateTo("/gestao-maquinas/caminhoes")}
          onBarClick={handleSituacaoClick}
          tooltipContent={CustomSituacaoTooltip}
        />
      </ResponsiveGrid>
    </section>
  );
};

export default MaquinasSection;
