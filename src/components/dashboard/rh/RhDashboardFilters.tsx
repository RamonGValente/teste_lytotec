
import React from "react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { FilterX } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface RhDashboardFiltersProps {
  period: "6m" | "12m" | "all";
  setPeriod: (val: "6m" | "12m" | "all") => void;
  departamento: string;
  setDepartamento: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  funcao: string;
  setFuncao: (val: string) => void;
  departamentosOptions: Option[];
  funcoesOptions: Option[];
  equipe: string;
  setEquipe: (val: string) => void;
  equipesOptions: Option[];
  nomeFuncionario: string;
  setNomeFuncionario: (val: string) => void;
  onResetFilters?: () => void;
  filtrosAtivos?: number;
}

export const statusOptions: Option[] = [
  { label: "Todos", value: "_all" },
  { label: "Ativo", value: "Ativo" },
  { label: "Aviso Prévio", value: "Aviso Prévio" },
  { label: "Inativo", value: "Inativo" },
];

const periodOptions: { label: string; value: "6m" | "12m" | "all" }[] = [
  { label: "Últimos 6 meses", value: "6m" },
  { label: "Últimos 12 meses", value: "12m" },
  { label: "Todos os tempos", value: "all" },
];

const RhDashboardFilters: React.FC<RhDashboardFiltersProps> = ({
  period, setPeriod,
  departamento, setDepartamento,
  status, setStatus,
  funcao, setFuncao,
  departamentosOptions,
  funcoesOptions,
  equipe, setEquipe,
  equipesOptions,
  nomeFuncionario, setNomeFuncionario,
  onResetFilters,
  filtrosAtivos
}) => {
  return (
    <Card className="p-4 flex flex-wrap gap-4 items-end mb-2">
      {/* Filtros (igual) */}
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1">Período</label>
        <Select value={period} onValueChange={v => setPeriod(v as "6m" | "12m" | "all")}>
          <SelectTrigger className="w-40 text-xs h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {periodOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1">Departamento</label>
        <Select value={departamento} onValueChange={setDepartamento}>
          <SelectTrigger className="w-44 text-xs h-9">
            <SelectValue placeholder="Departamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Todos</SelectItem>
            {departamentosOptions.map(dep => (
              <SelectItem key={dep.value} value={dep.value}>{dep.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1">Função</label>
        <Select value={funcao} onValueChange={setFuncao}>
          <SelectTrigger className="w-44 text-xs h-9">
            <SelectValue placeholder="Função" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Todos</SelectItem>
            {funcoesOptions.map(fn => (
              <SelectItem key={fn.value} value={fn.value}>{fn.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1">Equipe</label>
        <Select value={equipe} onValueChange={setEquipe}>
          <SelectTrigger className="w-40 text-xs h-9">
            <SelectValue placeholder="Equipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Todas</SelectItem>
            {equipesOptions.map(eq => (
              <SelectItem key={eq.value} value={eq.value}>{eq.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1">Status</label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-32 text-xs h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1">Buscar Funcionário</label>
        <Input
          placeholder="Nome do funcionário"
          value={nomeFuncionario}
          className="text-xs h-9"
          onChange={e => setNomeFuncionario(e.target.value)}
        />
      </div>
      {/* Botão "Limpar Filtros" */}
      {onResetFilters && (
        <div className="ml-auto">
          <button
            onClick={onResetFilters}
            className="flex items-center gap-2 border rounded px-3 py-2 text-xs text-muted-foreground hover:bg-accent transition"
          >
            <FilterX className="w-4 h-4" />
            Limpar Filtros
            {filtrosAtivos !== undefined && filtrosAtivos > 0 && (
              <span className="ml-1 bg-primary/10 px-2 rounded-full">{filtrosAtivos}</span>
            )}
          </button>
        </div>
      )}
    </Card>
  );
};

export default RhDashboardFilters;
