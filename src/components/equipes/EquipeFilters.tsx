import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { EquipeFilter } from "@/types/equipe";
import { X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";

interface EquipeFiltersProps {
  filters: EquipeFilter;
  onFilterChange: (field: keyof EquipeFilter, value: string) => void;
  onResetFilters: () => void;
  encarregados: any[];
  apontadores: any[];
}

const EquipeFilters: React.FC<EquipeFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  encarregados,
  apontadores
}) => {
  const isMobile = useIsMobile();

  const [equipes, setEquipes] = useState<{ id: string; nome_equipe: string }[]>([]);

  useEffect(() => {
    const fetchEquipes = async () => {
      const { data, error } = await supabase
        .from("bd_equipes")
        .select("id, nome_equipe")
        .order("nome_equipe", { ascending: true });

      if (!error && data) {
        setEquipes(data);
      }
    };

    fetchEquipes();
  }, []);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="filter-nome">Nome da Equipe</Label>
            <Input
              id="filter-nome"
              list="equipeList"
              placeholder="Buscar por nome da equipe"
              value={filters.nome_equipe || ""}
              onChange={(e) => onFilterChange("nome_equipe", e.target.value)}
              className="h-10 md:h-9"
            />
            <datalist id="equipeList">
              {equipes.map((equipe) => (
                <option key={equipe.id} value={equipe.nome_equipe} />
              ))}
            </datalist>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-encarregado">Encarregado</Label>
            <Select
              value={filters.encarregado_id || "todos"}
              onValueChange={(value) => onFilterChange("encarregado_id", value)}
            >
              <SelectTrigger id="filter-encarregado" className="h-10 md:h-9">
                <SelectValue placeholder="Selecionar encarregado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {encarregados.map((encarregado) => (
                  <SelectItem key={encarregado.id} value={encarregado.id}>
                    {encarregado.nome_completo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="filter-apontador">Apontador</Label>
            <Select
              value={filters.apontador_id || "todos"}
              onValueChange={(value) => onFilterChange("apontador_id", value)}
            >
              <SelectTrigger id="filter-apontador" className="h-10 md:h-9">
                <SelectValue placeholder="Selecionar apontador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {apontadores.map((apontador) => (
                  <SelectItem key={apontador.id} value={apontador.id}>
                    {apontador.nome_completo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button
            variant="outline"
            size={isMobile ? "lg" : "sm"}
            onClick={onResetFilters}
            className="h-10 px-4 md:h-9 md:px-3"
          >
            <X className="h-4 w-4 mr-2" />
            Limpar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EquipeFilters;
