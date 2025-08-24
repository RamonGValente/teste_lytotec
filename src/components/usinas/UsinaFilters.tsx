
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UsinaFilters as Filters } from "@/types/usina";
import { X } from "lucide-react";
import { useIsSmallScreen, useIsMobile } from "@/hooks/use-mobile";

interface UsinaFiltersProps {
  filters: Filters;
  onFilterChange: (key: keyof Filters, value: string) => void;
  onResetFilters: () => void;
}

const UsinaFilters: React.FC<UsinaFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
}) => {
  const isSmallScreen = useIsSmallScreen();
  const isMobile = useIsMobile();

  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label htmlFor="nome_usina" className="text-sm font-medium mb-1 block">
            Nome da Usina
          </label>
          <Input
            id="nome_usina"
            placeholder="Buscar por nome..."
            value={filters.nome_usina || ""}
            onChange={(e) => onFilterChange("nome_usina", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="endereco" className="text-sm font-medium mb-1 block">
            Endereço
          </label>
          <Input
            id="endereco"
            placeholder="Buscar por endereço..."
            value={filters.endereco || ""}
            onChange={(e) => onFilterChange("endereco", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="telefone" className="text-sm font-medium mb-1 block">
            Telefone
          </label>
          <Input
            id="telefone"
            placeholder="Buscar por telefone..."
            value={filters.telefone || ""}
            onChange={(e) => onFilterChange("telefone", e.target.value)}
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button
          variant="outline"
          onClick={onResetFilters}
          size={isSmallScreen ? "xs" : isMobile ? "mobile-sm" : "default"}
          className="flex items-center gap-2"
        >
          <X className={`${isSmallScreen ? 'h-3 w-3' : 'h-4 w-4'}`} />
          Limpar Filtros
        </Button>
      </div>
    </div>
  );
};

export default UsinaFilters;
