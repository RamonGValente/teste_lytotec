import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Search, X } from "lucide-react";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { ProgramacaoEntregaFilters as FiltersType } from "@/types/programacaoEntrega";
import { supabase } from "@/integrations/supabase/client";
import {
  normalizeDateToBrazilianNoon,
  formatBrazilianDateToString,
  formatBrazilianDateForDisplay,
} from "@/utils/timezoneUtils";

interface FiltersProps {
  filters: FiltersType;
  onFilterChange: (name: keyof FiltersType, value: any) => void;
  onResetFilters: () => void;
}

const ProgramacaoEntregaFilters: React.FC<FiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
}) => {
  const [centrosCusto, setCentrosCusto] = useState<any[]>([]);
  const [numerosRequisicoes, setNumerosRequisicoes] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(filters.data_inicio || undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(filters.data_fim || undefined);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: centrosData } = await supabase
          .from("bd_centros_custo")
          .select("id, nome_centro_custo");

        const { data: requisicoesData } = await supabase
          .from("bd_requisicoes")
          .select("numero");

        setCentrosCusto(centrosData || []);
        setNumerosRequisicoes(requisicoesData || []);
      } catch (error) {
        console.error("Erro ao carregar dados dos filtros:", error);
      }
    };

    loadData();
  }, []);

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
    onFilterChange("data_inicio", date ? normalizeDateToBrazilianNoon(date) : undefined);
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
    onFilterChange("data_fim", date ? normalizeDateToBrazilianNoon(date) : undefined);
  };

  const filteredRequisicoes = numerosRequisicoes.filter((item) =>
    item.numero.toLowerCase().includes((filters.numero_requisicao || "").toLowerCase())
  );

  const hasFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== "" && value !== null
  );

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* Número da Requisição com Autocomplete */}
          <div className="space-y-2 relative">
            <Label htmlFor="numero_requisicao">Número da Requisição</Label>
            <div className="relative">
              <Input
                id="numero_requisicao"
                placeholder="Buscar por número"
                value={filters.numero_requisicao || ""}
                onChange={(e) => {
                  onFilterChange("numero_requisicao", e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                className="pr-8"
              />
              <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            {showDropdown && filteredRequisicoes.length > 0 && (
              <ul className="absolute z-50 w-full bg-white border rounded shadow mt-1 max-h-48 overflow-y-auto">
                {filteredRequisicoes.map((item, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      onFilterChange("numero_requisicao", item.numero);
                      setShowDropdown(false);
                    }}
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                  >
                    {item.numero}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Centro de Custo */}
          <div className="space-y-2">
            <Label htmlFor="centro_custo">Centro de Custo</Label>
            <Select
              value={filters.centro_custo_id || "_all"}
              onValueChange={(value) =>
                onFilterChange("centro_custo_id", value === "_all" ? undefined : value)
              }
            >
              <SelectTrigger id="centro_custo">
                <SelectValue placeholder="Todos os centros" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">Todos os centros</SelectItem>
                {centrosCusto.map((centro) => (
                  <SelectItem key={centro.id} value={centro.id}>
                    {centro.nome_centro_custo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Período de Entrega */}
          <div className="space-y-2">
            <Label>Período de Entrega</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal w-full",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate
                      ? formatBrazilianDateForDisplay(formatBrazilianDateToString(startDate))
                      : "Data início"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={handleStartDateChange}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal w-full",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate
                      ? formatBrazilianDateForDisplay(formatBrazilianDateToString(endDate))
                      : "Data fim"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={handleEndDateChange}
                    initialFocus
                    locale={ptBR}
                    disabled={(date) => (startDate ? date < startDate : false)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="outline" size="sm" onClick={onResetFilters} disabled={!hasFilters}>
            <X className="mr-2 h-4 w-4" />
            Limpar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgramacaoEntregaFilters;
