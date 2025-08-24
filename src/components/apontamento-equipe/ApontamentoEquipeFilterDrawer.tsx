
import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatePickerWithRange } from "@/components/ui/date-picker-range";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { FilterX, Search } from "lucide-react";
import { Equipe } from "@/types/equipe";
import { ApontamentoEquipeFilters } from "@/types/apontamentoEquipe";

interface ApontamentoEquipeFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: ApontamentoEquipeFilters) => void;
  onClearFilters: () => void;
  equipes: Equipe[];
  isLoading?: boolean;
}

const ApontamentoEquipeFilterDrawer: React.FC<ApontamentoEquipeFilterDrawerProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  onClearFilters,
  equipes,
  isLoading = false
}) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [equipeId, setEquipeId] = useState<string | undefined>(undefined);
  
  // Reset filters when drawer opens
  useEffect(() => {
    if (!isOpen) return;
    
    // Reset states but don't trigger filter reset
    setDateRange(undefined);
    setEquipeId(undefined);
  }, [isOpen]);

  const handleApplyFilters = () => {
    const filters: ApontamentoEquipeFilters = {};

    if (dateRange?.from) {
      filters.data_inicio = dateRange.from;
    }
    
    if (dateRange?.to) {
      filters.data_fim = dateRange.to;
    }

    if (equipeId && equipeId !== "all") {
      filters.equipe_id = equipeId;
    }

    onApplyFilters(filters);
    onClose();
  };

  const handleClearFilters = () => {
    setDateRange(undefined);
    setEquipeId(undefined);
    onClearFilters();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[85vw] sm:w-[350px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filtros Avançados</SheetTitle>
        </SheetHeader>
        
        <div className="py-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="date-range-mobile" className="font-medium text-gray-700">Período</Label>
            <DatePickerWithRange 
              value={dateRange} 
              onChange={setDateRange} 
              className="w-full"
              id="date-range-mobile"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipe-mobile" className="font-medium text-gray-700">Equipe</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-3.5 h-5 w-5 text-muted-foreground" />
              <Select value={equipeId} onValueChange={setEquipeId}>
                <SelectTrigger id="equipe-mobile" className="pl-10 h-12 border border-slate-300 bg-white">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">Todas</SelectItem>
                  {equipes.map((equipe) => (
                    <SelectItem key={equipe.id} value={equipe.id}>
                      {equipe.nome_equipe}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <SheetFooter className="sm:justify-between gap-3 fixed bottom-4 left-4 right-4">
          <Button 
            variant="outline" 
            onClick={handleClearFilters} 
            disabled={isLoading}
            className="w-full h-12"
            size="mobile-default"
          >
            <FilterX className="mr-2 h-4 w-4" />
            Limpar Filtros
          </Button>
          
          <Button 
            onClick={handleApplyFilters} 
            disabled={isLoading}
            className="w-full h-12"
            size="mobile-default"
          >
            Aplicar Filtros
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ApontamentoEquipeFilterDrawer;
