
import * as React from "react";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { 
  normalizeDateToBrazilianNoon 
} from "@/utils/timezoneUtils";

interface CalendarDateRangePickerProps {
  date?: DateRange;
  onDateChange: (date: DateRange | undefined) => void;
}

export function CalendarDateRangePicker({ date, onDateChange }: CalendarDateRangePickerProps) {
  // Use Brazilian timezone normalization for date handling
  const handleDateChange = (range: DateRange | undefined) => {
    if (!range) {
      onDateChange(undefined);
      return;
    }

    // Use Brazilian timezone normalization functions
    const normalizedRange: DateRange = {
      from: range.from ? normalizeDateToBrazilianNoon(range.from) : undefined,
      to: range.to ? normalizeDateToBrazilianNoon(range.to) : undefined
    };

    onDateChange(normalizedRange);
  };

  return (
    <div className="grid gap-2">
      <Calendar
        mode="range"
        selected={date}
        onSelect={handleDateChange}
        numberOfMonths={2}
        initialFocus
        className={cn("p-3 pointer-events-auto")}
      />
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDateChange(undefined)}
          className="pointer-events-auto"
        >
          <X className="h-4 w-4 mr-1" />
          Limpar
        </Button>
      </div>
    </div>
  );
}
