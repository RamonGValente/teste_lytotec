
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Plus, Upload, MoreVertical } from "lucide-react";
import { useIsMobile, useIsSmallScreen } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CentroCustoHeaderActionsProps {
  onNewCentroCusto: () => void;
  onExport: () => void;
  onImport: () => void;
}

const CentroCustoHeaderActions: React.FC<CentroCustoHeaderActionsProps> = ({
  onNewCentroCusto,
  onExport,
  onImport
}) => {
  const isMobile = useIsMobile();
  const isSmallScreen = useIsSmallScreen();
  
  if (isMobile) {
    return (
      <div className="flex gap-2 w-full">
        <Button 
          className="flex-1"
          size={isSmallScreen ? "sm" : "sm"}
          onClick={onNewCentroCusto}
        >
          <Plus className={`mr-1.5 ${isSmallScreen ? 'h-3 w-3' : 'h-4 w-4'}`} />
          {isSmallScreen ? 'Novo' : 'Novo Centro de Custo'}
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className={`${isSmallScreen ? 'h-8 w-8' : 'h-10 w-10'}`}
            >
              <MoreVertical className={`${isSmallScreen ? 'h-3.5 w-3.5' : 'h-4 w-4'}`} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-background">
            <DropdownMenuItem onClick={onExport} className="cursor-pointer">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onImport} className="cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              Importar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button 
        onClick={onNewCentroCusto}
        size="default"
        className="w-full sm:w-auto"
      >
        <Plus className="mr-2 h-4 w-4" />
        Novo Centro de Custo
      </Button>
      
      <Button 
        variant="outline" 
        onClick={onExport}
        size="default"
        className="w-full sm:w-auto"
      >
        <Download className="mr-2 h-4 w-4" />
        Exportar
      </Button>
      
      <Button 
        variant="outline" 
        onClick={onImport}
        size="default"
        className="w-full sm:w-auto"
      >
        <Upload className="mr-2 h-4 w-4" />
        Importar
      </Button>
    </div>
  );
};

export default CentroCustoHeaderActions;
