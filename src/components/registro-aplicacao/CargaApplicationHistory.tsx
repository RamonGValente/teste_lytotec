
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Plus } from "lucide-react";
import { RegistroAplicacao } from "@/types/registroAplicacao";

interface CargaApplicationHistoryProps {
  aplicacoes: RegistroAplicacao[];
  massaRemanescente: number;
  massaTotal: number;
  mediaEspessura?: number;
  cargaFinalizada: boolean;
  onNovaAplicacao?: () => void;
  onFinalizarCarga?: () => void;
  canAddNewApplication?: boolean;
}

const CargaApplicationHistory: React.FC<CargaApplicationHistoryProps> = ({
  aplicacoes,
  massaRemanescente,
  massaTotal,
  mediaEspessura,
  cargaFinalizada,
  onNovaAplicacao,
  onFinalizarCarga,
  canAddNewApplication = true
}) => {
  const formatValue = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return "0.000";
    return Number(value).toFixed(3);
  };

  const percentualUtilizado = massaTotal > 0 ? ((massaTotal - massaRemanescente) / massaTotal) * 100 : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Histórico de Aplicações da Carga</CardTitle>
          {cargaFinalizada && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-4 w-4 mr-1" />
              Finalizada
            </Badge>
          )}
        </div>
        
        {/* Resumo da carga */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Massa Total</p>
            <p className="text-lg font-semibold">{formatValue(massaTotal)} t</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Massa Remanescente</p>
            <p className="text-lg font-semibold">{formatValue(massaRemanescente)} t</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Utilizado</p>
            <p className="text-lg font-semibold">{percentualUtilizado.toFixed(1)}%</p>
          </div>
          {mediaEspessura && (
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Média Espessura</p>
              <p className="text-lg font-semibold">{formatValue(mediaEspessura)} cm</p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {/* Lista de aplicações */}
        {aplicacoes.length > 0 ? (
          <div className="space-y-3">
            {aplicacoes.map((aplicacao, index) => (
              <div key={aplicacao.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      Aplicação {aplicacao.aplicacao_sequencia || index + 1}
                    </Badge>
                    <span className="text-sm font-medium">
                      {aplicacao.logradouro_aplicado || "Logradouro não informado"}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {new Date(aplicacao.data_aplicacao).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Área:</span>
                    <span className="ml-1 font-medium">{formatValue(aplicacao.area_calculada)} m²</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Massa:</span>
                    <span className="ml-1 font-medium">{formatValue(aplicacao.tonelada_aplicada)} t</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Espessura:</span>
                    <span className="ml-1 font-medium">{formatValue(aplicacao.espessura)} cm</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Bordo:</span>
                    <span className="ml-1 font-medium">{aplicacao.bordo || "N/A"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma aplicação registrada ainda</p>
          </div>
        )}

        {/* Ações */}
        <div className="flex gap-3 mt-6">
          {canAddNewApplication && massaRemanescente > 0.001 && !cargaFinalizada && (
            <Button 
              onClick={onNovaAplicacao}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nova Rua
            </Button>
          )}
          
          {massaRemanescente > 0.001 && !cargaFinalizada && aplicacoes.length > 0 && (
            <Button 
              onClick={onFinalizarCarga}
              variant="outline"
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Finalizar Carga
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CargaApplicationHistory;
