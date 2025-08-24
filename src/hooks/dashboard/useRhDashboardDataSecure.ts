
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRhSecurity } from "./useRhSecurity";
import { 
  RhKpis, 
  FuncionarioAnalise, 
  EquipeAnalise 
} from "./useRhDashboardData";

interface SecureFilters {
  periodStart: string;
  periodEnd: string;
  departamentoId?: string;
  centroCustoId?: string;
  equipeId?: string;
  statusFuncionario?: string;
  notaMinima?: number;
  funcaoId?: string;
  nomeFuncionario?: string;
}

/**
 * Hook seguro para buscar dados do dashboard RH com filtro por setor/departamento
 */
export const useRhDashboardDataSecure = (filters: SecureFilters) => {
  const securityContext = useRhSecurity();

  // Aplicar filtros de segurança
  const secureFilters = {
    ...filters,
    // Se não for SuperAdm, forçar filtro por departamento
    departamentoId: securityContext.canViewAllData 
      ? filters.departamentoId 
      : securityContext.departamentoId || filters.departamentoId,
    centroCustoId: securityContext.canViewAllData 
      ? filters.centroCustoId 
      : securityContext.centroCustoId || filters.centroCustoId,
  };

  // Debug do contexto de segurança
  console.log("🔐 DEBUG Security Context:", {
    canViewAllData: securityContext.canViewAllData,
    departamentoId: securityContext.departamentoId,
    departamentoNome: securityContext.departamentoNome,
    appliedFilters: secureFilters
  });

  // 1. KPIs gerais com filtro de segurança
  const kpisQuery = useQuery<RhKpis>({
    queryKey: ["rh-kpis-secure", secureFilters, securityContext],
    queryFn: async () => {
      console.log("🔍 DEBUG kpisQuery SECURE - iniciando consulta KPIs com filtros:", secureFilters);
      
      // Base query para funcionários
      let funcionariosQuery = supabase.from("bd_funcionarios").select("*", { count: "exact", head: true });
      
      // Aplicar filtros de segurança
      if (!securityContext.canViewAllData && securityContext.departamentoId) {
        funcionariosQuery = funcionariosQuery.eq("departamento_id", securityContext.departamentoId);
      }

      // Total ativos
      const { count: totalAtivos } = await funcionariosQuery
        .eq("status", "Ativo");
        
      // Total de funcionários (incluindo ativos e inativos) - REMOVIDO O FILTRO DE STATUS
      const { count: totalFuncionarios } = await funcionariosQuery;
        
      // Total de equipes (filtrar por departamento se necessário)
      let equipesQuery = supabase.from("bd_equipes").select("*", { count: "exact", head: true });
      // Para equipes, vamos buscar aquelas que têm pelo menos um membro do departamento
      if (!securityContext.canViewAllData && securityContext.departamentoId) {
        const { data: funcionariosDoDept } = await supabase
          .from("bd_funcionarios")
          .select("id")
          .eq("departamento_id", securityContext.departamentoId);
        
        const funcionarioIds = funcionariosDoDept?.map(f => f.id) || [];
        if (funcionarioIds.length > 0) {
          equipesQuery = equipesQuery.overlaps("equipe", funcionarioIds);
        }
      }
      const { count: totalEquipes } = await equipesQuery;
        
      // Turnover estimado - demissões no período
      let demissoesQuery = supabase
        .from("bd_funcionarios")
        .select("*", { count: "exact", head: true })
        .gte("data_demissao", filters.periodStart)
        .lte("data_demissao", filters.periodEnd);
      
      // Aplicar filtros de segurança para demissões
      if (!securityContext.canViewAllData && securityContext.departamentoId) {
        demissoesQuery = demissoesQuery.eq("departamento_id", securityContext.departamentoId);
      }

      const { count: demissoesPeriodo } = await demissoesQuery;

      console.log("🔍 DEBUG turnover - demissões no período:", demissoesPeriodo);
      console.log("🔍 DEBUG turnover - total funcionários:", totalFuncionarios);

      // Tempo médio de empresa
      let tempoQuery = supabase
        .from("bd_funcionarios")
        .select("data_admissao, data_demissao")
        .eq("status", "Ativo");
      
      if (!securityContext.canViewAllData && securityContext.departamentoId) {
        tempoQuery = tempoQuery.eq("departamento_id", securityContext.departamentoId);
      }

      const { data: funcionariosDataTempo } = await tempoQuery;

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
      
      const tempoMedioMeses = tempoCount > 0 ? Math.round(tempoTotal / tempoCount) : 0;
      
      // Calcular turnover corretamente e garantir que não seja arredondado para 0
      const turnoverCalc = totalFuncionarios && totalFuncionarios > 0 ? ((demissoesPeriodo || 0) / totalFuncionarios) * 100 : 0;
      const turnover = turnoverCalc < 0.1 && turnoverCalc > 0 ? 0.1 : Math.round(turnoverCalc * 10) / 10; // Arredondar para 1 casa decimal

      console.log("🔍 DEBUG kpisQuery SECURE - resultados:", {
        totalAtivos: totalAtivos || 0,
        totalFuncionarios: totalFuncionarios || 0,
        totalEquipes: totalEquipes || 0,
        tempoMedioMeses,
        turnover,
        turnoverCalc,
        demissoesPeriodo: demissoesPeriodo || 0,
        securityApplied: !securityContext.canViewAllData
      });

      return {
        totalAtivos: totalAtivos || 0,
        totalFuncionarios: totalFuncionarios || 0,
        totalEquipes: totalEquipes || 0,
        tempoMedioMeses,
        turnover
      };
    },
    enabled: !securityContext.isLoading
  });

  // 2. Distribuição com filtro de segurança
  const distribuicaoQuery = useQuery({
    queryKey: ["rh-distribuicao-secure", secureFilters, securityContext],
    queryFn: async () => {
      console.log("🔍 DEBUG distribuicaoQuery - iniciando busca de distribuição");
      
      let baseQuery = supabase.from("bd_funcionarios").select("departamento_id, bd_departamentos(nome_departamento), funcao_id, bd_funcoes(nome_funcao), centro_custo_id, bd_centros_custo(codigo_centro_custo, nome_centro_custo), genero, empresa_id, bd_empresas(nome_empresa)");
      
      // Aplicar filtros de segurança - buscar todos os funcionários se for SuperAdm
      if (!securityContext.canViewAllData && securityContext.departamentoId) {
        baseQuery = baseQuery.eq("departamento_id", securityContext.departamentoId);
      }

      const { data: funcionarios, error } = await baseQuery;
      
      if (error) {
        console.error("❌ DEBUG distribuicaoQuery - erro:", error);
        throw error;
      }

      console.log("🔍 DEBUG distribuicaoQuery - funcionários encontrados:", funcionarios?.length);
      console.log("🔍 DEBUG distribuicaoQuery - sample funcionários:", funcionarios?.slice(0, 3));

      return {
        deptoDist: funcionarios?.map(f => ({ departamento_id: f.departamento_id, bd_departamentos: f.bd_departamentos })) || [],
        funcaoDist: funcionarios?.map(f => ({ funcao_id: f.funcao_id, bd_funcoes: f.bd_funcoes })) || [],
        centroDist: funcionarios?.map(f => ({ centro_custo_id: f.centro_custo_id, bd_centros_custo: f.bd_centros_custo })) || [],
        generoDist: funcionarios?.map(f => ({ genero: f.genero })) || [],
        empresaDist: funcionarios?.map(f => ({ empresa_id: f.empresa_id, bd_empresas: f.bd_empresas })) || []
      };
    },
    enabled: !securityContext.isLoading
  });

  // 3. Evolução temporal com filtro de segurança
  const evolucaoTemporal = useQuery({
    queryKey: ["rh-evolucao-secure", secureFilters, securityContext],
    queryFn: async () => {
      let entradasQuery = supabase
        .from("bd_funcionarios")
        .select("id, data_admissao")
        .gte("data_admissao", filters.periodStart)
        .lte("data_admissao", filters.periodEnd);

      let demissoesQuery = supabase
        .from("bd_funcionarios")
        .select("id, data_demissao")
        .gte("data_demissao", filters.periodStart)
        .lte("data_demissao", filters.periodEnd);

      // Aplicar filtros de segurança
      if (!securityContext.canViewAllData && securityContext.departamentoId) {
        entradasQuery = entradasQuery.eq("departamento_id", securityContext.departamentoId);
        demissoesQuery = demissoesQuery.eq("departamento_id", securityContext.departamentoId);
      }

      const { data: entradas } = await entradasQuery;
      const { data: demissoes } = await demissoesQuery;

      return { entradas, demissoes };
    },
    enabled: !securityContext.isLoading
  });

  // 4. Análise Individual com filtro de segurança
  const analiseIndividual = useQuery<FuncionarioAnalise[]>({
    queryKey: ["rh-individual-secure", secureFilters, securityContext],
    queryFn: async () => {
      console.log("🔍 DEBUG analiseIndividual - iniciando busca de funcionários");
      
      let query = supabase
        .from("bd_funcionarios")
        .select(`
          id, imagem, nome_completo, status, data_admissao,
          bd_funcoes(id, nome_funcao),
          bd_departamentos(id, nome_departamento)
        `);

      // Aplicar filtros de segurança primeiro
      if (!securityContext.canViewAllData && securityContext.departamentoId) {
        query = query.eq("departamento_id", securityContext.departamentoId);
        console.log("🔐 DEBUG analiseIndividual - aplicando filtro de departamento:", securityContext.departamentoId);
      }

      // Depois aplicar filtros do usuário
      if (secureFilters.statusFuncionario) {
        query = query.eq("status", secureFilters.statusFuncionario);
      }
      if (secureFilters.centroCustoId) {
        query = query.eq("centro_custo_id", secureFilters.centroCustoId);
      }

      const { data: funcionarios } = await query;
      console.log("🔍 DEBUG analiseIndividual - funcionários encontrados:", funcionarios?.length || 0);

      // Buscar avaliações da tabela bd_avaliacao_equipe
      console.log("🔍 DEBUG analiseIndividual - buscando avaliações na bd_avaliacao_equipe");
      
      const { data: avaliacoes, error: errorAvaliacoes } = await supabase
        .from("bd_apontamento_equipe")
        .select("colaborador_id, pontualidade, proatividade, organizacao, competencia_tecnica, comunicacao, trabalho_em_equipe");

      if (errorAvaliacoes) {
        console.error("❌ DEBUG analiseIndividual - erro ao buscar avaliações:", errorAvaliacoes);
      } else {
        console.log("🔍 DEBUG analiseIndividual - avaliações encontradas:", avaliacoes?.length || 0);
        console.log("🔍 DEBUG analiseIndividual - sample avaliações:", avaliacoes?.slice(0, 3));
      }

      const funcionarioComMedia: FuncionarioAnalise[] = (funcionarios ?? []).map(f => {
        const bd_funcoes = f.bd_funcoes && !Array.isArray(f.bd_funcoes) ? f.bd_funcoes : (Array.isArray(f.bd_funcoes) && f.bd_funcoes.length > 0 ? f.bd_funcoes[0] : null);
        const bd_departamentos = f.bd_departamentos && !Array.isArray(f.bd_departamentos) ? f.bd_departamentos : (Array.isArray(f.bd_departamentos) && f.bd_departamentos.length > 0 ? f.bd_departamentos[0] : null);

        const avals = avaliacoes?.filter(a => a.colaborador_id === f.id) || [];
        console.log(`🔍 DEBUG analiseIndividual - avaliações para ${f.nome_completo}:`, avals.length);
        
        const medias = avals.map(a => {
          const avalVals = [
            a.pontualidade, a.proatividade, a.organizacao, a.competencia_tecnica, a.comunicacao, a.trabalho_em_equipe
          ].filter(x => typeof x === "number" && x > 0);
          if (avalVals.length === 0) return null;
          return avalVals.reduce((acc, cur) => acc + cur, 0) / avalVals.length;
        }).filter(x => x !== null) as number[];
        
        const mediaAvaliacao = medias.length
          ? (medias.reduce((acc, cur) => acc + cur, 0) / medias.length)
          : null;

        if (mediaAvaliacao !== null) {
          console.log(`🔍 DEBUG analiseIndividual - ${f.nome_completo} tem média:`, mediaAvaliacao);
        }

        return {
          ...f,
          bd_funcoes: bd_funcoes ?? null,
          bd_departamentos: bd_departamentos ?? null,
          mediaAvaliacao,
        }
      });

      console.log("🔍 DEBUG analiseIndividual - funcionários com média calculada:", 
        funcionarioComMedia.filter(f => f.mediaAvaliacao !== null).length, 
        "de", funcionarioComMedia.length);

      return funcionarioComMedia;
    },
    enabled: !securityContext.isLoading
  });

  // 5. Análise por Equipe com filtro de segurança
  const analiseEquipe = useQuery<EquipeAnalise[]>({
    queryKey: ["rh-equipe-secure", secureFilters, securityContext],
    queryFn: async () => {
      console.log("🔍 DEBUG analiseEquipe - iniciando busca de equipes");
      
      let query = supabase.from("bd_equipes").select("id, nome_equipe, encarregado_id, equipe");
      
      // Se não for SuperAdm, filtrar equipes que tenham pelo menos um membro do departamento
      if (!securityContext.canViewAllData && securityContext.departamentoId) {
        const { data: funcionariosDoDept } = await supabase
          .from("bd_funcionarios")
          .select("id")
          .eq("departamento_id", securityContext.departamentoId);
        
        const funcionarioIds = funcionariosDoDept?.map(f => f.id) || [];
        console.log("🔐 DEBUG analiseEquipe - funcionários do departamento:", funcionarioIds.length);
        
        if (funcionarioIds.length > 0) {
          query = query.overlaps("equipe", funcionarioIds);
        }
      }

      const { data: equipes } = await query;
      console.log("🔍 DEBUG analiseEquipe - equipes encontradas:", equipes?.length || 0);

      // Buscar avaliações de equipe
      console.log("🔍 DEBUG analiseEquipe - buscando avaliações de equipe na bd_avaliacao_equipe");
      
      const { data: avaliacoes, error: errorAvaliacoes } = await supabase
        .from("bd_apontamento_equipe")
        .select("equipe_id, pontualidade, proatividade, organizacao, competencia_tecnica, comunicacao, trabalho_em_equipe");

      if (errorAvaliacoes) {
        console.error("❌ DEBUG analiseEquipe - erro ao buscar avaliações:", errorAvaliacoes);
      } else {
        console.log("🔍 DEBUG analiseEquipe - avaliações de equipe encontradas:", avaliacoes?.length || 0);
        console.log("🔍 DEBUG analiseEquipe - sample avaliações equipe:", avaliacoes?.slice(0, 3));
      }

      const equipesData: EquipeAnalise[] = (equipes ?? []).map(equipe => {
        const avals = avaliacoes?.filter(a => a.equipe_id === equipe.id) || [];
        console.log(`🔍 DEBUG analiseEquipe - avaliações para equipe ${equipe.nome_equipe}:`, avals.length);
        
        const medias = avals.map(a => {
          const avalVals = [
            a.pontualidade, a.proatividade, a.organizacao, a.competencia_tecnica, a.comunicacao, a.trabalho_em_equipe
          ].filter(x => typeof x === "number" && x > 0);
          if (avalVals.length === 0) return null;
          return avalVals.reduce((acc, cur) => acc + cur, 0) / avalVals.length;
        }).filter(x => x !== null) as number[];
        
        const mediaEquipe = medias.length
          ? (medias.reduce((acc, cur) => acc + cur, 0) / medias.length)
          : null;

        if (mediaEquipe !== null) {
          console.log(`🔍 DEBUG analiseEquipe - equipe ${equipe.nome_equipe} tem média:`, mediaEquipe);
        }
          
        return {
          ...equipe,
          mediaEquipe,
          qtdColaboradores: Array.isArray(equipe.equipe) ? equipe.equipe.length : 0,
        }
      });

      console.log("🔍 DEBUG analiseEquipe - equipes com média calculada:", 
        equipesData.filter(e => e.mediaEquipe !== null).length, 
        "de", equipesData.length);

      return equipesData;
    },
    enabled: !securityContext.isLoading
  });

  return {
    kpisQuery,
    distribuicaoQuery,
    evolucaoTemporal,
    analiseIndividual,
    analiseEquipe,
    securityContext
  };
};
