
import React from "react";
import { EquipeAnalise } from "@/hooks/dashboard/useRhDashboardData";
import { Badge } from "@/components/ui/badge";
import { BarChart3, AlertCircle, Users, TrendingUp } from "lucide-react";

interface TopEquipesCardsProps {
  equipes: EquipeAnalise[];
}

function getEquipeAvaliacaoCor(media: number | null | undefined) {
  if (media == null) return "text-muted-foreground";
  if (media >= 4.5) return "text-green-600";
  if (media >= 3.5) return "text-yellow-500";
  return "text-red-600";
}

const TopEquipesCards: React.FC<TopEquipesCardsProps> = ({ equipes }) => {
  console.log("🔍 DEBUG TopEquipesCards - Total equipes recebidas:", equipes.length);
  console.log("🔍 DEBUG TopEquipesCards - Equipes com avaliação:", equipes.filter(e => e.mediaEquipe !== null).length);
  console.log("🔍 DEBUG TopEquipesCards - Dados das equipes:", equipes.map(e => ({
    nome: e.nome_equipe,
    mediaEquipe: e.mediaEquipe,
    qtdColaboradores: e.qtdColaboradores
  })));

  // Separar equipes com e sem avaliação
  const equipesComAvaliacao = equipes.filter(e => e.mediaEquipe !== null);
  const equipesSemAvaliacao = equipes.filter(e => e.mediaEquipe === null);
  
  console.log("🔍 DEBUG TopEquipesCards - Com avaliação:", equipesComAvaliacao.length);
  console.log("🔍 DEBUG TopEquipesCards - Sem avaliação:", equipesSemAvaliacao.length);
  
  // Combinar: primeiro as com avaliação (ordenadas por nota), depois as sem avaliação (ordenadas por número de colaboradores)
  const equipesOrdenadas = [
    ...equipesComAvaliacao.sort((a, b) => (b.mediaEquipe ?? 0) - (a.mediaEquipe ?? 0)),
    ...equipesSemAvaliacao.sort((a, b) => (b.qtdColaboradores ?? 0) - (a.qtdColaboradores ?? 0))
  ].slice(0, 5);

  console.log("🔍 DEBUG TopEquipesCards - Equipes ordenadas:", equipesOrdenadas.map(e => ({
    nome: e.nome_equipe,
    media: e.mediaEquipe,
    temAvaliacao: e.mediaEquipe !== null
  })));

  return (
    <div className="space-y-4">
      {/* Header com estatísticas */}
      <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            {equipesComAvaliacao.length} de {equipes.length} equipes avaliadas
          </span>
        </div>
        {equipesSemAvaliacao.length > 0 && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs">
              {equipesSemAvaliacao.length} sem avaliação (ordenadas por tamanho)
            </span>
          </div>
        )}
      </div>

      {/* Cards das equipes */}
      <div className="flex flex-wrap gap-4 animate-fade-in">
        {equipesOrdenadas.map((eq, index) => {
          const temAvaliacao = eq.mediaEquipe !== null;
          
          return (
            <div
              key={eq.id}
              className={`flex flex-col flex-1 min-w-[220px] max-w-[260px] bg-card rounded-lg shadow p-4 group border hover:scale-105 transition relative ${
                !temAvaliacao ? 'border-dashed border-muted-foreground/30' : ''
              }`}
            >
              {/* Posição no ranking */}
              <div className="absolute top-2 right-2">
                <Badge variant={index < 3 ? "default" : "secondary"} className="text-xs">
                  #{index + 1}
                </Badge>
              </div>

              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold pr-8">{eq.nome_equipe}</div>
                <div className="flex items-center gap-1">
                  {temAvaliacao ? (
                    <BarChart3 className="h-5 w-5 text-primary" />
                  ) : (
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Avaliação ou indicador */}
              <div className="flex items-center gap-2 mb-1">
                {temAvaliacao ? (
                  <>
                    <span className={getEquipeAvaliacaoCor(eq.mediaEquipe) + " text-lg font-bold"}>
                      {Number(eq.mediaEquipe).toFixed(1)}
                    </span>
                    <span className="text-xs text-muted-foreground">Média Avaliação</span>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Sem avaliação</span>
                  </div>
                )}
              </div>

              <div className="flex-1" />

              {/* Informações da equipe */}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {eq.qtdColaboradores ?? 0}
                </Badge>
                <span className="text-xs text-muted-foreground">colaboradores</span>
              </div>

              {/* Indicador adicional para equipes sem avaliação */}
              {!temAvaliacao && (
                <div className="mt-2 text-xs text-muted-foreground italic">
                  Equipe ainda não avaliada
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mensagem explicativa se há poucos dados */}
      {equipes.length < 3 && (
        <div className="text-center text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg">
          <AlertCircle className="h-5 w-5 mx-auto mb-2" />
          Poucas equipes encontradas com os filtros atuais.
          {equipesComAvaliacao.length === 0 && " Nenhuma avaliação de equipe encontrada - considere implementar avaliações de desempenho por equipe."}
        </div>
      )}
    </div>
  );
};

export default TopEquipesCards;
