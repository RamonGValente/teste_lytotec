import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { DepartamentoFilter } from "@/types/departamento";
import { useQuery } from "@tanstack/react-query";
import { getEmpresas } from "@/services/empresaService";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client"; // ajuste o caminho se necessário

interface DepartamentoFiltersProps {
  filters: DepartamentoFilter;
  onFilterChange: (name: string, value: string) => void;
  onResetFilters: () => void;
}

const DepartamentoFilters: React.FC<DepartamentoFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters
}) => {
  const isMobile = useIsMobile();
  const [nome, setNome] = useState(filters.nome_departamento || "");
  const [departamentos, setDepartamentos] = useState<{ id: string; nome_departamento: string }[]>([]);

  const { data: empresas } = useQuery({
    queryKey: ['empresas'],
    queryFn: () => getEmpresas({})
  });

  useEffect(() => {
    setNome(filters.nome_departamento || "");
  }, [filters.nome_departamento]);

  // Carregar lista de departamentos para o datalist
  useEffect(() => {
    const fetchDepartamentos = async () => {
      const { data, error } = await supabase
        .from("bd_departamentos")
        .select("id, nome_departamento")
        .order("nome_departamento", { ascending: true });

      if (!error && data) {
        setDepartamentos(data);
      }
    };

    fetchDepartamentos();
  }, []);

  const handleSearch = () => {
    onFilterChange("nome_departamento", nome);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4 bg-card rounded-lg border p-4 mx-0 my-[20px]">
      <h2 className="text-lg font-medium">Filtros</h2>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mx-0 px-0 py-px">
        <div className="space-y-2">
          <label htmlFor="nome" className="text-sm font-medium">
            Nome do Departamento
          </label>
          <div className="flex w-full">
            <Input
              id="nome"
              list="departamentosList"
              placeholder="Digite ou selecione..."
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-10 md:h-9"
            />
            <datalist id="departamentosList">
              {departamentos.map(dep => (
                <option key={dep.id} value={dep.nome_departamento} />
              ))}
            </datalist>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSearch}
              className="ml-1 h-10 w-10 md:h-9 md:w-9"
              type="button"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="empresa" className="text-sm font-medium">
            Empresa
          </label>
          <Select
            value={filters.empresa_id || "todos"}
            onValueChange={value => onFilterChange("empresa_id", value === "todos" ? "" : value)}
          >
            <SelectTrigger id="empresa" className="h-10 md:h-9">
              <SelectValue placeholder="Todas as empresas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as empresas</SelectItem>
              {empresas?.map(empresa => (
                <SelectItem key={empresa.id} value={empresa.id}>
                  {empresa.nome_empresa}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={onResetFilters}
            type="button"
            className="w-full md:w-auto h-10 md:h-9"
            size={isMobile ? "lg" : "default"}
          >
            <X className="mr-2 h-4 w-4" />
            Limpar Filtros
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DepartamentoFilters;
