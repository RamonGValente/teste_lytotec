import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const RelatorioAplicacaoHeader: React.FC = () => {
  return (
    <Card className="w-full bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Relatório de Aplicação Diária
              </h1>
              <p className="text-muted-foreground mt-1">
                Controle e acompanhamento das aplicações realizadas por centro de custo
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-primary">LYTOTEC ERP</div>
            <div className="text-sm text-muted-foreground">Sistema de Gestão</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RelatorioAplicacaoHeader;