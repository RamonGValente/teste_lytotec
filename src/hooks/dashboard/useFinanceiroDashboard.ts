
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FinanceiroAnalise {
  folhaTotal: number;
  mediaSalarial: number;
  folhaPorFuncao: { nome_funcao: string; total: number; media: number }[];
}

// Helper to consistently extract nome_funcao regardless of shape
function getNomeFuncao(bd_funcoes: any): string {
  console.log("🔍 DEBUG getNomeFuncao - input:", bd_funcoes);
  
  if (!bd_funcoes) {
    console.log("🔍 DEBUG getNomeFuncao - returning 'Não informada' (null input)");
    return "Não informada";
  }
  
  if (Array.isArray(bd_funcoes)) {
    if (bd_funcoes.length > 0 && bd_funcoes[0]?.nome_funcao) {
      console.log("🔍 DEBUG getNomeFuncao - returning from array:", bd_funcoes[0].nome_funcao);
      return bd_funcoes[0].nome_funcao;
    }
    console.log("🔍 DEBUG getNomeFuncao - returning 'Não informada' (empty array)");
    return "Não informada";
  }
  
  if (typeof bd_funcoes === "object" && bd_funcoes.nome_funcao) {
    console.log("🔍 DEBUG getNomeFuncao - returning from object:", bd_funcoes.nome_funcao);
    return bd_funcoes.nome_funcao;
  }
  
  console.log("🔍 DEBUG getNomeFuncao - returning 'Não informada' (fallback)");
  return "Não informada";
}

// Helper to safely convert salary values
function convertSalary(salario: any): number {
  if (!salario) return 0;
  if (typeof salario === "number") return salario;
  if (typeof salario === "string") {
    const converted = parseFloat(salario.replace(",", "."));
    return isNaN(converted) ? 0 : converted;
  }
  return 0;
}

export function useFinanceiroDashboard({
  periodStart,
  periodEnd,
  statusFuncionario,
  departamentoId,
  centroCustoId,
  equipeId,
  funcaoId,
  nomeFuncionario,
}: {
  periodStart: string;
  periodEnd: string;
  statusFuncionario?: string;
  departamentoId?: string;
  centroCustoId?: string;
  equipeId?: string;
  funcaoId?: string;
  nomeFuncionario?: string;
}) {
  // --- Consulta base geral (sem filtro) ---
  const totalQuery = useQuery<FinanceiroAnalise>({
    queryKey: ["rh-financeiro", "GLOBAL"],
    queryFn: async () => {
      console.log("🔍 DEBUG totalQuery - iniciando consulta global");
      
      let query = supabase
        .from("bd_funcionarios")
        .select(`
          id, salario_base, bd_funcoes(id, nome_funcao)
        `)
        .in("status", ["Ativo", "Aviso Prévio"]);
        
      const { data: funcionarios, error } = await query;
      
      if (error) {
        console.error("🔍 DEBUG totalQuery - erro:", error);
        return { folhaTotal: 0, mediaSalarial: 0, folhaPorFuncao: [] };
      }
      
      console.log("🔍 DEBUG totalQuery - funcionarios encontrados:", funcionarios?.length || 0);
      console.log("🔍 DEBUG totalQuery - primeiros 3 funcionarios:", funcionarios?.slice(0, 3));
      
      if (!funcionarios || funcionarios.length === 0) {
        console.log("🔍 DEBUG totalQuery - nenhum funcionário encontrado");
        return { folhaTotal: 0, mediaSalarial: 0, folhaPorFuncao: [] };
      }
      
      const salarios = funcionarios.map((f: any) => {
        const salario = convertSalary(f.salario_base);
        console.log(`🔍 DEBUG totalQuery - funcionário ${f.id}: salario_base=${f.salario_base} -> convertido=${salario}`);
        return salario;
      });
      
      const folhaTotal = salarios.reduce((a, b) => a + b, 0);
      const salariosValidos = salarios.filter(s => s > 0);
      const mediaSalarial = salariosValidos.length > 0 ? folhaTotal / salariosValidos.length : 0;
      
      console.log("🔍 DEBUG totalQuery - folhaTotal:", folhaTotal);
      console.log("🔍 DEBUG totalQuery - mediaSalarial:", mediaSalarial);
      console.log("🔍 DEBUG totalQuery - salários válidos:", salariosValidos.length);
      
      // Agrupar por função
      const porFuncaoMap = new Map<string, { nome_funcao: string, total: number, conta: number }>();
      
      for (const f of funcionarios) {
        const nome = getNomeFuncao(f.bd_funcoes);
        const salario = convertSalary(f.salario_base);
        
        if (!porFuncaoMap.has(nome)) {
          porFuncaoMap.set(nome, { nome_funcao: nome, total: 0, conta: 0 });
        }
        
        const entry = porFuncaoMap.get(nome)!;
        entry.total += salario;
        entry.conta += 1;
        
        console.log(`🔍 DEBUG totalQuery - função ${nome}: total=${entry.total}, conta=${entry.conta}`);
      }
      
      const folhaPorFuncao = Array.from(porFuncaoMap.values()).map(({ nome_funcao, total, conta }) => ({
        nome_funcao,
        total,
        media: conta > 0 ? total / conta : 0,
      }));
      
      console.log("🔍 DEBUG totalQuery - folhaPorFuncao:", folhaPorFuncao);
      
      return { folhaTotal, mediaSalarial, folhaPorFuncao };
    }
  });

  // --- Consulta filtrada ---
  const filtroQuery = useQuery<FinanceiroAnalise>({
    queryKey: ["rh-financeiro", {
      statusFuncionario, departamentoId, centroCustoId, equipeId, funcaoId, nomeFuncionario
    }],
    queryFn: async () => {
      console.log("🔍 DEBUG filtroQuery - iniciando consulta filtrada");
      console.log("🔍 DEBUG filtroQuery - filtros:", {
        statusFuncionario, departamentoId, centroCustoId, equipeId, funcaoId, nomeFuncionario
      });
      
      let query = supabase
        .from("bd_funcionarios")
        .select("id, salario_base, bd_funcoes(id, nome_funcao)")
        .in("status", ["Ativo", "Aviso Prévio"]);
        
      // Aplicar filtros apenas se especificados e diferentes de "_all"
      if (statusFuncionario && statusFuncionario !== "_all") {
        console.log("🔍 DEBUG filtroQuery - aplicando filtro status:", statusFuncionario);
        query = query.eq("status", statusFuncionario);
      }
      if (departamentoId && departamentoId !== "_all") {
        console.log("🔍 DEBUG filtroQuery - aplicando filtro departamento:", departamentoId);
        query = query.eq("departamento_id", departamentoId);
      }
      if (centroCustoId && centroCustoId !== "_all") {
        console.log("🔍 DEBUG filtroQuery - aplicando filtro centro custo:", centroCustoId);
        query = query.eq("centro_custo_id", centroCustoId);
      }
      if (equipeId && equipeId !== "_all") {
        console.log("🔍 DEBUG filtroQuery - aplicando filtro equipe:", equipeId);
        query = query.eq("equipe_id", equipeId);
      }
      if (funcaoId && funcaoId !== "_all") {
        console.log("🔍 DEBUG filtroQuery - aplicando filtro função:", funcaoId);
        query = query.eq("funcao_id", funcaoId);
      }
      if (nomeFuncionario && nomeFuncionario.trim()) {
        console.log("🔍 DEBUG filtroQuery - aplicando filtro nome:", nomeFuncionario);
        query = query.ilike("nome_completo", `%${nomeFuncionario}%`);
      }
      
      // REMOVIDO: Filtro de período que estava causando problema
      // O filtro de período não faz sentido para dados financeiros atuais
      
      const { data: funcionarios, error } = await query;
      
      if (error) {
        console.error("🔍 DEBUG filtroQuery - erro:", error);
        return { folhaTotal: 0, mediaSalarial: 0, folhaPorFuncao: [] };
      }
      
      console.log("🔍 DEBUG filtroQuery - funcionarios encontrados:", funcionarios?.length || 0);
      
      if (!funcionarios || funcionarios.length === 0) {
        console.log("🔍 DEBUG filtroQuery - nenhum funcionário encontrado com filtros");
        return { folhaTotal: 0, mediaSalarial: 0, folhaPorFuncao: [] };
      }
      
      const salarios = funcionarios.map((f: any) => convertSalary(f.salario_base));
      const folhaTotal = salarios.reduce((a, b) => a + b, 0);
      const salariosValidos = salarios.filter(s => s > 0);
      const mediaSalarial = salariosValidos.length > 0 ? folhaTotal / salariosValidos.length : 0;
      
      console.log("🔍 DEBUG filtroQuery - folhaTotal:", folhaTotal);
      console.log("🔍 DEBUG filtroQuery - mediaSalarial:", mediaSalarial);
      
      // Agrupar por função
      const porFuncaoMap = new Map<string, { nome_funcao: string, total: number, conta: number }>();
      
      for (const f of funcionarios) {
        const nome = getNomeFuncao(f.bd_funcoes);
        const salario = convertSalary(f.salario_base);
        
        if (!porFuncaoMap.has(nome)) {
          porFuncaoMap.set(nome, { nome_funcao: nome, total: 0, conta: 0 });
        }
        
        const entry = porFuncaoMap.get(nome)!;
        entry.total += salario;
        entry.conta += 1;
      }
      
      const folhaPorFuncao = Array.from(porFuncaoMap.values()).map(({ nome_funcao, total, conta }) => ({
        nome_funcao,
        total,
        media: conta > 0 ? total / conta : 0,
      }));
      
      console.log("🔍 DEBUG filtroQuery - folhaPorFuncao:", folhaPorFuncao);
      
      return { folhaTotal, mediaSalarial, folhaPorFuncao };
    }
  });

  return { totalQuery, filtroQuery };
}
