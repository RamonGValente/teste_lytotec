
import React from "react";
import { Users, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveGrid } from "@/components/layout/ResponsiveContainer";
import StatsCard from "./StatsCard";

interface RhSectionProps {
  navigateTo: (path: string) => void;
  period: string;
}

const RhSection: React.FC<RhSectionProps> = ({ navigateTo, period }) => {
  // RH Module Queries
  const { data: funcionariosData, isLoading: loadingFuncionarios } = useQuery({
    queryKey: ['funcionarios-count', period],
    queryFn: async () => {
      try {
        const { count: total, error } = await supabase
          .from('bd_funcionarios')
          .select('*', { count: 'exact', head: true });
          
        if (error) throw error;
        
        const { count: ativos, error: errorAtivos } = await supabase
          .from('bd_funcionarios')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Ativo');
          
        if (errorAtivos) throw errorAtivos;
        
        return { total: total || 0, ativos: ativos || 0, inativos: (total || 0) - (ativos || 0) };
      } catch (error) {
        console.error('Error fetching funcionarios:', error);
        return { total: 0, ativos: 0, inativos: 0 };
      }
    },
  });
  
  const { data: equipesData, isLoading: loadingEquipes } = useQuery({
    queryKey: ['equipes-count', period],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from('bd_equipes')
          .select('*', { count: 'exact', head: true });
          
        if (error) throw error;
        
        return count || 0;
      } catch (error) {
        console.error('Error fetching equipes:', error);
        return 0;
      }
    },
  });

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        Gestão de RH
      </h2>
      
      <ResponsiveGrid cols={{ sm: 1, md: 2, lg: 2 }} gap="md">
        {/* Total Funcionários */}
        <StatsCard
          title="Total de Funcionários"
          value={funcionariosData?.total}
          icon={User}
          footer={
            <div className="flex gap-3">
              <span className="text-green-600">{funcionariosData?.ativos} ativos</span>
              <span className="text-red-500">{funcionariosData?.inativos} inativos</span>
            </div>
          }
          isLoading={loadingFuncionarios}
          onClick={() => navigateTo("/gestao-rh/funcionarios")}
        />

        {/* Total Equipes */}
        <StatsCard
          title="Total de Equipes"
          value={equipesData}
          icon={Users}
          footer="Equipes de trabalho cadastradas no sistema"
          isLoading={loadingEquipes}
          onClick={() => navigateTo("/gestao-rh/equipes")}
        />
      </ResponsiveGrid>
    </section>
  );
};

export default RhSection;
