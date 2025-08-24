import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RegistroAplicacao } from '@/types/registroAplicacao';
import { getEspessuraCalculadaStatus, getEspessuraCalculadaStatusText } from '@/utils/aplicacaoCalculations';
import { formatBrazilianDateForDisplay } from '@/utils/timezoneUtils';
import { supabase } from '@/integrations/supabase/client';
import { formatMassaFromDatabase } from '@/utils/massaConversionUtils';

interface RegistroAplicacaoViewModalProps {
  registro: RegistroAplicacao;
  isOpen: boolean;
  onClose: () => void;
}

interface AplicacaoSummary {
  totalAplicado: number;
  massaRemanescente: number;
  percentualAplicado: number;
  espessuraMedia: number | null;
  areaTotalAplicada: number;
  massaTotalCarga: number;
}

export const RegistroAplicacaoViewModal: React.FC<RegistroAplicacaoViewModalProps> = ({
  registro,
  isOpen,
  onClose,
}) => {
  const [aplicacaoSummary, setAplicacaoSummary] = useState<AplicacaoSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  // Calcular resumo da aplicação
  useEffect(() => {
    const loadAplicacaoSummary = async () => {
      if (!isOpen || !registro.registro_carga_id) return;
      
      setIsLoadingSummary(true);
      try {
        console.log("🔍 Carregando resumo para carga:", registro.registro_carga_id);
        
        // Buscar dados da carga primeiro
        const { data: carga, error: cargaError } = await supabase
          .from("bd_registro_cargas")
          .select("tonelada_real")
          .eq("id", registro.registro_carga_id)
          .single();

        if (cargaError) {
          console.error("Erro ao buscar carga:", cargaError);
          throw cargaError;
        }

        // Buscar aplicações principais desta carga para obter carga_total_aplicada
        const { data: aplicacoesPrincipais, error: aplicacoesError } = await supabase
          .from("bd_registro_apontamento_aplicacao")
          .select("carga_total_aplicada")
          .eq("registro_carga_id", registro.registro_carga_id)
          .limit(1);

        if (aplicacoesError) {
          console.error("Erro ao buscar aplicações principais:", aplicacoesError);
          throw aplicacoesError;
        }

        // Buscar detalhes das aplicações para calcular espessura média (dados corretos)
        const { data: detalhesAplicacoes, error: detalhesError } = await supabase
          .from("bd_registro_aplicacao_detalhes")
          .select("area_aplicada")
          .eq("registro_carga_id", registro.registro_carga_id);

        if (detalhesError) {
          console.error("Erro ao buscar detalhes aplicações:", detalhesError);
          throw detalhesError;
        }

        console.log("📊 Dados brutos:", {
          carga: carga?.tonelada_real,
          aplicacoesPrincipais,
          detalhesAplicacoes
        });

        const massaTotalCarga = carga?.tonelada_real 
          ? formatMassaFromDatabase(carga.tonelada_real, 'bd_registro_cargas', 'tonelada_real')
          : 0;
        
        // Usar carga_total_aplicada em vez de somar tonelada_aplicada individual
        const totalAplicado = aplicacoesPrincipais?.[0]?.carga_total_aplicada || 0;
        
        // Calcular massa remanescente corretamente
        const massaRemanescente = Math.max(0, massaTotalCarga - totalAplicado);
        const percentualAplicado = massaTotalCarga > 0 ? (totalAplicado / massaTotalCarga) * 100 : 0;
        
        // Calcular área total dos detalhes das aplicações
        const areaTotalAplicada = detalhesAplicacoes?.reduce((sum, det) => sum + (det.area_aplicada || 0), 0) || 0;
        
        // Calcular espessura média: (massa_total ÷ area_total_detalhes) ÷ 2.4
        let espessuraMedia: number | null = null;
        if (areaTotalAplicada > 0 && massaTotalCarga > 0) {
          espessuraMedia = (massaTotalCarga / areaTotalAplicada) / 2.4;
        }

        console.log("📊 Resumo calculado:", {
          massaTotalCarga,
          totalAplicado,
          massaRemanescente,
          percentualAplicado: percentualAplicado.toFixed(1) + "%",
          areaTotalAplicada,
          espessuraMedia: espessuraMedia !== null ? espessuraMedia.toFixed(3) + " cm" : "sem dados de área"
        });

        console.log("🔢 Debug espessura média:", {
          massaTotalCarga,
          areaTotalAplicada,
          calculo: areaTotalAplicada > 0 ? `(${massaTotalCarga} ÷ ${areaTotalAplicada}) ÷ 2.4 = ${espessuraMedia?.toFixed(6)}` : "sem área",
          resultado: espessuraMedia,
          condicaoExibicao: areaTotalAplicada > 0 && espessuraMedia !== null
        });

        setAplicacaoSummary({
          totalAplicado,
          massaRemanescente,
          percentualAplicado,
          espessuraMedia,
          areaTotalAplicada,
          massaTotalCarga
        });
      } catch (error) {
        console.error("💥 Erro ao carregar resumo da aplicação:", error);
      } finally {
        setIsLoadingSummary(false);
      }
    };

    loadAplicacaoSummary();
  }, [isOpen, registro.registro_carga_id]);

  const getStatusDisplay = () => {
    if (registro.espessura_calculada) {
      const status = getEspessuraCalculadaStatus(registro.espessura_calculada);
      const text = getEspessuraCalculadaStatusText(status);
      const variant = status === 'success' ? 'default' : 'destructive';
      return <Badge variant={variant}>{text}</Badge>;
    }
    return <Badge variant="secondary">Não calculado</Badge>;
  };

  const centroCusto = 
    registro.lista_entrega?.centro_custo_nome ||
    registro.lista_entrega?.centro_custo?.nome_centro_custo ||
    registro.lista_entrega?.requisicao?.centro_custo?.nome_centro_custo ||
    "N/A";

  const logradouro = registro.logradouro_aplicado || 
                    registro.lista_entrega?.logradouro ||
                    "N/A";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Registro de Aplicação</DialogTitle>
          <DialogDescription>
            Visualização completa dos dados do registro
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seção de Progresso da Aplicação */}
          {aplicacaoSummary && !isLoadingSummary && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-blue-800">Progresso da Aplicação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso da Carga</span>
                    <span className="font-medium">{aplicacaoSummary.percentualAplicado.toFixed(1)}%</span>
                  </div>
                  <Progress value={aplicacaoSummary.percentualAplicado} className="h-3" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">
                      {aplicacaoSummary.totalAplicado.toFixed(2)}t
                    </div>
                    <div className="text-sm text-green-600">Aplicado</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-700">
                      {aplicacaoSummary.massaRemanescente.toFixed(2)}t
                    </div>
                    <div className="text-sm text-blue-600">Remanescente</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {isLoadingSummary && (
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Carregando resumo...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informações da Entrega */}
          <div>
            <h3 className="text-lg font-medium mb-3">Informações da Entrega</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Data da Aplicação</label>
                <p className="text-sm text-gray-900">
                  {registro.data_aplicacao ? 
                    formatBrazilianDateForDisplay(registro.data_aplicacao) : 
                    "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Hora de Chegada</label>
                <p className="text-sm text-gray-900">
                  {registro.hora_chegada_local || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Logradouro</label>
                <p className="text-sm text-gray-900">{logradouro}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Centro de Custo</label>
                <p className="text-sm text-gray-900">{centroCusto}</p>
              </div>
            </div>
          </div>

          {/* Detalhes da Carga */}
          <div>
            <h3 className="text-lg font-medium mb-3">Detalhes da Carga</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Saída</label>
                <p className="text-sm text-gray-900">
                  {registro.registro_carga?.data_saida && registro.registro_carga?.hora_saida ? 
                    `${formatBrazilianDateForDisplay(registro.registro_carga.data_saida)} às ${registro.registro_carga.hora_saida}` : 
                    "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Ton. Saída</label>
                <p className="text-sm text-gray-900">
                  {registro.registro_carga?.tonelada_real 
                    ? `${formatMassaFromDatabase(registro.registro_carga.tonelada_real, 'bd_registro_cargas', 'tonelada_real').toFixed(1)}t`
                    : "N/A"
                  }
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Caminhão</label>
                <p className="text-sm text-gray-900">
                  {registro.lista_entrega?.caminhao ? 
                    `${registro.lista_entrega.caminhao.placa} - ${registro.lista_entrega.caminhao.modelo}` : 
                    "N/A"}
                </p>
              </div>
              {/* Campo Espessura Média - corrigido para aparecer quando houver dados válidos */}
              {aplicacaoSummary && aplicacaoSummary.areaTotalAplicada > 0 && aplicacaoSummary.espessuraMedia !== null && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Espessura Média</label>
                  <p className="text-sm text-gray-900">
                    {aplicacaoSummary.espessuraMedia.toFixed(3)} cm
                  </p>
                </div>
              )}
              {/* Mostrar mensagem quando não houver dados de área */}
              {aplicacaoSummary && aplicacaoSummary.areaTotalAplicada === 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Espessura Média</label>
                  <p className="text-sm text-gray-500 italic">
                    Sem dados de área para calcular
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Dados Técnicos da Aplicação */}
          <div>
            <h3 className="text-lg font-medium mb-3">Dados Técnicos da Aplicação</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Comprimento (m)</label>
                <p className="text-sm text-gray-900">
                  {registro.comprimento || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Largura Média (m)</label>
                <p className="text-sm text-gray-900">
                  {registro.largura_media || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Área Calculada (m²)</label>
                <p className="text-sm text-gray-900">
                  {registro.area_calculada || registro.area || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Ton. Aplicada</label>
                <p className="text-sm text-gray-900">
                  {registro.tonelada_aplicada ? `${registro.tonelada_aplicada}t` : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Espessura Calculada (cm)</label>
                <p className="text-sm text-gray-900">
                  {registro.espessura_calculada || "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <div>{getStatusDisplay()}</div>
              </div>
            </div>
          </div>

          {/* Dados de Aplicação */}
          {(registro.hora_aplicacao || registro.temperatura_aplicacao || registro.bordo) && (
            <div>
              <h3 className="text-lg font-medium mb-3">Dados de Aplicação</h3>
              <div className="grid grid-cols-3 gap-4">
                {registro.hora_aplicacao && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Hora da Aplicação</label>
                    <p className="text-sm text-gray-900">{registro.hora_aplicacao}</p>
                  </div>
                )}
                {registro.temperatura_aplicacao && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Temperatura da Aplicação (°C)</label>
                    <p className="text-sm text-gray-900">{registro.temperatura_aplicacao}</p>
                  </div>
                )}
                {registro.bordo && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Bordo</label>
                    <p className="text-sm text-gray-900">{registro.bordo}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Anotações */}
          {registro.anotacoes_apontador && (
            <div>
              <label className="text-sm font-medium text-gray-700">Anotações do Apontador</label>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                {registro.anotacoes_apontador}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
