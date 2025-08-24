
"use client"

import { useState, useEffect } from "react"
import { Check, ChevronsUpDown, Search, Loader2 } from "lucide-react"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import {
  Command,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandInput,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { cn } from "@/lib/utils"

export interface Caminhao {
  id: string
  nome_caminhao: string
}

interface CaminhaoComboboxProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  includeEquipamentos?: boolean
  situacaoFilter?: string[]
}

export function CaminhaoCombobox({
  value,
  onChange,
  placeholder = "Selecione um veículo",
  disabled = false,
  includeEquipamentos = false,
  situacaoFilter = ["Operando", "Em Manutenção", "Disponível", "Intempérie"]
}: CaminhaoComboboxProps) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [caminhoes, setCaminhoes] = useState<Caminhao[]>([])

  // Find the selected vehicle
  const selectedVehicle = caminhoes.find(item => item.id === value);

  // Fetch vehicles from the database
  useEffect(() => {
    async function fetchVeiculos() {
      try {
        setLoading(true);
        let query = supabase
          .from("bd_caminhoes_equipamentos")
          .select(`id, frota, numero_frota, placa`);
          
        // Apply vehicle type filter
        if (!includeEquipamentos) {
          query = query.eq("tipo_veiculo", "Caminhão");
        }
        
        // Apply situation filter if provided
        if (situacaoFilter && situacaoFilter.length > 0) {
          query = query.in("situacao", situacaoFilter);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error("Erro ao buscar veículos:", error);
          return;
        }
        
        // Format the data according to the requirements
        const veiculosFormatados = (data || [])
          .map((item) => ({
            id: item.id,
            nome_caminhao: `${item.frota || ''}${item.numero_frota || ''} - ${item.placa || ''}`.trim()
          }))
          .sort((a, b) => a.nome_caminhao.localeCompare(b.nome_caminhao));
        
        setCaminhoes(veiculosFormatados);
      } catch (error) {
        console.error("Erro ao buscar veículos:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchVeiculos();
  }, [includeEquipamentos, situacaoFilter]);

  // Filter vehicles based on search input
  const filteredVehicles = inputValue === "" 
    ? caminhoes 
    : caminhoes.filter((item) => 
        item.nome_caminhao.toLowerCase().includes(inputValue.toLowerCase())
      );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", disabled && "opacity-50 cursor-not-allowed")}
          disabled={disabled}
          onClick={() => !disabled && setOpen(!open)}
        >
          {selectedVehicle ? selectedVehicle.nome_caminhao : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput 
              placeholder="Buscar veículo..." 
              value={inputValue}
              onValueChange={setInputValue}
              className="h-9 flex-1"
            />
          </div>
          <CommandList className="max-h-[300px] overflow-y-auto">
            {loading ? (
              <div className="py-6 text-center text-sm text-muted-foreground flex items-center justify-center">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
                Carregando veículos...
              </div>
            ) : filteredVehicles.length === 0 ? (
              <CommandEmpty>Nenhum veículo encontrado.</CommandEmpty>
            ) : (
              filteredVehicles.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  onSelect={() => {
                    onChange(item.id);
                    setInputValue("");
                    setOpen(false);
                  }}
                  className="cursor-pointer hover:bg-accent hover:text-accent-foreground py-3"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.nome_caminhao}
                </CommandItem>
              ))
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
