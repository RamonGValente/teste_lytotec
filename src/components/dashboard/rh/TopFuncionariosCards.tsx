
import React from "react";
import { Badge } from "@/components/ui/badge";
import { FuncionarioAnalise } from "@/hooks/dashboard/useRhDashboardData";
import { AlertCircle, Star, TrendingUp } from "lucide-react";

interface TopFuncionariosCardsProps {
  funcionarios: FuncionarioAnalise[];
}

function getAvaliacaoCor(media: number | null | undefined) {
  if (media == null) return "text-muted-foreground";
  if (media >= 4.5) return "text-green-600";
  if (media >= 3.5) return "text-yellow-500";
  return "text-red-600";
}

function getAvaliacaoEmoji(media: number | null | undefined) {
  if (media == null) return "⚪";
  if (media >= 4.5) return "⭐";
  if (media >= 3.5) return "▲";
  return "⚠️";
}

function formatMeses(n: number) {
  if (!n || Number.isNaN(n)) return "-";
  if (n < 12) return `${n} mês${n === 1 ? "" : "es"}`;
  const anos = Math.floor(n / 12);
  const meses = n % 12;
  if (meses === 0) return `${anos} ano${anos === 1 ? "" : "s"}`;
  return `${anos}a ${meses}m`;
}

const TopFuncionariosCards: React.FC<TopFuncionariosCardsProps> = ({ funcionarios }) => {
  console.log("🔍 DEBUG TopFuncionariosCards - Total funcionários recebidos:", funcionarios.length);
  console.log("🔍 DEBUG TopFuncionariosCards - Funcionários com avaliação:", funcionarios.filter(f => f.mediaAvaliacao !== null).length);
  console.log("🔍 DEBUG TopFuncionariosCards - Dados dos funcionários:", funcionarios.map(f => ({
    nome: f.nome_completo,
    mediaAvaliacao: f.mediaAvaliacao,
    departamento: f.bd_departamentos?.nome_departamento
  })));

  // Separar funcionários com e sem avaliação
  const funcionariosComAvaliacao = funcionarios.filter(f => f.mediaAvaliacao !== null);
  const funcionariosSemAvaliacao = funcionarios.filter(f => f.mediaAvaliacao === null);
  
  console.log("🔍 DEBUG TopFuncionariosCards - Com avaliação:", funcionariosComAvaliacao.length);
  console.log("🔍 DEBUG TopFuncionariosCards - Sem avaliação:", funcionariosSemAvaliacao.length);
  
  // Combinar: primeiro os com avaliação (ordenados por nota), depois os sem avaliação (ordenados por tempo de empresa)
  const funcionariosOrdenados = [
    ...funcionariosComAvaliacao.sort((a, b) => (b.mediaAvaliacao ?? 0) - (a.mediaAvaliacao ?? 0)),
    ...funcionariosSemAvaliacao.sort((a, b) => {
      const dataA = a.data_admissao ? new Date(a.data_admissao) : new Date();
      const dataB = b.data_admissao ? new Date(b.data_admissao) : new Date();
      return dataA.getTime() - dataB.getTime(); // Mais antigos primeiro
    })
  ].slice(0, 10);

  console.log("🔍 DEBUG TopFuncionariosCards - Funcionários ordenados:", funcionariosOrdenados.map(f => ({
    nome: f.nome_completo,
    media: f.mediaAvaliacao,
    temAvaliacao: f.mediaAvaliacao !== null
  })));

  return (
    <div className="space-y-4">
      {/* Header com estatísticas */}
      <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium">
            {funcionariosComAvaliacao.length} de {funcionarios.length} funcionários avaliados
          </span>
        </div>
        {funcionariosSemAvaliacao.length > 0 && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs">
              {funcionariosSemAvaliacao.length} sem avaliação (ordenados por tempo na empresa)
            </span>
          </div>
        )}
      </div>

      {/* Cards dos funcionários */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 animate-fade-in">
        {funcionariosOrdenados.map((f, index) => {
          const admDate = f.data_admissao ? new Date(f.data_admissao) : null;
          const now = new Date();
          const meses = admDate
            ? (now.getFullYear() - admDate.getFullYear()) * 12 + (now.getMonth() - admDate.getMonth())
            : null;
          
          const temAvaliacao = f.mediaAvaliacao !== null;
          
          return (
            <div
              key={f.id}
              className={`flex flex-col items-center bg-card rounded-xl shadow p-4 group transition hover:scale-105 border relative ${
                !temAvaliacao ? 'border-dashed border-muted-foreground/30' : ''
              }`}
            >
              {/* Posição no ranking */}
              <div className="absolute top-2 left-2">
                <Badge variant={index < 3 ? "default" : "secondary"} className="text-xs">
                  #{index + 1}
                </Badge>
              </div>

              {/* Indicador de tipo de ordenação */}
              {!temAvaliacao && (
                <div className="absolute top-2 right-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
              )}

              <div className="mb-3 mt-2">
                {f.imagem ? (
                  <img
                    src={f.imagem}
                    alt={f.nome_completo}
                    className="h-16 w-16 rounded-full object-cover border-4 border-muted shadow"
                  />
                ) : (
                  <span className="block h-16 w-16 rounded-full bg-muted" />
                )}
              </div>
              
              <div className="font-semibold text-center text-md">{f.nome_completo}</div>
              <div className="text-xs text-muted-foreground mb-2">{f.bd_funcoes?.nome_funcao ?? "--"}</div>
              
              {/* Avaliação ou indicador */}
              <div className="flex items-center gap-1 mb-1">
                {temAvaliacao ? (
                  <>
                    <span className={getAvaliacaoCor(f.mediaAvaliacao) + " text-lg font-bold drop-shadow"}>
                      {Number(f.mediaAvaliacao).toFixed(1)}
                    </span>
                    <span className="text-lg">{getAvaliacaoEmoji(f.mediaAvaliacao)}</span>
                  </>
                ) : (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-xs">Sem avaliação</span>
                  </div>
                )}
              </div>
              
              <div className="text-xs text-muted-foreground mb-2">
                {meses !== null ? formatMeses(meses) : "--"}
              </div>
              
              <div>
                <Badge variant={f.status === "Ativo" ? "outline" : "destructive"}>{f.status}</Badge>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mensagem explicativa se há poucos dados */}
      {funcionarios.length < 5 && (
        <div className="text-center text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
          <AlertCircle className="h-5 w-5 mx-auto mb-2" />
          Poucos funcionários encontrados com os filtros atuais. 
          {funcionariosComAvaliacao.length === 0 && " Nenhuma avaliação encontrada - considere realizar avaliações de desempenho."}
        </div>
      )}
    </div>
  );
};

export default TopFuncionariosCards;
