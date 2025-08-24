
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

const RelatorioMedicaoLoadingState: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-lg font-medium text-gray-700">
              Gerando relatório...
            </span>
          </div>
          <div className="text-center text-gray-500 text-sm mb-6">
            Processando dados do veículo e calculando medições
          </div>
          
          <div className="space-y-4">
            {/* Header Skeleton */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
            
            {/* Table Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-6 w-full" />
              {[...Array(5)].map((_, i) => (
                <div key={i} className="grid grid-cols-6 gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
            
            {/* Total Skeleton */}
            <div className="text-center space-y-2">
              <Skeleton className="h-6 w-48 mx-auto" />
              <Skeleton className="h-8 w-32 mx-auto" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RelatorioMedicaoLoadingState;
