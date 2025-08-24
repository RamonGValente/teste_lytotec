import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Types for KPI card
export interface RhKpis {
  totalAtivos: number;
  totalFuncionarios: number;
  totalEquipes: number;
  tempoMedioMeses: number;
  turnover: number;
}

export interface FuncionarioAnalise {
  id: string;
  imagem?: string;
  nome_completo: string;
  status?: string;
  data_admissao?: string;

  // Joins
  bd_funcoes?: { id: string; nome_funcao: string } | null;
  bd_departamentos?: { id: string; nome_departamento: string } | null;

  mediaAvaliacao?: number | null;
}

export interface EquipeAnalise {
  id: string;
  nome_equipe: string;
  encarregado_id?: string;
  equipe?: string[];
  mediaEquipe?: number | null;
  qtdColaboradores?: number;
}

/**
 * Hook principal para buscar dados consolidados do dashboard RH.
 * Inclui KPIs, gráficos de distribuição, evolução temporal e dados individuais/equipe.
 */
export const useRhDashboardData = (filters: {
  periodStart: string;
  periodEnd: string;
  departamentoId?: string;
  centroCustoId?: string;
  equipeId?: string;
  statusFuncionario?: string;
  notaMinima?: number;
  // Novos filtros possíveis para escolaridade/gênero no futuro
  funcaoId?: string;
  nomeFuncionario?: string;
}) => {
  // 1. KPIs gerais
  const kpisQuery = useQuery<RhKpis>({
    queryKey: ["rh-kpis", filters],
    queryFn: async () => {
      console.log("🔍 DEBUG kpisQuery - iniciando consulta KPIs");
      
      // Total ativos
      const { count: totalAtivos } = await supabase
        .from("bd_funcionarios")
        .select("*", { count: "exact", head: true })
        .eq("status", "Ativo");
        
      // Total de funcionários
      const { count: totalFuncionarios } = await supabase
        .from("bd_funcionarios")
        .select("*", { count: "exact", head: true });
        
      // Total de equipes
      const { count: totalEquipes } = await supabase
        .from("bd_equipes")
        .select("*", { count: "exact", head: true });
        
      // Turnover estimado - número de demissões no período vs base
      const { count: demissoesPeriodo } = await supabase
        .from("bd_funcionarios")
        .select("*", { count: "exact", head: true })
        .gte("data_demissao", filters.periodStart)
        .lte("data_demissao", filters.periodEnd);

      console.log("🔍 DEBUG kpisQuery - contadores:", {
        totalAtivos, totalFuncionarios, totalEquipes, demissoesPeriodo
      });

      const { data: funcionariosDataTempo, error: errorTempo } = await supabase
        .from("bd_funcionarios")
        .select("data_admissao, data_demissao")
        .eq("status", "Ativo");

      console.log("🔍 DEBUG kpisQuery - funcionários para tempo médio:", funcionariosDataTempo?.length || 0);

      // Tempo médio de empresa (em meses) - CORRIGIDO para retornar número inteiro
      const now = new Date();
      let tempoTotal = 0;
      let tempoCount = 0;
      
      if (funcionariosDataTempo && funcionariosDataTempo.length) {
        funcionariosDataTempo.forEach(f => {
          if (f.data_admissao) {
            const admissaoDate = new Date(f.data_admissao);
            const diff = (now.getFullYear() - admissaoDate.getFullYear()) * 12 + (now.getMonth() - admissaoDate.getMonth());
            tempoTotal += diff;
            tempoCount += 1;
          }
        });
      }
      
      // APLICAR Math.round() para garantir número inteiro
      const tempoMedioMeses = tempoCount > 0 ? Math.round(tempoTotal / tempoCount) : 0;
      
      // Turnover %
      const turnover = totalFuncionarios ? ((demissoesPeriodo || 0) / totalFuncionarios) * 100 : 0;

      console.log("🔍 DEBUG kpisQuery - resultados:", {
        totalAtivos: totalAtivos || 0,
        totalFuncionarios: totalFuncionarios || 0,
        totalEquipes: totalEquipes || 0,
        tempoMedioMeses,
        turnover: Number(turnover.toFixed(1))
      });

      return {
        totalAtivos: totalAtivos || 0,
        totalFuncionarios: totalFuncionarios || 0,
        totalEquipes: totalEquipes || 0,
        tempoMedioMeses,
        turnover: Number(turnover.toFixed(1))
      };
    }
  });

  // 2. Distribuição por Departamento, Função, Centro de Custo e Gênero
  const distribuicaoQuery = useQuery({
    queryKey: ["rh-distribuicao", filters],
    queryFn: async () => {
      // Usar always array for joins
      const { data: deptoDist } = await supabase
        .from("bd_funcionarios")
        .select("departamento_id, bd_departamentos(nome_departamento)")
        .eq("status", "Ativo");

      const { data: funcaoDist } = await supabase
        .from("bd_funcionarios")
        .select("funcao_id, bd_funcoes(nome_funcao)")
        .eq("status", "Ativo");

      // Atualizar para buscar código do centro de custo
      const { data: centroDist } = await supabase
        .from("bd_funcionarios")
        .select("centro_custo_id, bd_centros_custo(codigo_centro_custo, nome_centro_custo)")
        .eq("status", "Ativo");

      // Nova consulta para distribuição por gênero
      const { data: generoDist } = await supabase
        .from("bd_funcionarios")
        .select("genero")
        .eq("status", "Ativo");

      // Vai devolver array of { departamento_id, bd_departamentos: [{ nome_departamento }] }
      return { deptoDist, funcaoDist, centroDist, generoDist };
    },
  });

  // 3. Evolução temporal: funcionários por mês + entradas/saídas
  const evolucaoTemporal = useQuery({
    queryKey: ["rh-evolucao", filters],
    queryFn: async () => {
      // Example basic: enters/leaves in the period
      const { data: entradas } = await supabase
        .from("bd_funcionarios")
        .select("id, data_admissao")
        .gte("data_admissao", filters.periodStart)
        .lte("data_admissao", filters.periodEnd);

      const { data: demissoes } = await supabase
        .from("bd_funcionarios")
        .select("id, data_demissao")
        .gte("data_demissao", filters.periodStart)
        .lte("data_demissao", filters.periodEnd);

      return { entradas, demissoes };
    }
  });

  // 4. Análise Individual: Tabela detalhada
  const analiseIndividual = useQuery<FuncionarioAnalise[]>({
    queryKey: ["rh-individual", filters],
    queryFn: async () => {
      // Fetch all active or filtered + function, department, photo
      let query = supabase
        .from("bd_funcionarios")
        .select(`
          id, imagem, nome_completo, status, data_admissao,
          bd_funcoes(id, nome_funcao),
          bd_departamentos(id, nome_departamento)
        `);

      if (filters.statusFuncionario) {
        query = query.eq("status", filters.statusFuncionario);
      }
      if (filters.departamentoId) {
        query = query.eq("departamento_id", filters.departamentoId);
      }
      if (filters.centroCustoId) {
        query = query.eq("centro_custo_id", filters.centroCustoId);
      }

      const { data: funcionarios } = await query;

      // Fetch evaluations by employee - usando bd_apontamento_equipe que agora tem as colunas de avaliação
      const { data: avaliacoes } = await supabase
        .from("bd_apontamento_equipe")
        .select("colaborador_id, pontualidade, proatividade, organizacao, competencia_tecnica, comunicacao, trabalho_em_equipe");

      // Calculate average of each employee's evaluations
      const funcionarioComMedia: FuncionarioAnalise[] = (funcionarios ?? []).map(f => {
        // Make sure bd_funcoes and bd_departamentos are single objects or null
        const bd_funcoes = f.bd_funcoes && !Array.isArray(f.bd_funcoes) ? f.bd_funcoes : (Array.isArray(f.bd_funcoes) && f.bd_funcoes.length > 0 ? f.bd_funcoes[0] : null);
        const bd_departamentos = f.bd_departamentos && !Array.isArray(f.bd_departamentos) ? f.bd_departamentos : (Array.isArray(f.bd_departamentos) && f.bd_departamentos.length > 0 ? f.bd_departamentos[0] : null);

        const avals = avaliacoes?.filter(a => a.colaborador_id === f.id) || [];
        const medias = avals.map(a => {
          const avalVals = [
            a.pontualidade, a.proatividade, a.organizacao, a.competencia_tecnica, a.comunicacao, a.trabalho_em_equipe
          ].filter(x => typeof x === "number");
          if (avalVals.length === 0) return null;
          return avalVals.reduce((acc, cur) => acc + cur, 0) / avalVals.length;
        }).filter(x => x !== null) as number[];
        const mediaAvaliacao = medias.length
          ? (medias.reduce((acc, cur) => acc + cur, 0) / medias.length)
          : null;

        return {
          ...f,
          bd_funcoes: bd_funcoes ?? null,
          bd_departamentos: bd_departamentos ?? null,
          mediaAvaliacao,
        }
      });

      return funcionarioComMedia;
    }
  });

  // 5. Análise por Equipe: Desempenho médio
  const analiseEquipe = useQuery<EquipeAnalise[]>({
    queryKey: ["rh-equipe", filters],
    queryFn: async () => {
      const { data: equipes } = await supabase
        .from("bd_equipes")
        .select("id, nome_equipe, encarregado_id, equipe");

       const { data: avaliacoes } = await supabase
        .from("bd_apontamento_equipe")
        .select("equipe_id, pontualidade, proatividade, organizacao, competencia_tecnica, comunicacao, trabalho_em_equipe");

      // Aggregation: average by team
      const equipesData: EquipeAnalise[] = (equipes ?? []).map(equipe => {
        const avals = avaliacoes?.filter(a => a.equipe_id === equipe.id) || [];
        const medias = avals.map(a => {
          const avalVals = [
            a.pontualidade, a.proatividade, a.organizacao, a.competencia_tecnica, a.comunicacao, a.trabalho_em_equipe
          ].filter(x => typeof x === "number");
          if (avalVals.length === 0) return null;
          return avalVals.reduce((acc, cur) => acc + cur, 0) / avalVals.length;
        }).filter(x => x !== null) as number[];
        const mediaEquipe = medias.length
          ? (medias.reduce((acc, cur) => acc + cur, 0) / medias.length)
          : null;
        return {
          ...equipe,
          mediaEquipe,
          qtdColaboradores: Array.isArray(equipe.equipe) ? equipe.equipe.length : 0,
        }
      });

      return equipesData;
    }
  });

  return {
    kpisQuery,
    distribuicaoQuery,
    evolucaoTemporal,
    analiseIndividual,
    analiseEquipe,
  };
};
