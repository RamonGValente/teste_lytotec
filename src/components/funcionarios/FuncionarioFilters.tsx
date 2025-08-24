
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FuncionarioFilter } from "@/types/funcionario";
import React from "react";
import { FilterX, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsSmallScreen, useIsMobile } from "@/hooks/use-mobile";

interface FuncionarioFiltersProps {
  filters: FuncionarioFilter;
  onFilterChange: (field: keyof FuncionarioFilter, value: any) => void;
  onReset: () => void;
}

const FuncionarioFilters: React.FC<FuncionarioFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  const isSmallScreen = useIsSmallScreen();
  const isMobile = useIsMobile();

  const handleSearchInputChange = (field: keyof FuncionarioFilter, value: string) => {
    onFilterChange(field, value);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Filtros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <div className="space-y-2">
            <Label htmlFor="nome_completo">Nome do Funcionário</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="nome_completo"
                placeholder="Buscar por nome"
                className="pl-8"
                value={filters.nome_completo || ""}
                onChange={(e) => handleSearchInputChange("nome_completo", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="centro_custo_id">Centro de Custo</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="centro_custo_id"
                placeholder="Buscar centro de custo"
                className="pl-8"
                value={filters.centro_custo_id || ""}
                onChange={(e) => handleSearchInputChange("centro_custo_id", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="departamento_id">Departamento</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="departamento_id"
                placeholder="Buscar departamento"
                className="pl-8"
                value={filters.departamento_id || ""}
                onChange={(e) => handleSearchInputChange("departamento_id", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="funcao_id">Função</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="funcao_id"
                placeholder="Buscar função"
                className="pl-8"
                value={filters.funcao_id || ""}
                onChange={(e) => handleSearchInputChange("funcao_id", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={filters.status || "todos"}
              onValueChange={(value) => onFilterChange("status", value === "todos" ? undefined : value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecione um status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Aviso Prévio">Aviso Prévio</SelectItem>
                <SelectItem value="Inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            variant="outline" 
            onClick={onReset} 
            className="gap-2"
            size={isSmallScreen ? "xs" : isMobile ? "mobile-sm" : "default"}
          >
            <FilterX className={`${isSmallScreen ? 'h-3 w-3' : 'h-4 w-4'}`} />
            Limpar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FuncionarioFilters;
