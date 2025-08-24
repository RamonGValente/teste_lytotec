
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatePickerWithRange } from "@/components/ui/date-picker-range";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { RefreshCw, SlidersHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ApontamentoEquipeFilters as FilterType } from "@/types/apontamentoEquipe";
import { Equipe } from "@/types/equipe";

interface ApontamentoEquipeFiltersProps {
  onFilter: (filters: FilterType) => void;
  equipes: Equipe[];
  isLoading?: boolean;
  onOpenMobileFilters?: () => void;
}

const ApontamentoEquipeFilters: React.FC<ApontamentoEquipeFiltersProps> = ({
  onFilter,
  equipes,
  isLoading = false,
  onOpenMobileFilters
}) => {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);
  const [equipeId, setEquipeId] = React.useState<string | undefined>(undefined);

  const handleFilter = () => {
    onFilter({
      data_inicio: dateRange?.from,
      data_fim: dateRange?.to,
      equipe_id: equipeId
    });
  };

  const handleReset = () => {
    setDateRange(undefined);
    setEquipeId(undefined);
    onFilter({});
  };

  // Auto-filter when date or equipe changes
  React.useEffect(() => {
    handleFilter();
  }, [dateRange, equipeId]);

  return (
    <>
      {/* Mobile Filter Button - Improved styling and positioning */}
      <div className="md:hidden flex justify-end mb-4">
        <Button 
          onClick={onOpenMobileFilters}
          variant="outline"
          size="xs"
          className="h-8 w-[100px] px-2 flex items-center justify-center"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>
      
      {/* Desktop Filters */}
      <Card className="hidden md:block">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dateRange">Período</Label>
              <DatePickerWithRange
                value={dateRange}
                onChange={setDateRange}
                id="dateRange"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="equipe">Equipe</Label>
              <Select
                value={equipeId}
                onValueChange={setEquipeId}
              >
                <SelectTrigger id="equipe">
                  <SelectValue placeholder="Selecione uma equipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {equipes.map((equipe) => (
                    <SelectItem key={equipe.id} value={equipe.id}>
                      {equipe.nome_equipe}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isLoading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ApontamentoEquipeFilters;
