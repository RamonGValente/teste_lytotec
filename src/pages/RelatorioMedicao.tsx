import React, { useState, useEffect } from "react";
import { addDays, format, parse, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileDown, FileText, BarChart3, X, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarDateRangePicker } from "@/components/ui/calendar-date-range-picker";
import { DateRange } from "react-day-picker";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import MainLayout from "@/components/layout/MainLayout";
import { usePermissionGuard } from "@/hooks/usePermissionGuard";
import { supabase } from "@/integrations/supabase/client";
import { downloadExcel } from "@/lib/excel";
import { CentroCusto } from "@/types/centroCusto";
import { debugLog } from "@/lib/debug";
import RelatorioMedicaoDetalhado from "@/components/relatorio-medicao/RelatorioMedicaoDetalhado";
import RelatorioMedicaoPlaceholder from "@/components/relatorio-medicao/RelatorioMedicaoPlaceholder";
import RelatorioMedicaoLoadingState from "@/components/relatorio-medicao/RelatorioMedicaoLoadingState";
import RelatorioMedicaoEmptyState from "@/components/relatorio-medicao/RelatorioMedicaoEmptyState";
import { formatBrazilianDateToString } from "@/utils/timezoneUtils";
import { EquipmentReportData, TruckReportData, ManutencaoEquipmentData, ManutencaoTruckData, DescontoData } from "@/types/relatorioMedicao";
import { downloadRelatorioMedicaoExcel } from "@/lib/excel";
import { generateReportPDF } from "@/services/pdfService";

interface VehicleInfo {
  id: string;
  label: string;
  tipo_veiculo: string;
  aluguel: number;
  imagem_url?: string | null;
}

interface ReportStats {
  quilometragem: number;
  abastecimento: number;
  produtividade: number;
}

interface SituacaoData {
  name: string;
  value: number;
  color: string;
}

interface CentroCustoResponse {
  id: string;
  nome_centro_custo: string;
  codigo_centro_custo?: string;
}

interface CentroCustoItem {
  id: string;
  nome_centro_custo: string;
  codigo_centro_custo?: string;
}

interface ApontamentoItem {
  id: string;
  data: string;
  horimetro_inicial?: number;
  horimetro_final?: number;
  abastecimento?: number;
  situacao: string;
  centro_custo_id: CentroCustoItem | CentroCustoItem[] | null;
}

// Type for grouped data structure
interface GroupedDataItem {
  veiculo: any;
  centroCusto: any;
  registros: any[];
  diasTrabalhados: number;
  quilometragemTotal: number;
  abastecimentoTotal: number;
}

const RelatorioMedicao: React.FC = () => {
  const [vehicleType, setVehicleType] = useState<string>("");
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [desmobilizacao, setDesmobilizacao] = useState<boolean>(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 1, 21), // 21/02/2025
    to: new Date(2025, 2, 20)   // 20/03/2025
  });
  
  const [reportData, setReportData] = useState<(EquipmentReportData | TruckReportData)[]>([]);
  const [manutencaoData, setManutencaoData] = useState<ManutencaoEquipmentData | ManutencaoTruckData | null>(null);
  const [vehicleOptions, setVehicleOptions] = useState<VehicleInfo[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [selectedVehicleDetails, setSelectedVehicleDetails] = useState<VehicleInfo | null>(null);
  const [situacaoData, setSituacaoData] = useState<SituacaoData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(false);
  
  const { toast } = useToast();
  
  // 🔒 PROTEÇÃO DE PÁGINA: Verificar permissão específica
  const { canAccess, isLoading: permissionLoading } = usePermissionGuard({
    requiredPermission: "gestao_maquinas_relatorio_medicao_view"
  });

  useEffect(() => {
    fetchVehicleTypes().then(types => {
      console.log("Vehicle types:", types);
    });
  }, []);

  useEffect(() => {
    if (vehicleType) {
      fetchVehicleOptions();
    }
  }, [vehicleType]);

  const fetchVehicleOptions = async () => {
    if (!vehicleType) {
      setVehicleOptions([]);
      setSelectedVehicle("");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("bd_caminhoes_equipamentos")
        .select("id, placa, modelo, frota, numero_frota, tipo_veiculo, aluguel, imagem_url")
        .eq("tipo_veiculo", vehicleType);
      
      if (error) {
        console.error("Error fetching vehicles:", error);
        toast({
          title: "Erro ao carregar veículos",
          description: "Não foi possível carregar a lista de veículos.",
          variant: "destructive",
        });
        return;
      }
      
      const options = data.map(vehicle => ({
        id: vehicle.id,
        tipo_veiculo: vehicle.tipo_veiculo,
        aluguel: parseFloat(vehicle.aluguel || '0'),
        imagem_url: vehicle.imagem_url,
        label: `${vehicle.frota || ""}${vehicle.numero_frota || ""} - ${vehicle.placa || ""} ${vehicle.modelo ? `(${vehicle.modelo})` : ""}`
      }));
      
      setVehicleOptions(options);
      
      if (options.length === 0) {
        toast({
          title: "Nenhum veículo encontrado",
          description: `Não há veículos do tipo "${vehicleType}" cadastrados.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Erro ao carregar veículos",
        description: "Ocorreu um erro ao buscar os veículos. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchVehicleTypes = async () => {
    try {
      const { data, error } = await supabase
        .from("bd_caminhoes_equipamentos")
        .select("tipo_veiculo")
        .not("tipo_veiculo", "is", null);
        
      if (error) throw error;
      
      const uniqueTypes = [...new Set(data.map(item => item.tipo_veiculo))];
      return uniqueTypes.filter(Boolean);
    } catch (error) {
      console.error("Error fetching vehicle types:", error);
      return ["Caminhão", "Equipamento"];
    }
  };
  
  const fetchReportData = async (): Promise<(EquipmentReportData | TruckReportData)[]> => {
    if (!selectedVehicle || !dateRange?.from || !dateRange?.to) return [];
    
    try {
      const fromDate = formatBrazilianDateToString(dateRange.from);
      const toDate = formatBrazilianDateToString(dateRange.to);
      
      console.log("=== DEBUG RELATÓRIO MEDIÇÃO ===");
      console.log("Período:", fromDate, "à", toDate);
      console.log("Veículo ID:", selectedVehicle);
      console.log("Tipo de Veículo:", vehicleType);
      console.log("Desmobilização:", desmobilizacao);
      
      // Buscar dados de "Operando" e "Disponível" para a tabela principal
      const { data: operandoData, error: operandoError } = await supabase
        .from("bd_registro_apontamento_cam_equipa")
        .select(`
          caminhao_equipamento_id,
          centro_custo_id(id, nome_centro_custo, codigo_centro_custo),
          data,
          horimetro_inicial,
          horimetro_final,
          abastecimento,
          situacao,
          bd_caminhoes_equipamentos!inner(
            id,
            frota,
            numero_frota,
            placa,
            modelo,
            tipo_veiculo,
            aluguel
          )
        `)
        .eq("caminhao_equipamento_id", selectedVehicle)
        .gte("data", fromDate)
        .lte("data", toDate)
        .in("situacao", ["Operando", "Disponível"])
        .not("centro_custo_id", "is", null)
        .order("data", { ascending: true });
      
      if (operandoError) {
        console.error("Error fetching operando data:", operandoError);
        throw operandoError;
      }

      // Buscar dados de "Em Manutenção" para os descontos
      console.log("Buscando dados de manutenção...");
      const { data: manutencaoDataResult, error: manutencaoError } = await supabase
        .from("bd_registro_apontamento_cam_equipa")
        .select(`
          caminhao_equipamento_id,
          data,
          situacao,
          bd_caminhoes_equipamentos!inner(
            id,
            aluguel
          )
        `)
        .eq("caminhao_equipamento_id", selectedVehicle)
        .gte("data", fromDate)
        .lte("data", toDate)
        .eq("situacao", "Em Manutenção")
        .order("data", { ascending: true });
      
      if (manutencaoError) {
        console.error("Error fetching manutenção data:", manutencaoError);
      }

      // Buscar TODOS os apontamentos para identificar última data real
      console.log("Buscando todos os apontamentos para desmobilização...");
      const { data: todosApontamentos, error: todosError } = await supabase
        .from("bd_registro_apontamento_cam_equipa")
        .select("data, situacao")
        .eq("caminhao_equipamento_id", selectedVehicle)
        .gte("data", fromDate)
        .lte("data", toDate)
        .in("situacao", ["Operando", "Disponível", "Em Manutenção"])
        .order("data", { ascending: false });

      if (todosError) {
        console.error("Error fetching todos apontamentos:", todosError);
      }

      console.log("Dados Operando/Disponível:", operandoData?.length || 0, "registros");
      console.log("Dados Manutenção:", manutencaoDataResult?.length || 0, "registros");
      console.log("Todos apontamentos:", todosApontamentos?.length || 0, "registros");

      if (!operandoData || operandoData.length === 0) {
        console.log("Nenhum dado 'Operando/Disponível' encontrado para os filtros aplicados");
        return [];
      }

      // Obter aluguel mensal do veículo
      const veiculo = Array.isArray(operandoData[0].bd_caminhoes_equipamentos) 
        ? operandoData[0].bd_caminhoes_equipamentos[0] 
        : operandoData[0].bd_caminhoes_equipamentos;
      
      const aluguelMensal = parseFloat(veiculo?.aluguel || '0');

      // IMPLEMENTAÇÃO DAS 4 PARTES CONFORME ESPECIFICADO
      const totalDiasOperandoDisponiveis = operandoData.length;
      const diasManutencao = manutencaoDataResult?.length || 0;
      
      console.log("=== FÓRMULA EQUIPAMENTO (4 PARTES) ===");
      console.log("1º parte - Aluguel mensal:", aluguelMensal);
      console.log("1º parte - Dias em manutenção:", diasManutencao);
      
      if (vehicleType === "Equipamento") {
        // 1º parte: VALOR UNIT. (R$/h) = Total Mensal ÷ 200h
        const valorUnitarioHora = aluguelMensal / 200;
        console.log("1º parte - Valor unitário por hora (Total Mensal ÷ 200):", valorUnitarioHora);
        
        // Preparar array de descontos
        const descontos: DescontoData[] = [];
        
        // 2º parte: Desconto de Manutenção
        if (diasManutencao > 0) {
          const quantidadeManutencao = (200 / 30) * diasManutencao;
          const valorManutencao = quantidadeManutencao * valorUnitarioHora;
          
          console.log("2º parte - Quantidade de manutenção ((200 ÷ 30) × dias manutenção):", quantidadeManutencao);
          console.log("2º parte - Valor manutenção (quantidade × valor unitário):", valorManutencao);
          
          descontos.push({
            tipoDesconto: "DESCONTO DE MANUTENÇÃO",
            valorUnitario: valorUnitarioHora,
            qtdHoras: quantidadeManutencao,
            valor: valorManutencao
          });
        }
        
        // 3º parte: Desconto de Desmobilização (se checkbox estiver ativo)
        if (desmobilizacao && todosApontamentos && todosApontamentos.length > 0) {
          const ultimaDataApontamento = new Date(todosApontamentos[0].data);
          const dataFinalPeriodo = dateRange.to;
          
          // Calcular diferença em dias
          const diferencaMs = dataFinalPeriodo.getTime() - ultimaDataApontamento.getTime();
          const diasDesmobilizado = Math.max(0, Math.floor(diferencaMs / (1000 * 60 * 60 * 24)));
          
          console.log("=== CÁLCULO DESMOBILIZAÇÃO ===");
          console.log("Última data apontamento:", ultimaDataApontamento.toISOString().split('T')[0]);
          console.log("Data final período:", dataFinalPeriodo.toISOString().split('T')[0]);
          console.log("Dias desmobilizado:", diasDesmobilizado);
          
          if (diasDesmobilizado > 0) {
            const qtdHorasDesmobilizado = (200 / 30) * diasDesmobilizado;
            const valorDesmobilizacao = qtdHorasDesmobilizado * valorUnitarioHora;
            
            console.log("QTD horas desmobilizado ((200 ÷ 30) × dias):", qtdHorasDesmobilizado);
            console.log("Valor desmobilização:", valorDesmobilizacao);
            
            descontos.push({
              tipoDesconto: "DESCONTO DE DESMOBILIZAÇÃO",
              valorUnitario: valorUnitarioHora,
              qtdHoras: qtdHorasDesmobilizado,
              valor: valorDesmobilizacao
            });
          }
        }
        
        // Calcular total dos descontos
        const totalDescontos = descontos.reduce((acc, desc) => acc + desc.valor, 0);
        
        // 3º parte: Horas Restantes = 200 - Total de horas descontadas
        const totalHorasDescontadas = descontos.reduce((acc, desc) => acc + (desc.qtdHoras || 0), 0);
        const horasRestantes = 200 - totalHorasDescontadas;
        console.log("3º parte - Horas restantes (200 - total descontos):", horasRestantes);
        
        // NOVA LÓGICA DE PRODUTIVIDADE: Calcular total de horímetros do período
        let totalHorimetrosPeriodo = 0;
        operandoData.forEach(item => {
          if (item.horimetro_inicial !== null && item.horimetro_inicial !== undefined && 
              item.horimetro_final !== null && item.horimetro_final !== undefined) {
            const diferenca = item.horimetro_final - item.horimetro_inicial;
            if (diferenca > 0) {
              totalHorimetrosPeriodo += diferenca;
            }
          }
        });
        
        console.log("=== NOVA FÓRMULA PRODUTIVIDADE ===");
        console.log("Total horímetros do período (soma das diferenças):", totalHorimetrosPeriodo);
        
        // Processar dados de manutenção para exibição
        const calculatedManutencaoData: ManutencaoEquipmentData = {
          valorUnitario: valorUnitarioHora,
          qtdHoras: totalHorasDescontadas,
          valor: totalDescontos,
          descontos: descontos
        };
        
        setManutencaoData(calculatedManutencaoData);

        // Agrupar dados por centro de custo
        const groupedData: Record<string, any> = operandoData.reduce((acc, item) => {
          const veiculo = Array.isArray(item.bd_caminhoes_equipamentos) 
            ? item.bd_caminhoes_equipamentos[0] 
            : item.bd_caminhoes_equipamentos;
          
          const centroCusto = Array.isArray(item.centro_custo_id) 
            ? item.centro_custo_id[0] 
            : item.centro_custo_id;
          
          if (!veiculo || !centroCusto) {
            console.log("Registro ignorado - dados incompletos:", { veiculo: !!veiculo, centroCusto: !!centroCusto });
            return acc;
          }
          
          const key = `${veiculo.id}_${centroCusto.id}`;
          
          if (!acc[key]) {
            acc[key] = {
              veiculo,
              centroCusto,
              registros: [],
              diasTrabalhados: 0,
              abastecimentoTotal: 0
            };
          }
          
          acc[key].registros.push(item);
          acc[key].diasTrabalhados += 1;
          
          // Somar abastecimento real
          if (item.abastecimento && item.abastecimento > 0) {
            acc[key].abastecimentoTotal += item.abastecimento;
          }
          
          return acc;
        }, {} as Record<string, any>);

        console.log("Dados agrupados por centro de custo:", Object.keys(groupedData).length, "grupos");

        // Gerar dados específicos para equipamento
        const reportData: EquipmentReportData[] = Object.values(groupedData).map((group: any) => {
          const veiculo = group.veiculo;
          const centroCusto = group.centroCusto;
          
          const descricaoServico = `${veiculo.tipo_veiculo?.toUpperCase() || 'EQUIPAMENTO'} - ${veiculo.frota || ''}${veiculo.numero_frota || ''} - ${centroCusto.codigo_centro_custo || centroCusto.nome_centro_custo}`;
          
          // 4º parte: (horas restantes ÷ total dias) × dias do centro de custo
          const horasDisponiveis = totalDiasOperandoDisponiveis > 0 
            ? (horasRestantes / totalDiasOperandoDisponiveis) * group.diasTrabalhados 
            : 0;
          
          const valorPeriodo = horasDisponiveis * valorUnitarioHora;
          
          // NOVA FÓRMULA DE PRODUTIVIDADE: (totalHorimetrosPeriodo / horasRestantes) × horasDisponiveis
          const produtividade = horasRestantes > 0 
            ? (totalHorimetrosPeriodo / horasRestantes) * horasDisponiveis 
            : 0;
          
          // Calcular abastecimento proporcional
          const totalAbastecimentoPeriodo = Object.values(groupedData).reduce((total: number, g: any) => {
            return total + g.abastecimentoTotal;
          }, 0);
          
          const totalDiasTrabalhados = Object.values(groupedData).reduce((total: number, g: any) => {
            return total + g.diasTrabalhados;
          }, 0);

          const abastecimentoProporcional = totalDiasTrabalhados > 0
            ? (totalAbastecimentoPeriodo / totalDiasTrabalhados) * group.diasTrabalhados
            : 0;
          
          const mediaAbastecimento = produtividade > 0 ? abastecimentoProporcional / produtividade : 0;
          
          console.log(`=== CÁLCULOS EQUIPAMENTO - ${centroCusto.codigo_centro_custo} ===`);
          console.log("Dias trabalhados neste centro:", group.diasTrabalhados);
          console.log("Horas disponíveis (restantes ÷ total × dias centro):", horasDisponiveis);
          console.log("Valor período (horas × valor unitário):", valorPeriodo);
          console.log("NOVA PRODUTIVIDADE (total horímetros / horas restantes × horas disponíveis):", produtividade);
          console.log("Total horímetros período:", totalHorimetrosPeriodo);
          console.log("Horas restantes:", horasRestantes);
          console.log("Abastecimento proporcional:", abastecimentoProporcional);
          console.log("Média abastecimento (L/H):", mediaAbastecimento);
          
          return {
            id: `${veiculo.id}_${centroCusto.id}`,
            label: descricaoServico,
            tipo_veiculo: veiculo.tipo_veiculo,
            centro_custo: centroCusto.codigo_centro_custo || centroCusto.nome_centro_custo,
            diasTrabalhados: group.diasTrabalhados,
            totalMensal: aluguelMensal,
            quantidadeHoras: 200, // Sempre 200h conforme especificado
            valorUnitarioHora: valorUnitarioHora,
            horasDisponiveis: horasDisponiveis,
            valorPeriodo: valorPeriodo,
            produtividade: produtividade, // NOVA FÓRMULA APLICADA
            abastecimento: abastecimentoProporcional,
            mediaAbastecimento: mediaAbastecimento,
            rastreador: produtividade
          } as EquipmentReportData;
        });

        console.log("Dados finais do relatório:", reportData.length, "itens");
        return reportData;

      } else {
        // === NOVA LÓGICA PARA CAMINHÕES COM DESCONTOS ===
        console.log("=== FÓRMULA CAMINHÃO COM DESCONTOS ===");
        
        // 1º parte: Valor diário = aluguel_mensal / 30
        const valorDiarioAluguel = aluguelMensal / 30;
        console.log("1º parte - Valor diário (aluguel_mensal / 30):", valorDiarioAluguel);
        
        // Preparar array de descontos para caminhões
        const descontos: DescontoData[] = [];
        
        // 2º parte: Desconto de Manutenção
        if (diasManutencao > 0) {
          const valorManutencao = valorDiarioAluguel * diasManutencao;
          console.log("2º parte - Desconto manutenção (valor_diário × dias_manutenção):", valorManutencao);
          
          descontos.push({
            tipoDesconto: "DESCONTO DE MANUTENÇÃO",
            valorUnitario: valorDiarioAluguel,
            qtdDias: diasManutencao,
            valor: valorManutencao
          });
        }
        
        // 3º parte: Desconto de Desmobilização (se checkbox estiver ativo)
        if (desmobilizacao && todosApontamentos && todosApontamentos.length > 0) {
          const ultimaDataApontamento = new Date(todosApontamentos[0].data);
          const dataFinalPeriodo = dateRange.to;
          
          // Calcular diferença em dias
          const diferencaMs = dataFinalPeriodo.getTime() - ultimaDataApontamento.getTime();
          const diasDesmobilizado = Math.max(0, Math.floor(diferencaMs / (1000 * 60 * 60 * 24)));
          
          console.log("=== CÁLCULO DESMOBILIZAÇÃO CAMINHÃO ===");
          console.log("Última data apontamento:", ultimaDataApontamento.toISOString().split('T')[0]);
          console.log("Data final período:", dataFinalPeriodo.toISOString().split('T')[0]);
          console.log("Dias desmobilizado:", diasDesmobilizado);
          
          if (diasDesmobilizado > 0) {
            const valorDesmobilizacao = valorDiarioAluguel * diasDesmobilizado;
            console.log("Valor desmobilização (valor_diário × dias):", valorDesmobilizacao);
            
            descontos.push({
              tipoDesconto: "DESCONTO DE DESMOBILIZAÇÃO",
              valorUnitario: valorDiarioAluguel,
              qtdDias: diasDesmobilizado,
              valor: valorDesmobilizacao
            });
          }
        }
        
        // Calcular total dos descontos
        const totalDescontos = descontos.reduce((acc, desc) => acc + desc.valor, 0);
        const totalDiasDescontados = descontos.reduce((acc, desc) => acc + (desc.qtdDias || 0), 0);
        
        console.log("Total descontos caminhão:", totalDescontos);
        console.log("Total dias descontados:", totalDiasDescontados);
        
        // 4º parte: Valor restante para divisão
        const valorRestante = aluguelMensal - totalDescontos;
        console.log("4º parte - Valor restante (aluguel - descontos):", valorRestante);
        
        const valorDiarioParaDivisao = totalDiasOperandoDisponiveis > 0 ? valorRestante / totalDiasOperandoDisponiveis : 0;
        console.log("4º parte - Valor diário para divisão:", valorDiarioParaDivisao);

        // Processar dados de manutenção para exibição
        const calculatedManutencaoData: ManutencaoTruckData = {
          valorUnitario: valorDiarioAluguel,
          qtdDias: totalDiasDescontados,
          valor: totalDescontos,
          descontos: descontos
        };
        
        setManutencaoData(calculatedManutencaoData);

        // Agrupar dados por centro de custo
        const groupedData: Record<string, any> = operandoData.reduce((acc, item) => {
          const veiculo = Array.isArray(item.bd_caminhoes_equipamentos) 
            ? item.bd_caminhoes_equipamentos[0] 
            : item.bd_caminhoes_equipamentos;
          
          const centroCusto = Array.isArray(item.centro_custo_id) 
            ? item.centro_custo_id[0] 
            : item.centro_custo_id;
          
          if (!veiculo || !centroCusto) {
            console.log("Registro ignorado - dados incompletos:", { veiculo: !!veiculo, centroCusto: !!centroCusto });
            return acc;
          }
          
          const key = `${veiculo.id}_${centroCusto.id}`;
          
          if (!acc[key]) {
            acc[key] = {
              veiculo,
              centroCusto,
              registros: [],
              diasTrabalhados: 0,
              quilometragemTotal: 0,
              abastecimentoTotal: 0
            };
          }
          
          acc[key].registros.push(item);
          acc[key].diasTrabalhados += 1;
          
          // Calcular quilometragem apenas se ambos os valores existirem
          if (item.horimetro_inicial !== null && item.horimetro_inicial !== undefined && 
              item.horimetro_final !== null && item.horimetro_final !== undefined) {
            const quilometragem = item.horimetro_final - item.horimetro_inicial;
            if (quilometragem > 0) {
              acc[key].quilometragemTotal += quilometragem;
            }
          }
          
          // Somar abastecimento real
          if (item.abastecimento && item.abastecimento > 0) {
            acc[key].abastecimentoTotal += item.abastecimento;
          }
          
          return acc;
        }, {} as Record<string, any>);

        console.log("Dados agrupados por centro de custo:", Object.keys(groupedData).length, "grupos");

        // Gerar dados específicos baseado no tipo de veículo
        const reportData: TruckReportData[] = Object.values(groupedData).map((group: any) => {
          const veiculo = group.veiculo;
          const centroCusto = group.centroCusto;
          
          const descricaoServico = `${veiculo.tipo_veiculo?.toUpperCase() || 'VEÍCULO'} - ${veiculo.frota || ''}${veiculo.numero_frota || ''} - ${centroCusto.codigo_centro_custo || centroCusto.nome_centro_custo}`;
          
          console.log(`=== CÁLCULOS CAMINHÃO (NOVAS FÓRMULAS) - ${centroCusto.codigo_centro_custo} ===`);
          console.log("Dias trabalhados neste centro:", group.diasTrabalhados);
          console.log("Valor diário para divisão:", valorDiarioParaDivisao);
          
          // QTD/DIA: Dias trabalhados específicos deste centro de custo
          const qtdDia = group.diasTrabalhados;
          
          // VALOR (R$): Valor diário para divisão × Dias trabalhados no centro de custo
          const valor = valorDiarioParaDivisao * qtdDia;
          
          // PRODUTIVIDADE: (Total KM do período ÷ Total dias) × QTD/DIA
          const produtividadeKmDia = totalDiasOperandoDisponiveis > 0 ? group.quilometragemTotal / group.diasTrabalhados : 0;
          const produtividade = produtividadeKmDia * qtdDia;
          
          // ABASTECIMENTO: (Total L do período ÷ Total dias) × QTD/DIA
          const abastecimentoLDia = totalDiasOperandoDisponiveis > 0 ? group.abastecimentoTotal / group.diasTrabalhados : 0;
          const abastecimento = abastecimentoLDia * qtdDia;
          
          // MÉDIA ABAST.: PRODUTIVIDADE ÷ ABASTECIMENTO (KM/L) - CORRIGIDO
          const mediaAbastecimento = abastecimento > 0 ? produtividade / abastecimento : 0;
          
          console.log("Produtividade Km/dia total:", produtividadeKmDia);
          console.log("Produtividade calculada (item):", produtividade);
          console.log("Abastecimento L/dia total:", abastecimentoLDia);
          console.log("Abastecimento calculado (item):", abastecimento);
          console.log("Valor calculado (4 partes):", valor);
          console.log("Média abastecimento (KM/L):", mediaAbastecimento);
          
          return {
            id: `${veiculo.id}_${centroCusto.id}`,
            label: descricaoServico,
            tipo_veiculo: veiculo.tipo_veiculo,
            centro_custo: centroCusto.codigo_centro_custo || centroCusto.nome_centro_custo,
            diasTrabalhados: group.diasTrabalhados,
            totalMensal: aluguelMensal,
            qtdDia: qtdDia,
            valor: valor,
            quilometragem: group.quilometragemTotal,
            abastecimento: group.abastecimentoTotal,
            mediaAbastecimento: mediaAbastecimento,
            rastreador: group.quilometragemTotal
          } as TruckReportData;
        });

        console.log("Dados finais do relatório:", reportData.length, "itens");
        return reportData;
      }
    } catch (error) {
      console.error("Error in fetchReportData:", error);
      toast({
        title: "Erro ao buscar dados",
        description: "Não foi possível carregar os dados do relatório.",
        variant: "destructive",
      });
      return [];
    }
  };
  
  const getSituationDescription = (situation: string | null): string => {
    if (!situation) return "Não informado";
    
    const descriptions: Record<string, string> = {
      "Trabalhado": "Veículo em operação",
      "Manutenção": "Veículo em manutenção",
      "À Disposição": "Veículo à disposição",
      "Falta": "Operador ausente",
      "Feriado": "Feriado",
      "Chuva": "Serviço cancelado devido à chuva",
      "Intempérie": "Serviço cancelado devido à intempérie"
    };
    
    return descriptions[situation] || situation;
  };
  
  const resetFilters = () => {
    setVehicleType("");
    setSelectedVehicle("");
    setDesmobilizacao(false);
    setDateRange({
      from: new Date(2025, 1, 21),
      to: new Date(2025, 2, 20)
    });
    setShowReport(false);
    setShowEmptyState(false);
  };

  const handleTryDifferentPeriod = () => {
    setShowEmptyState(false);
    setShowReport(false);
    setDateRange({
      from: new Date(2025, 1, 21),
      to: new Date(2025, 2, 20)
    });
  };

  const generateReport = async () => {
    if (!vehicleType || !selectedVehicle || !dateRange?.from || !dateRange?.to) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios para gerar o relatório.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setShowEmptyState(false);
    
    try {
      const vehicleDetail = vehicleOptions.find(v => v.id === selectedVehicle);
      if (!vehicleDetail) {
        toast({
          title: "Veículo não encontrado",
          description: "O veículo selecionado não foi encontrado.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedVehicleDetails(vehicleDetail);
      
      const reportData = await fetchReportData();
      
      if (reportData.length === 0) {
        setShowEmptyState(true);
        setShowReport(false);
        return;
      }
      
      setReportData(reportData);
      setShowReport(true);
      setShowEmptyState(false);
      
      toast({
        title: "Relatório gerado",
        description: `Relatório gerado com ${reportData.length} registros encontrados.`,
      });
      
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Erro ao gerar relatório",
        description: "Ocorreu um erro ao gerar o relatório. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportToExcel = () => {
    if (!reportData.length || !selectedVehicleDetails || !dateRange?.from || !dateRange?.to) {
      toast({
        title: "Sem dados para exportar",
        description: "Gere um relatório primeiro.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log("=== INICIANDO EXPORTAÇÃO EXCEL ===");
      console.log("Report data:", reportData.length, "registros");
      console.log("Vehicle details:", selectedVehicleDetails);
      console.log("Date range:", dateRange);
      console.log("Vehicle type:", vehicleType);
      console.log("Manutenção data:", manutencaoData);
      
      downloadRelatorioMedicaoExcel(
        reportData,
        manutencaoData,
        selectedVehicleDetails,
        { from: dateRange.from, to: dateRange.to },
        vehicleType
      );
      
      toast({
        title: "Exportação concluída",
        description: "Os dados foram exportados para Excel com múltiplas abas.",
      });
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast({
        title: "Erro na exportação",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao exportar para Excel.",
        variant: "destructive",
      });
    }
  };

  const handleExportToPDF = async () => {
    if (!reportData.length || !selectedVehicleDetails || !dateRange?.from || !dateRange?.to) {
      toast({
        title: "Sem dados para exportar",
        description: "Gere um relatório primeiro.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const periodo = `${format(dateRange.from, 'dd-MM-yyyy')}_${format(dateRange.to, 'dd-MM-yyyy')}`;
      
      await generateReportPDF(
        selectedVehicleDetails.label,
        periodo
      );
      
      toast({
        title: "PDF gerado com sucesso",
        description: "O relatório foi exportado em PDF.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Ocorreu um erro ao gerar o PDF. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Verificação de permissão
  if (permissionLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Verificando permissões...</span>
        </div>
      </MainLayout>
    );
  }

  if (!canAccess) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Acesso Negado</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Você não tem permissão para acessar esta página.</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  // Calcular total do período baseado no tipo - ATUALIZADO para subtrair descontos
  const calculateTotalPeriodo = () => {
    if (vehicleType === "Equipamento") {
      const equipmentData = reportData as EquipmentReportData[];
      const totalServicos = equipmentData.reduce((acc, item) => acc + (item.valorPeriodo || 0), 0);
      
      // Subtrair descontos se existirem
      const equipmentMaintenance = manutencaoData as ManutencaoEquipmentData;
      const totalDescontos = equipmentMaintenance?.valor || 0;
      
      return totalServicos - totalDescontos;
    } else {
      const truckData = reportData as TruckReportData[];
      const totalServicos = truckData.reduce((acc, item) => acc + (item.valor || 0), 0);
      
      // Subtrair descontos de caminhões
      const truckMaintenance = manutencaoData as ManutencaoTruckData;
      const totalDescontos = truckMaintenance?.valor || 0;
      
      return totalServicos - totalDescontos;
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Relatório de Medição</h2>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="tipo" className="font-medium flex items-center gap-1">
                  Tipo de Veículo
                  <span className="text-red-500">*</span>
                </label>
                <Select value={vehicleType} onValueChange={setVehicleType}>
                  <SelectTrigger className={!vehicleType ? "border-red-200" : ""}>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Caminhão">Caminhão</SelectItem>
                    <SelectItem value="Equipamento">Equipamento</SelectItem>
                    <SelectItem value="Prancha">Prancha</SelectItem>
                    <SelectItem value="Van">Van</SelectItem>
                    <SelectItem value="Ônibus">Ônibus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col gap-2">
                <label htmlFor="identificacao" className="font-medium flex items-center gap-1">
                  Identificação
                  <span className="text-red-500">*</span>
                </label>
                <Select 
                  value={selectedVehicle} 
                  onValueChange={setSelectedVehicle} 
                  disabled={!vehicleType || isLoading}
                >
                  <SelectTrigger className={!selectedVehicle ? "border-red-200" : ""}>
                    <SelectValue 
                      placeholder={
                        !vehicleType 
                          ? "Selecione o tipo primeiro" 
                          : isLoading 
                            ? "Carregando veículos..." 
                            : vehicleOptions.length === 0 
                              ? "Nenhum veículo disponível" 
                              : "Selecione o veículo"
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleOptions.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {vehicleType && vehicleOptions.length === 0 && !isLoading && (
                  <p className="text-sm text-orange-600">
                    Nenhum veículo do tipo "{vehicleType}" encontrado
                  </p>
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                <label htmlFor="periodo" className="font-medium">Período</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, 'dd/MM/yyyy')} -{' '}
                            {format(dateRange.to, 'dd/MM/yyyy')}
                          </>
                        ) : (
                          format(dateRange.from, 'dd/MM/yyyy')
                        )
                      ) : (
                        <span>Selecione um período</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarDateRangePicker
                      date={dateRange}
                      onDateChange={setDateRange}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {(vehicleType === "Equipamento" || vehicleType === "Caminhão") && (
                <div className="flex flex-col gap-2">
                  <label htmlFor="desmobilizacao" className="font-medium">Desmobilização</label>
                  <div className="flex items-center space-x-2 h-10">
                    <input
                      type="checkbox"
                      id="desmobilizacao"
                      checked={desmobilizacao}
                      onChange={(e) => setDesmobilizacao(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <label htmlFor="desmobilizacao" className="text-sm">
                      Aplicar desconto de desmobilização
                    </label>
                  </div>
                </div>
              )}
              
              <div className="flex items-end gap-2">
                <Button
                  onClick={generateReport}
                  className="flex-1"
                  disabled={isLoading || !vehicleType || !selectedVehicle || !dateRange?.from || !dateRange?.to}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Gerando...
                    </span>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Gerar Relatório
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={resetFilters}
                  disabled={isLoading}
                >
                  <X className="mr-2 h-4 w-4" />
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {isLoading && <RelatorioMedicaoLoadingState />}
        
        {showEmptyState && (
          <RelatorioMedicaoEmptyState
            vehicleName={selectedVehicleDetails?.label}
            periodo={dateRange?.from && dateRange?.to ? 
              `${format(dateRange.from, 'dd/MM/yyyy')} à ${format(dateRange.to, 'dd/MM/yyyy')}` : 
              undefined
            }
            onTryDifferentPeriod={handleTryDifferentPeriod}
          />
        )}
        
        {!showReport && !showEmptyState && !isLoading && <RelatorioMedicaoPlaceholder />}
        
        {showReport && reportData.length > 0 && dateRange?.from && dateRange?.to && !isLoading && (
          <div>
            <div className="flex justify-end gap-2 mb-4">
              <Button variant="outline" onClick={handleExportToExcel}>
                <FileDown className="mr-2 h-4 w-4" />
                Exportar Excel
              </Button>
              <Button variant="outline" onClick={handleExportToPDF}>
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
            <RelatorioMedicaoDetalhado
              vehicleData={reportData}
              dateRange={{ from: dateRange.from, to: dateRange.to }}
              manutencaoData={manutencaoData}
              tipoVeiculo={vehicleType as "Caminhão" | "Equipamento"}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default RelatorioMedicao;
