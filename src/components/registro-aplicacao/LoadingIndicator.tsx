
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex items-center justify-center py-8 space-x-2">
      <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      <span className="text-sm text-gray-600">Carregando entregas disponíveis...</span>
    </div>
  );
};

export default LoadingIndicator;
