import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { EmpresaFilterParams } from "@/types/empresa";
import { supabase } from "@/integrations/supabase/client";

interface EmpresaFiltersProps {
  filters: EmpresaFilterParams;
  onFilterChange: (key: keyof EmpresaFilterParams, value: string) => void;
  onResetFilters: () => void;
}

const EmpresaFilters: React.FC<EmpresaFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
}) => {
  const [empresas, setEmpresas] = useState<
    { id: string; nome_empresa: string; cnpj: string; telefone?: string }[]
  >([]);

  useEffect(() => {
    const fetchEmpresas = async () => {
      const { data, error } = await supabase
        .from("bd_empresas")
        .select("id, nome_empresa, cnpj, telefone")
        .order("nome_empresa", { ascending: true });

      if (!error && data) {
        setEmpresas(data);
      }
    };

    fetchEmpresas();
  }, []);

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6 space-y-4">
        <h2 className="text-lg font-medium">Filtros</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">

          {/* Nome da Empresa */}
          <div className="space-y-2">
            <label htmlFor="nome" className="text-sm font-medium">
              Nome da Empresa
            </label>
            <div className="relative">
              <Input
                list="empresaList"
                id="nome"
                placeholder="Buscar por nome"
                className="pl-2"
                value={filters.nome_empresa || ""}
                onChange={(e) => onFilterChange("nome_empresa", e.target.value)}
              />
              <datalist id="empresaList">
                {empresas.map((empresa) => (
                  <option key={empresa.id} value={empresa.nome_empresa} />
                ))}
              </datalist>
            </div>
          </div>

          {/* CNPJ */}
          <div className="space-y-2">
            <label htmlFor="cnpj" className="text-sm font-medium">
              CNPJ
            </label>
            <div className="relative">
              <Input
                list="cnpjList"
                id="cnpj"
                placeholder="Buscar por CNPJ"
                className="pl-2"
                value={filters.cnpj || ""}
                onChange={(e) => onFilterChange("cnpj", e.target.value)}
              />
              <datalist id="cnpjList">
                {empresas.map((empresa) => (
                  <option key={empresa.id} value={empresa.cnpj} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Telefone (com datalist) */}
          <div className="space-y-2">
            <label htmlFor="telefone" className="text-sm font-medium">
              Telefone
            </label>
            <div className="relative">
              <Input
                list="telefoneList"
                id="telefone"
                placeholder="Buscar por telefone"
                className="pl-2"
                value={filters.telefone || ""}
                onChange={(e) => onFilterChange("telefone", e.target.value)}
              />
              <datalist id="telefoneList">
                {empresas
                  .filter((empresa) => empresa.telefone)
                  .map((empresa) => (
                    <option key={empresa.id} value={empresa.telefone} />
                  ))}
              </datalist>
            </div>
          </div>

          {/* Situação */}
          <div className="space-y-2">
            <label htmlFor="situacao" className="text-sm font-medium">
              Situação
            </label>
            <Select
              value={filters.situacao || ""}
              onValueChange={(value) => onFilterChange("situacao", value)}
            >
              <SelectTrigger id="situacao">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="Ativa">Ativa</SelectItem>
                <SelectItem value="Inativa">Inativa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onResetFilters}>
            <X className="mr-2 h-4 w-4" />
            Limpar Filtros
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmpresaFilters;
