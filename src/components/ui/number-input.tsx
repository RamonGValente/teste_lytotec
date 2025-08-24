
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value?: number;
  onChange?: (value: number) => void;
  decimalPlaces?: number;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, value, onChange, decimalPlaces = 0, placeholder, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    // Format number with thousand separators using dots (26.750)
    const formatNumber = (num: number): string => {
      if (isNaN(num) || num === 0) return "";
      
      // Limitar a um número razoável de casas decimais para evitar números muito longos
      const maxDecimals = Math.min(decimalPlaces ?? 3, 3);
      const roundedNum = Number(num.toFixed(maxDecimals));
      
      // Custom formatting with dots as thousand separators
      const numStr = roundedNum.toString();
      const parts = numStr.split('.');
      const integerPart = parts[0];
      
      // Add dots every 3 digits from right to left
      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      
      if (maxDecimals > 0 && parts[1]) {
        const decimalPart = parts[1];
        return `${formattedInteger},${decimalPart}`;
      }
      
      return formattedInteger;
    };

    // Parse formatted string back to number (remove dots, handle commas)
    const parseNumber = (str: string): number => {
      if (!str) return 0;
      // Remove thousand separator dots and convert decimal comma to dot
      const cleaned = str.replace(/\./g, '').replace(',', '.');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    };

    // Update display value when external value changes
    useEffect(() => {
      if (value !== undefined && !isTyping) {
        setDisplayValue(value === 0 ? "" : formatNumber(value));
      }
    }, [value, decimalPlaces, isTyping]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setIsTyping(true);
      
      // Allow only numbers during typing (accept large numbers like 26750)
      const filteredValue = inputValue.replace(/[^\d]/g, '');
      
      // Show raw input while typing (no formatting)
      setDisplayValue(filteredValue);
      
      // Parse and send numeric value to parent
      const numericValue = parseNumber(filteredValue);
      console.log("NumberInput - Input value:", inputValue, "Filtered:", filteredValue, "Numeric (kg):", numericValue);
      
      if (onChange) {
        onChange(numericValue);
      }
    };

    const handleFocus = () => {
      setIsTyping(true);
      // Show raw number when focused for easier editing
      if (value && value > 0) {
        setDisplayValue(value.toString());
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsTyping(false);
      
      // Format the number when user leaves the field
      const numericValue = parseNumber(displayValue);
      const formattedValue = numericValue === 0 ? "" : formatNumber(numericValue);
      setDisplayValue(formattedValue);
      
      console.log("NumberInput - On blur, numeric value (kg):", numericValue, "formatted:", formattedValue);
      
      if (props.onBlur) {
        props.onBlur(e);
      }
    };

    return (
      <Input
        ref={ref}
        className={cn("text-right", className)}
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder || "26750"}
        {...props}
      />
    );
  }
);

NumberInput.displayName = "NumberInput";

export { NumberInput };
