/**
 * Centralized thickness validation following LYTEC internal standards
 * Standard: 3.5cm - 5.0cm is the ideal application range
 */

export type EspessuraStatus = 'success' | 'warning' | 'error' | null;

export interface EspessuraValidationResult {
  status: EspessuraStatus;
  description: string;
  isWithinStandard: boolean;
}

/**
 * Validate thickness according to LYTEC standards
 * - Below 3.5cm: ❌ Out of standard (too thin)
 * - Between 3.5cm and 5.0cm: ✅ Within standard  
 * - Above 5.0cm: ❌ Out of standard (too thick)
 */
export const validateEspessuraLYTEC = (espessura: number): EspessuraValidationResult => {
  if (espessura <= 0) {
    return {
      status: null,
      description: "Não calculado",
      isWithinStandard: false
    };
  }

  if (espessura >= 3.5 && espessura <= 5.0) {
    return {
      status: 'success',
      description: "Dentro do padrão",
      isWithinStandard: true
    };
  } else if (espessura < 3.5) {
    return {
      status: 'error',
      description: "Fora do padrão (muito fina)",
      isWithinStandard: false
    };
  } else {
    return {
      status: 'error', 
      description: "Fora do padrão (muito espessa)",
      isWithinStandard: false
    };
  }
};

/**
 * Get CSS classes for thickness status display
 */
export const getEspessuraStatusClass = (status: EspessuraStatus): string => {
  switch (status) {
    case "success":
      return "text-green-600 font-medium border-green-300 bg-green-50";
    case "warning":
      return "text-amber-600 font-medium border-amber-300 bg-amber-50";
    case "error":
      return "text-red-600 font-medium border-red-300 bg-red-50";
    default:
      return "text-gray-500 border-gray-300 bg-gray-50";
  }
};

/**
 * Get status text description
 */
export const getEspessuraStatusText = (status: EspessuraStatus): string => {
  switch (status) {
    case "success":
      return "Dentro do padrão";
    case "warning":
      return "Atenção";
    case "error":
      return "Fora do padrão";
    default:
      return "Não calculado";
  }
};