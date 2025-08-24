
import React from 'react';
import { AlertCircle, Calendar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateMessageProps {
  hasFilters: boolean;
  onRetryWithoutFilters?: () => void;
  onClearFilters?: () => void;
  selectedDate?: Date;
}

const EmptyStateMessage: React.FC<EmptyStateMessageProps> = ({
  hasFilters,
  onRetryWithoutFilters,
  onClearFilters,
  selectedDate
}) => {
  return (
    <div className="text-center py-8 space-y-4">
      <div className="flex justify-center">
        <AlertCircle className="h-12 w-12 text-gray-400" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-gray-900">
          Nenhuma entrega disponível encontrada
        </h3>
        
        {selectedDate ? (
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex items-center justify-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Buscando para: {selectedDate.toLocaleDateString('pt-BR')}</span>
            </div>
            <p>Entregas precisam ter status "Enviada" e massa remanescente disponível.</p>
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            Não há entregas com massa remanescente disponível no momento.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs text-gray-500">
          Verifique se:
        </p>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>• As cargas foram registradas e enviadas</li>
          <li>• Ainda há massa remanescente nas entregas</li>
          <li>• A data da entrega está correta</li>
        </ul>
      </div>

      {hasFilters && (onRetryWithoutFilters || onClearFilters) && (
        <div className="flex gap-2 justify-center">
          {onRetryWithoutFilters && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetryWithoutFilters}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Expandir busca para outras datas
            </Button>
          )}
          {onClearFilters && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClearFilters}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Limpar filtros
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyStateMessage;
