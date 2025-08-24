import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText } from 'lucide-react';

interface AplicacaoData {
  id: string;
  data_aplicacao: string;
  logradouro_aplicado: string;
  hora_chegada_local: string;
  hora_saida_caminhao?: string;
  estaca_inicial?: number;
  estaca_final?: number;
  bordo?: string;
  tonelada_aplicada?: number;
  comprimento?: number;
  largura_media?: number;
  espessura?: number;
  area_calculada?: number;
  anotacoes_apontador?: string;
  lista_entrega_id?: {
    caminhao_id?: {
      frota?: string;
      numero_frota?: string;
      placa?: string;
    };
    equipe_id?: {
      nome_equipe: string;
      encarregado_id?: {
        nome_completo: string;
      };
    };
    apontador_id?: {
      nome_completo: string;
    };
  };
}

interface RelatorioAplicacaoTabelaProps {
  dados: AplicacaoData[];
}

const RelatorioAplicacaoTabela: React.FC<RelatorioAplicacaoTabelaProps> = ({ dados }) => {
  const formatData = (data: string) => {
    try {
      return new Date(data).toLocaleDateString('pt-BR');
    } catch {
      return data;
    }
  };

  const formatHora = (hora: string) => {
    if (!hora) return '-';
    return hora.substring(0, 5); // Remove segundos se houver
  };

  const formatNumber = (num: number | null | undefined, decimals = 2) => {
    if (num === null || num === undefined) return '-';
    return num.toFixed(decimals);
  };

  const getVehicleLabel = (caminhao: any) => {
    if (!caminhao) return '-';
    const frota = caminhao.frota || '';
    const numero = caminhao.numero_frota || '';
    const placa = caminhao.placa || '';
    return `${frota}${numero} - ${placa}`.trim();
  };

  const getPrimeiroNome = (nomeCompleto: string) => {
    if (!nomeCompleto) return '-';
    return nomeCompleto.split(' ')[0];
  };

  const getEncarregado = (equipe: any) => {
    return getPrimeiroNome(equipe?.encarregado_id?.nome_completo);
  };

  if (!dados || dados.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Aplicação por Logradouro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">Nenhuma aplicação encontrada</p>
            <p className="text-sm">Para os filtros selecionados não foram encontrados registros de aplicação.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Aplicação por Logradouro
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div className="min-w-[1200px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold text-center">Data</TableHead>
                  <TableHead className="font-semibold text-center">Logradouro</TableHead>
                  <TableHead className="font-semibold text-center">Frota</TableHead>
                  <TableHead className="font-semibold text-center">Estaca Inicial</TableHead>
                  <TableHead className="font-semibold text-center">Estaca Final</TableHead>
                  <TableHead className="font-semibold text-center">Bordo</TableHead>
                  <TableHead className="font-semibold text-center">(T)</TableHead>
                  <TableHead className="font-semibold text-center">Comp.</TableHead>
                  <TableHead className="font-semibold text-center">Larg. Média</TableHead>
                  <TableHead className="font-semibold text-center">Espessura</TableHead>
                  <TableHead className="font-semibold text-center">Área (m²)</TableHead>
                  <TableHead className="font-semibold text-center">Encarregado</TableHead>
                  <TableHead className="font-semibold text-center">Apontador</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dados.map((aplicacao, index) => (
                  <TableRow key={aplicacao.id} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                    <TableCell className="text-center font-medium">
                      {formatData(aplicacao.data_aplicacao)}
                    </TableCell>
                    <TableCell className="text-center">
                      {aplicacao.logradouro_aplicado || '-'}
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm">
                      {getVehicleLabel(aplicacao.lista_entrega_id?.caminhao_id)}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatNumber(aplicacao.estaca_inicial, 0)}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatNumber(aplicacao.estaca_final, 0)}
                    </TableCell>
                    <TableCell className="text-center">
                      {aplicacao.bordo || '-'}
                    </TableCell>
                    <TableCell className="text-center font-semibold text-green-700">
                      {formatNumber(aplicacao.tonelada_aplicada)}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatNumber(aplicacao.comprimento)}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatNumber(aplicacao.largura_media)}
                    </TableCell>
                    <TableCell className="text-center">
                      {formatNumber(aplicacao.espessura, 3)}
                    </TableCell>
                    <TableCell className="text-center font-semibold text-blue-700">
                      {formatNumber(aplicacao.area_calculada)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getEncarregado(aplicacao.lista_entrega_id?.equipe_id)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getPrimeiroNome(aplicacao.lista_entrega_id?.apontador_id?.nome_completo)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>

        {/* Resumo da Tabela */}
        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total de Registros:</span>
              <span className="ml-2 font-semibold">{dados.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Massa (t):</span>
              <span className="ml-2 font-semibold text-green-700">
                {dados.reduce((sum, app) => sum + (app.tonelada_aplicada || 0), 0).toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Área (m²):</span>
              <span className="ml-2 font-semibold text-blue-700">
                {dados.reduce((sum, app) => sum + (app.area_calculada || 0), 0).toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Veículos Únicos:</span>
              <span className="ml-2 font-semibold">
                {new Set(dados.map(app => app.lista_entrega_id?.caminhao_id?.placa).filter(Boolean)).size}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RelatorioAplicacaoTabela;