import React, { useState } from "react";
import { FileDown, FileText, BarChart3, Calendar, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { usePermissionGuard } from "@/hooks/usePermissionGuard";
import { useRelatorioAplicacao } from "@/hooks/relatorio-aplicacao/useRelatorioAplicacao";
import RelatorioAplicacaoHeader from "@/components/relatorio-aplicacao/RelatorioAplicacaoHeader";
import RelatorioAplicacaoResumo from "@/components/relatorio-aplicacao/RelatorioAplicacaoResumo";
import RelatorioAplicacaoTabela from "@/components/relatorio-aplicacao/RelatorioAplicacaoTabela";
import RelatorioAplicacaoObservacoes from "@/components/relatorio-aplicacao/RelatorioAplicacaoObservacoes";
import RelatorioAplicacaoAnexos from "@/components/relatorio-aplicacao/RelatorioAplicacaoAnexos";
import RelatorioAplicacaoAssinaturas from "@/components/relatorio-aplicacao/RelatorioAplicacaoAssinaturas";

interface FiltrosFormData {
  centro_custo_id: string;
  data_aplicacao: string;
  turno: string;
}

const RelatorioAplicacaoDiaria: React.FC = () => {
  // 🔒 PROTEÇÃO DE PÁGINA: Apenas SuperAdm pode acessar
  const { canAccess, isLoading: permissionLoading } = usePermissionGuard({
    requiredPermission: "relatorio_aplicacao_view"
  });

  const [filtros, setFiltros] = useState<FiltrosFormData>({
    centro_custo_id: "",
    data_aplicacao: "",
    turno: ""
  });
  const [relatorioGerado, setRelatorioGerado] = useState(false);
  const { toast } = useToast();

  const {
    centrosCusto,
    dadosRelatorio,
    isLoading,
    error,
    gerarRelatorio,
    exportarPDF,
    exportarExcel
  } = useRelatorioAplicacao();

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
    return null; // O hook já redireciona para página de erro
  }

  const handleInputChange = (field: keyof FiltrosFormData, value: string) => {
    setFiltros(prev => ({ ...prev, [field]: value }));
  };

  const handleGerarRelatorio = async () => {
    if (!filtros.centro_custo_id || !filtros.data_aplicacao) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o Centro de Custo e a Data da Aplicação",
        variant: "destructive"
      });
      return;
    }

    try {
      await gerarRelatorio(filtros);
      setRelatorioGerado(true);
      toast({
        title: "Relatório gerado com sucesso",
        description: "Os dados foram carregados e estão prontos para visualização"
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar relatório",
        description: "Não foi possível carregar os dados do relatório",
        variant: "destructive"
      });
    }
  };

  const handleLimparFiltros = () => {
    setFiltros({
      centro_custo_id: "",
      data_aplicacao: "",
      turno: ""
    });
    setRelatorioGerado(false);
  };

  const handleExportarPDF = async () => {
    if (!relatorioGerado || !dadosRelatorio) {
      toast({
        title: "Gere o relatório primeiro",
        description: "É necessário gerar o relatório antes de exportar",
        variant: "destructive"
      });
      return;
    }

    try {
      await exportarPDF(dadosRelatorio, filtros);
      toast({
        title: "PDF exportado com sucesso",
        description: "O arquivo foi baixado para o seu dispositivo"
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar PDF",
        description: "Não foi possível gerar o arquivo PDF",
        variant: "destructive"
      });
    }
  };

  const handleExportarExcel = async () => {
    if (!relatorioGerado || !dadosRelatorio) {
      toast({
        title: "Gere o relatório primeiro",
        description: "É necessário gerar o relatório antes de exportar",
        variant: "destructive"
      });
      return;
    }

    try {
      await exportarExcel(dadosRelatorio, filtros);
      toast({
        title: "Excel exportado com sucesso",
        description: "O arquivo foi baixado para o seu dispositivo"
      });
    } catch (error) {
      toast({
        title: "Erro ao exportar Excel",
        description: "Não foi possível gerar o arquivo Excel",
        variant: "destructive"
      });
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6 bg-background min-h-screen">
        {/* Header */}
        <RelatorioAplicacaoHeader />

        {/* Seção 0 - Filtros Superiores */}
        <Card className="w-full">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Filtros do Relatório
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* Centro de Custo */}
              <div className="space-y-2">
                <Label htmlFor="centro_custo" className="text-sm font-medium">
                  Centro de Custo *
                </Label>
                <Select
                  value={filtros.centro_custo_id}
                  onValueChange={(value) => handleInputChange('centro_custo_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o centro de custo" />
                  </SelectTrigger>
                  <SelectContent>
                    {centrosCusto.map((centro) => (
                      <SelectItem key={centro.id} value={centro.id}>
                        {centro.codigo_centro_custo} - {centro.nome_centro_custo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Data da Aplicação */}
              <div className="space-y-2">
                <Label htmlFor="data_aplicacao" className="text-sm font-medium">
                  Data da Aplicação *
                </Label>
                <Input
                  id="data_aplicacao"
                  type="date"
                  value={filtros.data_aplicacao}
                  onChange={(e) => handleInputChange('data_aplicacao', e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Turno */}
              <div className="space-y-2">
                <Label htmlFor="turno" className="text-sm font-medium">
                  Turno
                </Label>
                <Select
                  value={filtros.turno}
                  onValueChange={(value) => handleInputChange('turno', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o turno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manhã">Manhã</SelectItem>
                    <SelectItem value="Tarde">Tarde</SelectItem>
                    <SelectItem value="Noite">Noite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Botões de Ação */}
              <div className="space-y-2">
                <Label className="text-sm font-medium opacity-0">Ações</Label>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleGerarRelatorio}
                    disabled={isLoading}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    {isLoading ? "Gerando..." : "Gerar Relatório"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Botões de Exportação e Limpeza */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleLimparFiltros}
                variant="outline"
                size="sm"
              >
                Limpar Filtros
              </Button>
              <Button
                onClick={handleExportarPDF}
                variant="outline"
                size="sm"
                disabled={!relatorioGerado}
              >
                <FileDown className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
              <Button
                onClick={handleExportarExcel}
                variant="outline"
                size="sm"
                disabled={!relatorioGerado}
              >
                <FileText className="h-4 w-4 mr-2" />
                Exportar Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Conteúdo do Relatório */}
        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <div className="text-center text-destructive">
                <p className="font-medium">Erro ao carregar dados</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {relatorioGerado && dadosRelatorio && !error && (
          <div className="space-y-6">
            {/* Seção 1 - Resumo Operacional */}
            <RelatorioAplicacaoResumo dados={dadosRelatorio} filtros={filtros} />

            {/* Seção 2 - Aplicação por Logradouro */}
            <RelatorioAplicacaoTabela dados={dadosRelatorio.aplicacoes} />

            {/* Seção 3 - Observações Gerais */}
            <RelatorioAplicacaoObservacoes />

            {/* Seção 4 - Anexos */}
            <RelatorioAplicacaoAnexos />

            {/* Seção 5 - Rodapé de Assinaturas */}
            <RelatorioAplicacaoAssinaturas />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default RelatorioAplicacaoDiaria;