
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { CentroCustoFilter } from "@/types/centroCusto";
import { useIsMobile, useIsSmallScreen } from "@/hooks/use-mobile";

interface CentroCustoFiltersProps {
  filters: CentroCustoFilter;
  onFilterChange: (name: string, value: string) => void;
  onResetFilters: () => void;
}

const CentroCustoFilters: React.FC<CentroCustoFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters
}) => {
  const [codigoCentroCusto, setCodigoCentroCusto] = useState(filters.codigo_centro_custo || "");
  const isMobile = useIsMobile();
  const isSmallScreen = useIsSmallScreen();

  // Atualizar campos de filtro quando os filtros externos mudarem
  useEffect(() => {
    setCodigoCentroCusto(filters.codigo_centro_custo || "");
  }, [filters]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, field: string, value: string) => {
    if (e.key === "Enter") {
      onFilterChange(field, value);
    }
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className={`p-2.5 sm:p-4 md:p-6 space-y-2 sm:space-y-3 md:space-y-4 ${isSmallScreen ? 'max-w-full' : ''}`}>
        <h2 className="text-base sm:text-lg font-medium">Filtros</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
          <div className="space-y-1">
            <label htmlFor="codigo" className="text-xs sm:text-sm font-medium">Código</label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input 
                id="codigo" 
                placeholder="Buscar por código" 
                className={`pl-7 ${isSmallScreen ? 'h-8 text-xs' : isMobile ? 'h-9 text-sm' : 'h-10 text-sm'}`}
                value={codigoCentroCusto} 
                onChange={e => setCodigoCentroCusto(e.target.value)} 
                onKeyDown={e => handleKeyDown(e, "codigo_centro_custo", codigoCentroCusto)} 
                onBlur={() => onFilterChange("codigo_centro_custo", codigoCentroCusto)} 
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label htmlFor="situacao" className="text-xs sm:text-sm font-medium">Situação</label>
            <Select 
              value={filters.situacao || "todos"} 
              onValueChange={value => onFilterChange("situacao", value === "todos" ? "" : value)}
            >
              <SelectTrigger 
                id="situacao" 
                className={`${isSmallScreen ? 'h-8 text-xs' : isMobile ? 'h-9 text-sm' : 'h-10 text-sm'}`}
              >
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={onResetFilters}
            size={isSmallScreen ? "xs" : isMobile ? "mobile-sm" : "default"}
            className={`${isSmallScreen ? 'h-7 px-2 text-xs' : isMobile ? 'h-8 px-3 text-xs' : 'h-9 px-4 text-sm'} flex items-center gap-1 sm:gap-2`}
          >
            <X className={`${isSmallScreen ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
            <span>Limpar Filtros</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CentroCustoFilters;
