
import React from "react";
import { Card } from "@/components/ui/card";
import { Truck, Activity, Settings, AlertTriangle, Wrench, Clock } from "lucide-react";
import { MaquinasKpis } from "@/types/maquinas";

interface MaquinasKpiCardsProps {
  kpis: MaquinasKpis;
  isLoading: boolean;
}

export default function MaquinasKpiCards({ kpis, isLoading }: MaquinasKpiCardsProps) {
  // Validação de consistência dos dados
  const somaStatus = kpis.ativosOperando + kpis.ativosDisponiveis + kpis.ativosManutencao;
  const isInconsistent = somaStatus !== kpis.totalAtivos && kpis.totalAtivos > 0;

  return (
    <div className="space-y-4">
      {/* Indicador de inconsistência */}
      {isInconsistent && !isLoading && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">
              Inconsistência detectada: Total de ativos ({kpis.totalAtivos}) não bate com soma dos status ({somaStatus})
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
        {/* Total de Ativos - Azul */}
        <Card className="relative overflow-hidden border-0 shadow-sm bg-gradient-to-br from-slate-50 to-slate-100/80">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10" />
          <div className="relative flex flex-col items-center p-6 pb-3">
            <div className="p-2 rounded-lg bg-blue-100 mb-3">
              <Truck className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-sm text-muted-foreground mb-2 text-center">Total de Ativos</span>
            <span className="text-2xl font-bold text-blue-900">
              {isLoading ? "..." : kpis.totalAtivos}
            </span>
          </div>
        </Card>

        {/* Operando Agora - Verde Água */}
        <Card className="relative overflow-hidden border-0 shadow-sm bg-gradient-to-br from-slate-50 to-slate-100/80">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/10" />
          <div className="relative flex flex-col items-center p-6 pb-3">
            <div className="p-2 rounded-lg bg-emerald-100 mb-3">
              <Activity className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-sm text-muted-foreground mb-2 text-center">Operando Hoje</span>
            <span className="text-2xl font-bold text-emerald-900">
              {isLoading ? "..." : kpis.ativosOperando}
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              Com apontamento hoje
            </span>
          </div>
        </Card>

        {/* Disponíveis - Roxo */}
        <Card className="relative overflow-hidden border-0 shadow-sm bg-gradient-to-br from-slate-50 to-slate-100/80">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-violet-600/10" />
          <div className="relative flex flex-col items-center p-6 pb-3">
            <div className="p-2 rounded-lg bg-violet-100 mb-3">
              <Settings className="h-4 w-4 text-violet-600" />
            </div>
            <span className="text-sm text-muted-foreground mb-2 text-center">Disponíveis</span>
            <span className="text-2xl font-bold text-violet-900">
              {isLoading ? "..." : kpis.ativosDisponiveis}
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              Prontos para uso
            </span>
          </div>
        </Card>

        {/* Em Manutenção - Laranja */}
        <Card className="relative overflow-hidden border-0 shadow-sm bg-gradient-to-br from-slate-50 to-slate-100/80">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-amber-600/10" />
          <div className="relative flex flex-col items-center p-6 pb-3">
            <div className="p-2 rounded-lg bg-amber-100 mb-3">
              <Wrench className="h-4 w-4 text-amber-600" />
            </div>
            <span className="text-sm text-muted-foreground mb-2 text-center">Em Manutenção</span>
            <span className="text-2xl font-bold text-amber-900">
              {isLoading ? "..." : kpis.ativosManutencao}
            </span>
            <span className="text-xs text-muted-foreground mt-1">
              Status no cadastro
            </span>
          </div>
        </Card>

        {/* Chamados Abertos - Verde */}
        <Card className="relative overflow-hidden border-0 shadow-sm bg-gradient-to-br from-slate-50 to-slate-100/80">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-green-600/10" />
          <div className="relative flex flex-col items-center p-6 pb-3">
            <div className="p-2 rounded-lg bg-green-100 mb-3">
              <AlertTriangle className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-sm text-muted-foreground mb-2 text-center">Chamados Abertos</span>
            <span className="text-2xl font-bold text-green-900">
              {isLoading ? "..." : kpis.chamadosAbertos}
            </span>
          </div>
        </Card>

        {/* Tempo Médio Reparo - Índigo */}
        <Card className="relative overflow-hidden border-0 shadow-sm bg-gradient-to-br from-slate-50 to-slate-100/80">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-indigo-600/10" />
          <div className="relative flex flex-col items-center p-6 pb-3">
            <div className="p-2 rounded-lg bg-indigo-100 mb-3">
              <Clock className="h-4 w-4 text-indigo-600" />
            </div>
            <span className="text-sm text-muted-foreground mb-2 text-center">Tempo Médio Reparo</span>
            <span className="text-2xl font-bold text-indigo-900">
              {isLoading ? "..." : `${kpis.tempoMedioReparo} dias`}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
