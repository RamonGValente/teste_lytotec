
"use client";

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  normalizeDateToBrazilianNoon, 
  formatBrazilianDateToString 
} from "@/utils/timezoneUtils";

interface DatePickerWithRangeProps {
  value?: DateRange;
  onChange: (value: DateRange | undefined) => void;
  className?: string;
  id?: string;
}

export function DatePickerWithRange({
  value,
  onChange,
  className,
  id,
}: DatePickerWithRangeProps) {
  // Use Brazilian timezone normalization for date handling
  const handleDateChange = (range: DateRange | undefined) => {
    if (!range) {
      onChange(undefined);
      return;
    }

    // Use Brazilian timezone normalization functions
    const normalizedRange: DateRange = {
      from: range.from ? normalizeDateToBrazilianNoon(range.from) : undefined,
      to: range.to ? normalizeDateToBrazilianNoon(range.to) : undefined
    };

    onChange(normalizedRange);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "dd/MM/yyyy", { locale: ptBR })} -{" "}
                  {format(value.to, "dd/MM/yyyy", { locale: ptBR })}
                </>
              ) : (
                format(value.from, "dd/MM/yyyy", { locale: ptBR })
              )
            ) : (
              <span>Selecione um período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 sm:w-auto" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={handleDateChange}
            numberOfMonths={1}
            locale={ptBR}
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
