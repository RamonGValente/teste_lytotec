
// Utility functions for mapping situacao values between UI and database
export const SITUACAO_UI_TO_DB_MAP = {
  'Operando': 'Operando',
  'Em Manutenção': 'Em Manutenção', 
  'Parado': 'Disponível',
  'Intempérie': 'Intempérie'
} as const;

export const SITUACAO_DB_TO_UI_MAP = {
  'Operando': 'Operando',
  'Em Manutenção': 'Em Manutenção',
  'Disponível': 'Parado', 
  'Intempérie': 'Intempérie'
} as const;

export type SituacaoUI = keyof typeof SITUACAO_UI_TO_DB_MAP;
export type SituacaoDB = keyof typeof SITUACAO_DB_TO_UI_MAP;

export const mapSituacaoToDatabase = (situacaoUI: string): string => {
  return SITUACAO_UI_TO_DB_MAP[situacaoUI as SituacaoUI] || situacaoUI;
};

export const mapSituacaoFromDatabase = (situacaoDB: string): string => {
  return SITUACAO_DB_TO_UI_MAP[situacaoDB as SituacaoDB] || situacaoDB;
};
