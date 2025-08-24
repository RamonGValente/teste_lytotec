
import { EspessuraStatus, getEspessuraStatusClass as getCentralizedStatusClass, getEspessuraStatusText as getCentralizedStatusText } from "@/utils/espessuraValidation";

/**
 * Get CSS class name based on espessura status
 * @deprecated Use centralized function from espessuraValidation.ts
 */
export const getEspessuraStatusClass = (status: EspessuraStatus): string => {
  return getCentralizedStatusClass(status);
};

/**
 * Get text description based on espessura status
 * @deprecated Use centralized function from espessuraValidation.ts
 */
export const getEspessuraStatusText = (status: EspessuraStatus): string => {
  return getCentralizedStatusText(status);
};

/**
 * Get CSS class name based on espessura calculada status (legacy support)
 */
export const getEspessuraCalculadaStatusClass = (status: EspessuraStatus): string => {
  return getEspessuraStatusClass(status);
};

/**
 * Get text description based on espessura calculada status (legacy support)
 */
export const getEspessuraCalculadaStatusText = (status: EspessuraStatus): string => {
  return getEspessuraStatusText(status);
};
