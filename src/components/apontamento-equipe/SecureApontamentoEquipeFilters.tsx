
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { ApontamentoEquipeFilters } from "@/types/apontamentoEquipe";
import { Equipe } from "@/types/equipe";

interface SecureApontamentoEquipeFiltersProps {
  filters: ApontamentoEquipeFilters;
  onFilterChange: (name: keyof ApontamentoEquipeFilters, value: any) => void;
  onResetFilters: () => void;
  equipes: Equipe[];
  allowedTeamIds: string[];
  isLoading: boolean;
}

const SecureApontamentoEquipeFilters: React.FC<SecureApontamentoEquipeFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  equipes,
  allowedTeamIds,
  isLoading
}) => {
  // Filter teams to only show allowed ones
  const allowedEquipes = equipes.filter(equipe => allowedTeamIds.includes(equipe.id));

  const handleDateChange = (field: 'data_inicio' | 'data_fim', date: Date | undefined) => {
    onFilterChange(field, date);
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && value !== '' && value !== 'all'
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span className="ml-2 text-sm">Carregando filtros...</span>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold text-sm">Filtros</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-7 px-2 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Data Início */}
        <div className="space-y-2">
          <Label htmlFor="data_inicio" className="text-xs font-medium">
            Data Início
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-9",
                  !filters.data_inicio && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.data_inicio ? (
                  format(filters.data_inicio, "dd/MM/yyyy", { locale: ptBR })
                ) : (
                  "Selecionar data"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.data_inicio}
                onSelect={(date) => handleDateChange('data_inicio', date)}
                locale={ptBR}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Data Fim */}
        <div className="space-y-2">
          <Label htmlFor="data_fim" className="text-xs font-medium">
            Data Fim
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-9",
                  !filters.data_fim && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.data_fim ? (
                  format(filters.data_fim, "dd/MM/yyyy", { locale: ptBR })
                ) : (
                  "Selecionar data"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.data_fim}
                onSelect={(date) => handleDateChange('data_fim', date)}
                locale={ptBR}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Equipe */}
        <div className="space-y-2">
          <Label htmlFor="equipe_id" className="text-xs font-medium">
            Equipe
          </Label>
          <Select
            value={filters.equipe_id || 'all'}
            onValueChange={(value) => onFilterChange('equipe_id', value === 'all' ? undefined : value)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Todas as equipes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as equipes</SelectItem>
              {allowedEquipes.map((equipe) => (
                <SelectItem key={equipe.id} value={equipe.id}>
                  {equipe.nome_equipe}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status/Info */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Acesso</Label>
          <div className="flex items-center h-9 px-3 py-2 bg-muted rounded-md">
            <span className="text-xs text-muted-foreground">
              {allowedEquipes.length} de {equipes.length} equipes
            </span>
          </div>
        </div>
      </div>

      {allowedEquipes.length === 0 && (
        <div className="text-center py-6 text-muted-foreground">
          <p className="text-sm">Você não tem acesso a nenhuma equipe.</p>
          <p className="text-xs mt-1">Entre em contato com o administrador para solicitar permissões.</p>
        </div>
      )}
    </div>
  );
};

export default SecureApontamentoEquipeFilters;
