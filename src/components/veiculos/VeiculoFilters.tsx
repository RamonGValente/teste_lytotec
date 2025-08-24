import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VeiculoFilterParams } from "@/types/veiculo";
import { FilterX, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface VeiculoFiltersProps {
  filters: VeiculoFilterParams;
  onFilterChange: (name: keyof VeiculoFilterParams, value: string) => void;
  onResetFilters: () => void;
  isLoading?: boolean;
  totalVeiculos?: number;
}

const VeiculoFilters: React.FC<VeiculoFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  isLoading = false,
  totalVeiculos = 0,
}) => {
  const [placas, setPlacas] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [placaInput, setPlacaInput] = useState(filters.placa || "");

  useEffect(() => {
    const fetchPlacas = async () => {
      const { data, error } = await supabase
        .from("bd_caminhoes_equipamentos")
        .select("placa")
        .not("placa", "is", null)
        .order("placa");

      if (error) {
        console.error("Erro ao buscar placas:", error.message);
      } else {
        const unicos = [...new Set(data.map((item) => item.placa))];
        setPlacas(unicos);
      }
    };

    fetchPlacas();
  }, []);

  const placasFiltradas = placas.filter((p) =>
    p.toLowerCase().includes(placaInput.toLowerCase())
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Campo Placa com dropdown personalizado */}
          <div className="space-y-2 relative">
            <Label className="text-sm font-medium">Placa</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por placa"
                className="pl-8"
                value={placaInput}
                onChange={(e) => {
                  setPlacaInput(e.target.value);
                  onFilterChange("placa", e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              />
              {showDropdown && placasFiltradas.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-48 overflow-y-auto shadow">
                  {placasFiltradas.map((placa, index) => (
                    <li
                      key={index}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onMouseDown={() => {
                        setPlacaInput(placa);
                        onFilterChange("placa", placa);
                        setShowDropdown(false);
                      }}
                    >
                      {placa}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Campo Frota/Número */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Frota/Número</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por frota ou número"
                value={filters.frota || ""}
                onChange={(e) => onFilterChange("frota", e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Campo Situação */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Situação</Label>
            <Select
              value={filters.situacao || ""}
              onValueChange={(value) =>
                onFilterChange("situacao", value === "_all" ? "" : value)
              }
            >
              <SelectTrigger className="pl-2">
                <SelectValue placeholder="Todas as situações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">Todas as situações</SelectItem>
                <SelectItem value="Operando">Operando</SelectItem>
                <SelectItem value="Em Manutenção">Em Manutenção</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botão de limpar filtros */}
        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={onResetFilters}>
            <FilterX className="h-4 w-4 mr-2" />
            Limpar filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VeiculoFilters;
