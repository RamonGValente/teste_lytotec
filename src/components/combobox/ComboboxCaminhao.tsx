
"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
import { Loader2, ChevronsUpDown, Search, Check } from "lucide-react"
import { cn } from "@/lib/utils"

type Caminhao = {
  id: string
  nome_caminhao: string
  termo_busca: string // concatenação para busca
}

interface ComboboxCaminhaoProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  includeEquipamentos?: boolean
  situacaoFilter?: string[]
}

export function ComboboxCaminhao({
  value,
  onChange,
  placeholder = "Selecione um veículo",
  disabled = false,
  includeEquipamentos = false,
  situacaoFilter = ["Operando", "Em Manutenção", "Disponível", "Intempérie"]
}: ComboboxCaminhaoProps) {
  const [open, setOpen] = useState(false)
  const [caminhoes, setCaminhoes] = useState<Caminhao[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const popoverTriggerRef = useRef<HTMLButtonElement>(null)
  const [popoverWidth, setPopoverWidth] = useState<number>(0)

  // Update popover width when trigger size changes
  useEffect(() => {
    if (popoverTriggerRef.current) {
      const updateWidth = () => {
        if (popoverTriggerRef.current) {
          setPopoverWidth(popoverTriggerRef.current.offsetWidth)
        }
      }
      
      // Set initial width
      updateWidth()
      
      // Create ResizeObserver to track changes
      const resizeObserver = new ResizeObserver(updateWidth)
      resizeObserver.observe(popoverTriggerRef.current)
      
      return () => {
        if (popoverTriggerRef.current) {
          resizeObserver.unobserve(popoverTriggerRef.current)
        }
      }
    }
  }, [popoverTriggerRef])

  // Find the selected vehicle
  const selectedVehicle = useMemo(() => {
    return caminhoes.find(item => item.id === value);
  }, [caminhoes, value]);

  useEffect(() => {
    if (open || value) {
      fetchCaminhoes()
    }
  }, [open, includeEquipamentos, situacaoFilter, value])

  async function fetchCaminhoes() {
    if (caminhoes.length > 0 && !value) return; // Skip if already loaded and no specific value needed

    setLoading(true)
    try {
      console.log("Fetching vehicles with filters:", { includeEquipamentos, situacaoFilter });
      let query = supabase
        .from("bd_caminhoes_equipamentos")
        .select("id, frota, numero_frota, placa")
        
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
        console.error("Erro ao buscar veículos:", error)
        return
      }

      const formatados = (data || []).map((item) => {
        const nome = `${item.frota || ''}${item.numero_frota || ''} - ${item.placa || ''}`.trim()
        const termo_busca = `${item.frota || ''}${item.numero_frota || ''}`.toLowerCase()
        return {
          id: item.id,
          nome_caminhao: nome,
          termo_busca,
        }
      }).sort((a, b) => a.nome_caminhao.localeCompare(b.nome_caminhao))

      console.log(`Loaded ${formatados.length} vehicles`);
      setCaminhoes(formatados)
    } catch (error) {
      console.error("Erro ao buscar veículos:", error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = search === "" 
    ? caminhoes 
    : caminhoes.filter((item) =>
        item.termo_busca.includes(search.toLowerCase()) ||
        item.nome_caminhao.toLowerCase().includes(search.toLowerCase())
      );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={popoverTriggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between text-left", disabled && "opacity-50 cursor-not-allowed")}
          disabled={disabled}
          onClick={() => !disabled && setOpen(true)}
        >
          {selectedVehicle ? (
            <span className="truncate">{selectedVehicle.nome_caminhao}</span>
          ) : (
            <span>{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="p-0" 
        style={{ width: `${popoverWidth}px` }} 
        align="start"
      >
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput
              placeholder="Buscar veículo (ex: RJN01)..."
              value={search}
              onValueChange={setSearch}
              className="h-9 flex-1 border-0 outline-none focus:ring-0"
            />
          </div>
          <CommandList className="max-h-[300px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Carregando veículos...
              </div>
            ) : filtered.length === 0 ? (
              <CommandEmpty className="py-6 text-center text-sm">Nenhum veículo encontrado.</CommandEmpty>
            ) : (
              filtered.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  onSelect={() => {
                    onChange(item.id);
                    setSearch("");
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
