
"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"

import { cn } from "@/lib/utils"
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

export interface ComboboxOption {
  value: string
  label: string
}

interface ComboboxProps {
  options: ComboboxOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  emptyText?: string
  searchPlaceholder?: string
  className?: string
  disabled?: boolean
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Selecione uma opção",
  emptyText = "Nenhuma opção encontrada",
  searchPlaceholder = "Buscar...",
  className,
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  
  const selectedItem = React.useMemo(() => {
    return options.find((option) => option.value === value);
  }, [options, value]);

  // Filter options based on input value
  const filteredOptions = React.useMemo(() => {
    if (!inputValue) return options;
    return options.filter((option) => 
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  }, [options, inputValue]);

  // CORREÇÃO: Handler simplificado que recebe o valor diretamente
  const handleSelect = React.useCallback((selectedValue: string) => {
    console.log("🎯 Combobox item selected:", selectedValue);
    
    // Garantir que temos um valor válido
    if (!selectedValue) {
      console.warn("⚠️ Empty value selected");
      return;
    }
    
    // Chamar onChange com o valor
    onChange(selectedValue);
    
    // Limpar input e fechar popover
    setInputValue("");
    setOpen(false);
    
    console.log("✅ Combobox selection completed");
  }, [onChange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled}
        >
          {selectedItem ? selectedItem.label : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 z-[10000] bg-white shadow-xl border border-gray-200 pointer-events-auto" align="start">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput 
              placeholder={searchPlaceholder} 
              value={inputValue}
              onValueChange={setInputValue}
              className="h-9 flex-1"
            />
          </div>
          <CommandList className="max-h-[300px] overflow-y-auto">
            <CommandEmpty>{emptyText}</CommandEmpty>
            {filteredOptions.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => {
                  console.log("🖱️ CommandItem clicked:", option.value, option.label);
                  handleSelect(option.value);
                }}
                className="cursor-pointer hover:bg-accent hover:text-accent-foreground py-3 px-3 pointer-events-auto"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === option.value ? "opacity-100" : "opacity-0"
                  )}
                />
                <span className="flex-1 pointer-events-none">{option.label}</span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
