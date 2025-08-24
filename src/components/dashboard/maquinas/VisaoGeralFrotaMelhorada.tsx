import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from "recharts";
import { 
  TipoVeiculoDistribution, 
  StatusOperacionalData, 
  IdadeFrotaData,
  CentroCustoUtilizacao,
  DistribuicaoCentroCusto 
} from "@/types/maquinas";
import { ChevronDown, ChevronUp, Truck, Settings, Calendar, Building, Eye, EyeOff } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VisaoGeralFrotaMelhoradaProps {
  statusOperacional: StatusOperacionalData[];
  idadeFrota: IdadeFrotaData[];
  centroCustoData: CentroCustoUtilizacao[];
  distribuicaoCentroCusto: DistribuicaoCentroCusto[];
  isLoading: boolean;
}

// Cores padronizadas para Status Operacional
const STATUS_COLORS = {
  'Operando': '#22c55e', // verde
  'Disponível': '#3b82f6', // azul
  'Em Manutenção': '#ef4444', // vermelho
  'Outros': '#6b7280' // cinza
};

// Cores padronizadas para Idade da Frota
const IDADE_COLORS = {
  '0-2 anos': '#22c55e', // verde
  '3-5 anos': '#3b82f6', // azul
  '6-10 anos': '#f97316', // laranja
  'Mais de 10 anos': '#ef4444', // vermelho
  'Não informado': '#6b7280' // cinza
};

const CENTRO_CUSTO_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1', '#FF6B6B', '#4ECDC4'];

// Componente de legenda otimizado para mobile
const CustomCentroCustoLegend = ({ data, title, isMobile }: { data: any[], title: string, isMobile: boolean }) => {
  const [isExpanded, setIsExpanded] = useState(!isMobile);
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const displayData = isMobile ? data.slice(0, isExpanded ? data.length : 3) : data;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 border-b pb-2">
        <h4 className="font-medium text-xs sm:text-sm text-gray-700">{title}</h4>
        {isMobile && data.length > 3 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 px-2"
          >
            {isExpanded ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>
        )}
      </div>
      
      <ScrollArea className="flex-1">
        <div className="space-y-1 sm:space-y-2">
          {displayData.map((item, index) => {
            const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
            const color = CENTRO_CUSTO_COLORS[index % CENTRO_CUSTO_COLORS.length];
            
            return (
              <div 
                key={item.name}
                className="flex items-center gap-2 sm:gap-3 p-1 sm:p-2 rounded hover:bg-gray-50 transition-colors"
              >
                <div 
                  className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-xs text-gray-900 truncate">
                    {item.name}
                  </div>
                  <div className="text-xs text-gray-600">
                    {item.value} veículos ({percent}%)
                  </div>
                  {!isMobile && item.fullName && item.fullName !== item.name && (
                    <div className="text-xs text-gray-500 truncate">
                      {item.fullName}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      
      <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
        Total: {total} veículos em {data.length} centro{data.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

// Componente mobile para cards expandíveis
const MobileExpandableCard = ({ 
  title, 
  icon: Icon, 
  data, 
  children, 
  colorMap 
}: {
  title: string;
  icon: any;
  data: any[];
  children: React.ReactNode;
  colorMap: any;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="w-full">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-blue-600" />
                {title}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {data.reduce((sum, item) => sum + item.quantidade, 0)}
                </Badge>
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            {children}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default function VisaoGeralFrotaMelhorada({ 
  statusOperacional, 
  idadeFrota, 
  centroCustoData,
  distribuicaoCentroCusto,
  isLoading 
}: VisaoGeralFrotaMelhoradaProps) {
  const [expandedStatus, setExpandedStatus] = useState<string | null>(null);
  const [expandedIdade, setExpandedIdade] = useState<string | null>(null);
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="h-60 sm:h-80">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-40 sm:h-60 bg-gray-100 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const toggleStatusExpanded = (status: string) => {
    setExpandedStatus(expandedStatus === status ? null : status);
  };

  const toggleIdadeExpanded = (faixa: string) => {
    setExpandedIdade(expandedIdade === faixa ? null : faixa);
  };

  // Preparar dados para distribuição por centro de custo
  const centroCustoDistribution = distribuicaoCentroCusto.map((centro, index) => ({
    name: centro.centroCusto,
    fullName: centro.nomeCompleto,
    value: centro.quantidade,
    percentual: centro.percentual,
    veiculos: centro.veiculos
  })).filter(item => item.value > 0);

  // Tooltip customizado para mostrar detalhes dos veículos
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = centroCustoDistribution.reduce((sum, item) => sum + item.value, 0);
      
      return (
        <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg max-w-xs">
          <p className="font-semibold text-gray-900 text-sm">
            {data.name} = {data.value} Cam/Equip
          </p>
          <p className="text-sm text-gray-600">
            {data.percentual.toFixed(1)}% do total ({total} veículos)
          </p>
          {!isMobile && (
            <p className="text-xs text-gray-500 mt-1 truncate">
              {data.fullName}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Label customizado para mostrar apenas em fatias maiores
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name }: any) => {
    if (isMobile) return null; // Não mostrar labels no mobile
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    const total = centroCustoDistribution.reduce((sum, item) => sum + item.value, 0);
    const percent = (value / total) * 100;
    
    return percent >= 8 ? (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
        stroke="#00000033"
        strokeWidth={0.5}
        style={{ 
          filter: 'drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.5))' 
        }}
      >
        {name}
      </text>
    ) : null;
  };

  // Layout mobile-first
  if (isMobile) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold px-2">Visão Geral da Frota</h2>
        
        {/* Centro de Custo - Mobile */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building className="h-4 w-4 text-blue-600" />
              Distribuição por Centro de Custo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {centroCustoDistribution.length > 0 ? (
              <div className="space-y-4">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={centroCustoDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        innerRadius={35}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {centroCustoDistribution.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={CENTRO_CUSTO_COLORS[index % CENTRO_CUSTO_COLORS.length]}
                            stroke="#ffffff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <CustomCentroCustoLegend 
                  data={centroCustoDistribution} 
                  title="Centros de Custo"
                  isMobile={true}
                />
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="text-gray-400 mb-2">🏢</div>
                  <p className="text-sm">Nenhum dado disponível</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Operacional - Mobile */}
        <MobileExpandableCard
          title="Status Operacional"
          icon={Settings}
          data={statusOperacional}
          colorMap={STATUS_COLORS}
        >
          <div className="space-y-2">
            {statusOperacional.map((status) => (
              <div key={status.status} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ 
                        backgroundColor: STATUS_COLORS[status.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.Outros 
                      }}
                    />
                    <Badge variant="outline" className="text-xs">{status.status}</Badge>
                    <span className="text-sm font-medium">{status.quantidade}</span>
                  </div>
                  {status.ativos.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStatusExpanded(status.status)}
                    >
                      {expandedStatus === status.status ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
                
                {expandedStatus === status.status && (
                  <div className="mt-2 space-y-1">
                    {status.ativos.slice(0, 5).map((ativo) => (
                      <div 
                        key={ativo.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs"
                      >
                        <span className="flex items-center gap-2">
                          {ativo.tipo_veiculo?.toLowerCase().includes('caminhão') ? (
                            <Truck className="h-3 w-3 text-blue-600" />
                          ) : (
                            <Settings className="h-3 w-3 text-green-600" />
                          )}
                          <span className="font-medium">
                            {ativo.frota} {ativo.numero_frota}
                          </span>
                        </span>
                        <span className="text-muted-foreground truncate max-w-20">
                          {ativo.modelo}
                        </span>
                      </div>
                    ))}
                    {status.ativos.length > 5 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{status.ativos.length - 5} mais...
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </MobileExpandableCard>

        {/* Idade da Frota - Mobile */}
        <MobileExpandableCard
          title="Idade da Frota"
          icon={Calendar}
          data={idadeFrota}
          colorMap={IDADE_COLORS}
        >
          <div className="space-y-2">
            {idadeFrota.map((faixa) => (
              <div key={faixa.faixaIdade} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ 
                        backgroundColor: IDADE_COLORS[faixa.faixaIdade as keyof typeof IDADE_COLORS] || IDADE_COLORS['Não informado'] 
                      }}
                    />
                    <span className="text-sm font-medium">{faixa.faixaIdade}</span>
                    <Badge variant="outline" className="text-xs">{faixa.quantidade}</Badge>
                  </div>
                  {faixa.ativos.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleIdadeExpanded(faixa.faixaIdade)}
                    >
                      {expandedIdade === faixa.faixaIdade ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
                
                {expandedIdade === faixa.faixaIdade && (
                  <div className="mt-2 space-y-1">
                    {faixa.ativos.slice(0, 5).map((ativo) => (
                      <div 
                        key={ativo.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs"
                      >
                        <span className="flex items-center gap-2">
                          {ativo.tipo_veiculo?.toLowerCase().includes('caminhão') ? (
                            <Truck className="h-3 w-3 text-blue-600" />
                          ) : (
                            <Settings className="h-3 w-3 text-green-600" />
                          )}
                          <span className="font-medium">
                            {ativo.frota} {ativo.numero_frota}
                          </span>
                        </span>
                        <div className="text-right">
                          <div className="text-muted-foreground truncate max-w-16">
                            {ativo.modelo}
                          </div>
                          <div className="font-medium">
                            {ativo.ano_fabricacao}
                          </div>
                        </div>
                      </div>
                    ))}
                    {faixa.ativos.length > 5 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{faixa.ativos.length - 5} mais...
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </MobileExpandableCard>
      </div>
    );
  }

  // Layout desktop (mantém o design original mas com melhorias responsivas)
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Visão Geral da Frota</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribuição por Centro de Custo - Desktop melhorado */}
        <Card className="h-96">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building className="h-4 w-4 text-blue-600" />
              Distribuição por Centro de Custo
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {centroCustoDistribution.length > 0 ? (
              <div className="flex h-full gap-4">
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={centroCustoDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomLabel}
                        outerRadius={110}
                        innerRadius={55}
                        fill="#8884d8"
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {centroCustoDistribution.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={CENTRO_CUSTO_COLORS[index % CENTRO_CUSTO_COLORS.length]}
                            stroke="#ffffff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="w-44 flex-shrink-0 border-l pl-4">
                  <CustomCentroCustoLegend 
                    data={centroCustoDistribution} 
                    title="Centros de Custo"
                    isMobile={false}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="text-gray-400 mb-2">🏢</div>
                  <p>Nenhum dado disponível</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Operacional - Desktop mantido */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status Operacional Detalhado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusOperacional}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantidade">
                    {statusOperacional.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={STATUS_COLORS[entry.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.Outros} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* ... keep existing code (desktop status details) the same */}
            <div className="mt-4 space-y-2">
              {statusOperacional.map((status) => (
                <div key={status.status} className="border rounded-lg p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded"
                        style={{ 
                          backgroundColor: STATUS_COLORS[status.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.Outros 
                        }}
                      />
                      <Badge variant="outline">{status.status}</Badge>
                      <span className="text-sm font-medium">{status.quantidade} unidades</span>
                    </div>
                    {status.ativos.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatusExpanded(status.status)}
                      >
                        {expandedStatus === status.status ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                  
                  {expandedStatus === status.status && (
                    <div className="mt-2 space-y-1">
                      {status.ativos.map((ativo) => (
                        <div 
                          key={ativo.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs"
                        >
                          <span className="flex items-center gap-2">
                            {ativo.tipo_veiculo?.toLowerCase().includes('caminhão') ? (
                              <Truck className="h-3 w-3 text-blue-600" />
                            ) : (
                              <Settings className="h-3 w-3 text-green-600" />
                            )}
                            <span className="font-medium">
                              {ativo.frota} {ativo.numero_frota}
                            </span>
                          </span>
                          <span className="text-muted-foreground">
                            {ativo.modelo}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Idade da Frota - Desktop mantido */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Idade da Frota Detalhada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={idadeFrota}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="faixaIdade" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantidade">
                    {idadeFrota.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={IDADE_COLORS[entry.faixaIdade as keyof typeof IDADE_COLORS] || IDADE_COLORS['Não informado']} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* ... keep existing code (desktop age details) the same */}
            <div className="mt-4 space-y-2">
              {idadeFrota.map((faixa) => (
                <div key={faixa.faixaIdade} className="border rounded-lg p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded"
                        style={{ 
                          backgroundColor: IDADE_COLORS[faixa.faixaIdade as keyof typeof IDADE_COLORS] || IDADE_COLORS['Não informado'] 
                        }}
                      />
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">{faixa.faixaIdade}</span>
                      <Badge variant="outline">{faixa.quantidade}</Badge>
                    </div>
                    {faixa.ativos.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleIdadeExpanded(faixa.faixaIdade)}
                      >
                        {expandedIdade === faixa.faixaIdade ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                  
                  {expandedIdade === faixa.faixaIdade && (
                    <div className="mt-2 space-y-1">
                      {faixa.ativos.map((ativo) => (
                        <div 
                          key={ativo.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs"
                        >
                          <span className="flex items-center gap-2">
                            {ativo.tipo_veiculo?.toLowerCase().includes('caminhão') ? (
                              <Truck className="h-3 w-3 text-blue-600" />
                            ) : (
                              <Settings className="h-3 w-3 text-green-600" />
                            )}
                            <span className="font-medium">
                              {ativo.frota} {ativo.numero_frota}
                            </span>
                          </span>
                          <div className="text-right">
                            <div className="text-muted-foreground">
                              {ativo.modelo}
                            </div>
                            <div className="font-medium">
                              {ativo.ano_fabricacao}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
