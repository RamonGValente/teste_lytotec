
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { DatePickerWithRange } from "@/components/ui/date-picker-range";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DateRange } from "react-day-picker";
import { ChamadoFilterParams } from "@/types/chamadoOS";
import { format } from "date-fns";
import { FilterX, Search } from "lucide-react";

interface ChamadosFiltersProps {
  onApplyFilters: (filters: ChamadoFilterParams) => void;
  onClearFilters: () => void;
  veiculosOptions: { id: string; label: string; }[];
  isLoading?: boolean;
}

const ChamadosFilters: React.FC<ChamadosFiltersProps> = ({
  onApplyFilters,
  onClearFilters,
  veiculosOptions,
  isLoading = false
}) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [numeroChamado, setNumeroChamado] = useState<string>("");
  const [veiculoId, setVeiculoId] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  // Apply filters whenever any filter value changes
  useEffect(() => {
    applyFilters();
  }, [dateRange, numeroChamado, veiculoId, status]);

  const applyFilters = () => {
    const filters: ChamadoFilterParams = {};

    if (dateRange?.from) {
      filters.data_inicio = format(dateRange.from, "yyyy-MM-dd");
    }
    
    if (dateRange?.to) {
      filters.data_fim = format(dateRange.to, "yyyy-MM-dd");
    }

    if (numeroChamado) {
      filters.numero_chamado = numeroChamado;
    }

    if (veiculoId && veiculoId !== "_all") {
      filters.caminhao_equipamento_id = veiculoId;
    }

    if (status && status !== "_all") {
      filters.status = status;
    }

    onApplyFilters(filters);
  };

  const handleClearFilters = () => {
    setDateRange(undefined);
    setNumeroChamado("");
    setVeiculoId("");
    setStatus("");
    onClearFilters();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  };

  return (
    <Card className="mb-6 border border-slate-200 shadow-sm">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" onKeyDown={handleKeyDown}>
          <div className="space-y-2">
            <Label htmlFor="numero-chamado" className="font-medium text-gray-700">Número do Chamado</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="numero-chamado"
                placeholder="Buscar pelo número"
                value={numeroChamado}
                onChange={(e) => setNumeroChamado(e.target.value)}
                className="pl-8 border border-slate-300 bg-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="veiculo" className="font-medium text-gray-700">Caminhão/Equipamento</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Select value={veiculoId} onValueChange={setVeiculoId}>
                <SelectTrigger id="veiculo" className="pl-8 border border-slate-300 bg-white">
                  <SelectValue placeholder="Selecione um veículo" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="_all">Todos</SelectItem>
                  {veiculosOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-range" className="font-medium text-gray-700">Data da Solicitação</Label>
            <DatePickerWithRange 
              value={dateRange} 
              onChange={setDateRange} 
              className="border border-slate-300 rounded-md"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="font-medium text-gray-700">Status</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status" className="pl-8 border border-slate-300 bg-white">
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="_all">Todos</SelectItem>
                  <SelectItem value="Aberto">Aberto</SelectItem>
                  <SelectItem value="Convertido para OS">Convertido para OS</SelectItem>
                  <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button 
            variant="outline" 
            onClick={handleClearFilters} 
            disabled={isLoading}
            className="border-slate-300"
          >
            <FilterX className="mr-2 h-4 w-4" />
            Limpar Filtros
          </Button>
        </div>
        
        <div className="mt-2 text-center text-sm text-slate-500 italic">
          Utilize os filtros acima para refinar sua busca
        </div>
      </CardContent>
    </Card>
  );
};

export default ChamadosFilters;
