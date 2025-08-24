import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FuncaoFilter } from "@/types/funcao";
import { useIsSmallScreen, useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

interface FuncaoFiltersProps {
  filters: FuncaoFilter;
  onFilterChange: (field: keyof FuncaoFilter, value: string) => void;
  onResetFilters: () => void;
}

const FuncaoFilters: React.FC<FuncaoFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
}) => {
  const isSmallScreen = useIsSmallScreen();
  const isMobile = useIsMobile();

  // Buscar lista de funções no Supabase
  const [funcoes, setFuncoes] = useState<{ id: string; nome_funcao: string }[]>([]);

  useEffect(() => {
    const fetchFuncoes = async () => {
      const { data, error } = await supabase
        .from("bd_funcoes")
        .select("id, nome_funcao")
        .order("nome_funcao", { ascending: true });

      if (!error && data) {
        setFuncoes(data);
      }
    };

    fetchFuncoes();
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label htmlFor="nome_funcao" className="text-sm font-medium">
            Nome da Função
          </label>
          <div className="relative">
            <Input
              list="funcaoList"
              id="nome_funcao"
              placeholder="Buscar por nome"
              className="pl-2"
              value={filters.nome_funcao || ""}
              onChange={(e) => onFilterChange("nome_funcao", e.target.value)}
            />
            <datalist id="funcaoList">
              {funcoes.map((funcao) => (
                <option key={funcao.id} value={funcao.nome_funcao} />
              ))}
            </datalist>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={onResetFilters}
          disabled={!Object.values(filters).some(Boolean)}
          size={isSmallScreen ? "xs" : isMobile ? "mobile-sm" : "sm"}
          className="flex items-center gap-2"
        >
          <X className={`${isSmallScreen ? "h-3 w-3" : "h-4 w-4"}`} />
          Limpar Filtros
        </Button>
      </div>
    </div>
  );
};

export default FuncaoFilters;
