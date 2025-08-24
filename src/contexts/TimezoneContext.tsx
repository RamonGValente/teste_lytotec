
import React, { createContext, useContext, ReactNode } from 'react';

interface TimezoneContextType {
  timezone: string;
  getBrazilianDate: () => Date;
  formatToBrazilianDate: (date: Date) => string;
}

const TimezoneContext = createContext<TimezoneContextType | undefined>(undefined);

export const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

interface TimezoneProviderProps {
  children: ReactNode;
}

export const TimezoneProvider: React.FC<TimezoneProviderProps> = ({ children }) => {
  const getBrazilianDate = (): Date => {
    // Criar uma data atual no timezone brasileiro
    const now = new Date();
    return new Date(now.toLocaleString("en-US", { timeZone: BRAZIL_TIMEZONE }));
  };

  const formatToBrazilianDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const value: TimezoneContextType = {
    timezone: BRAZIL_TIMEZONE,
    getBrazilianDate,
    formatToBrazilianDate
  };

  return (
    <TimezoneContext.Provider value={value}>
      {children}
    </TimezoneContext.Provider>
  );
};

export const useTimezone = (): TimezoneContextType => {
  const context = useContext(TimezoneContext);
  if (!context) {
    throw new Error('useTimezone deve ser usado dentro de um TimezoneProvider');
  }
  return context;
};
