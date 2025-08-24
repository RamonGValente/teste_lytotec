
"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { fetchCaminhoes } from "@/services/caminhoesService"
import { cn } from "@/lib/utils"
import { Caminhao } from "@/services/caminhoesService"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

interface VehicleComboboxProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  onlyTrucks?: boolean
  situationFilter?: string[]
  className?: string
  disabled?: boolean
}

export function VehicleCombobox({
  value,
  onChange,
  placeholder = "Selecione um veículo",
  searchPlaceholder = "Buscar veículo...",
  emptyText = "Nenhum veículo encontrado",
  onlyTrucks = false,
  situationFilter = ["Disponível", "Operando"],
  className,
  disabled = false,
}: VehicleComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const popoverTriggerRef = React.useRef<HTMLButtonElement>(null)
  const [popoverWidth, setPopoverWidth] = React.useState<number>(0)

  // Update popover width when trigger size changes
  React.useEffect(() => {
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

  // Fetch vehicles data
  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles', onlyTrucks, situationFilter],
    queryFn: () => fetchCaminhoes(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Filter vehicles based on type and situation
  const filteredVehicles = React.useMemo(() => {
    let filtered = [...vehicles]
    
    if (onlyTrucks) {
      filtered = filtered.filter(
        vehicle => vehicle.tipo_veiculo?.toLowerCase().includes('caminh')
      )
    }
    
    if (situationFilter && situationFilter.length > 0) {
      filtered = filtered.filter(
        vehicle => situationFilter.includes(vehicle.situacao || '')
      )
    }
    
    return filtered
  }, [vehicles, onlyTrucks, situationFilter])

  // Search functionality
  const searchResults = React.useMemo(() => {
    if (!search) return filteredVehicles
    
    const searchLower = search.toLowerCase()
    return filteredVehicles.filter(
      vehicle => 
        (vehicle.placa && vehicle.placa.toLowerCase().includes(searchLower)) ||
        (vehicle.modelo && vehicle.modelo.toLowerCase().includes(searchLower)) ||
        (vehicle.frota && vehicle.frota.toLowerCase().includes(searchLower)) ||
        (vehicle.numero_frota && vehicle.numero_frota.toLowerCase().includes(searchLower))
    )
  }, [filteredVehicles, search])

  // Find the selected vehicle
  const selectedVehicle = React.useMemo(() => {
    return vehicles.find(vehicle => vehicle.id === value)
  }, [vehicles, value])

  // Format vehicle display name
  const formatVehicleDisplay = (vehicle: Caminhao) => {
    const frota = vehicle.frota || ''
    const numero = vehicle.numero_frota || ''
    const placa = vehicle.placa || ''
    return `${frota}${numero}${frota || numero ? ' - ' : ''}${placa}`
  }

  const handleSelect = (vehicleId: string) => {
    onChange(vehicleId)
    setSearch("")
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={popoverTriggerRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between text-left font-normal", 
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
          onClick={() => setOpen(true)} // Explicitly set to true on click
        >
          {selectedVehicle ? (
            <span className="truncate">{formatVehicleDisplay(selectedVehicle)}</span>
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
              placeholder={searchPlaceholder} 
              value={search}
              onValueChange={setSearch}
              className="h-9 flex-1 border-0 outline-none focus:ring-0"
            />
          </div>
          <CommandList className="max-h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center p-6 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Carregando veículos...
              </div>
            ) : searchResults.length === 0 ? (
              <CommandEmpty>{emptyText}</CommandEmpty>
            ) : (
              searchResults.map(vehicle => (
                <CommandItem
                  key={vehicle.id}
                  value={vehicle.id}
                  onSelect={() => handleSelect(vehicle.id)}
                  className="cursor-pointer py-3 px-2"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === vehicle.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{formatVehicleDisplay(vehicle)}</span>
                    {vehicle.modelo && (
                      <span className="text-xs text-muted-foreground">{vehicle.modelo}</span>
                    )}
                  </div>
                </CommandItem>
              ))
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
