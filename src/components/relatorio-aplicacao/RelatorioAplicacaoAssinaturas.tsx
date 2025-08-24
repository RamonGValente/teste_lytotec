import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PenTool, Save, User, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AssinaturaData {
  responsavelAplicacao: string;
  cargoResponsavel: string;
  dataAssinatura: string;
  aprovacaoFiscalizacao: string;
  cargoFiscalizacao: string;
  dataFiscalizacao: string;
  observacoesFinais: string;
}

const RelatorioAplicacaoAssinaturas: React.FC = () => {
  const [assinaturas, setAssinaturas] = useState<AssinaturaData>({
    responsavelAplicacao: '',
    cargoResponsavel: '',
    dataAssinatura: '',
    aprovacaoFiscalizacao: '',
    cargoFiscalizacao: '',
    dataFiscalizacao: '',
    observacoesFinais: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof AssinaturaData, value: string) => {
    setAssinaturas(prev => ({ ...prev, [field]: value }));
  };

  const handleSalvarAssinaturas = async () => {
    setIsLoading(true);
    
    try {
      // Salvar no localStorage por enquanto
      localStorage.setItem('relatorio_aplicacao_assinaturas', JSON.stringify(assinaturas));
      
      toast({
        title: "Assinaturas salvas",
        description: "As informações de assinatura foram salvas com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as assinaturas",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados salvos na inicialização
  React.useEffect(() => {
    const dadosSalvos = localStorage.getItem('relatorio_aplicacao_assinaturas');
    if (dadosSalvos) {
      try {
        setAssinaturas(JSON.parse(dadosSalvos));
      } catch (error) {
        console.error('Erro ao carregar assinaturas salvas:', error);
      }
    }
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
          <PenTool className="h-5 w-5 text-primary" />
          Assinaturas e Aprovações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Responsável pela Aplicação */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border-l-4 border-l-green-500">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-green-600" />
              Responsável pela Aplicação
            </Label>
            <Input
              placeholder="Nome completo do responsável"
              value={assinaturas.responsavelAplicacao}
              onChange={(e) => handleInputChange('responsavelAplicacao', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Cargo/Função</Label>
            <Input
              placeholder="Ex: Encarregado, Apontador, etc."
              value={assinaturas.cargoResponsavel}
              onChange={(e) => handleInputChange('cargoResponsavel', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Data da Assinatura</Label>
            <Input
              type="date"
              value={assinaturas.dataAssinatura}
              onChange={(e) => handleInputChange('dataAssinatura', e.target.value)}
            />
          </div>
        </div>

        {/* Aprovação/Fiscalização */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border-l-4 border-l-blue-500">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              Aprovação/Fiscalização
            </Label>
            <Input
              placeholder="Nome do fiscal ou responsável pela aprovação"
              value={assinaturas.aprovacaoFiscalizacao}
              onChange={(e) => handleInputChange('aprovacaoFiscalizacao', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Cargo/Função</Label>
            <Input
              placeholder="Ex: Fiscal, Engenheiro, Coordenador, etc."
              value={assinaturas.cargoFiscalizacao}
              onChange={(e) => handleInputChange('cargoFiscalizacao', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Data da Aprovação</Label>
            <Input
              type="date"
              value={assinaturas.dataFiscalizacao}
              onChange={(e) => handleInputChange('dataFiscalizacao', e.target.value)}
            />
          </div>
        </div>

        {/* Observações Finais */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Observações Finais</Label>
          <Textarea
            placeholder="Observações adicionais sobre a aprovação, condições de entrega, próximas etapas, etc..."
            value={assinaturas.observacoesFinais}
            onChange={(e) => handleInputChange('observacoesFinais', e.target.value)}
            className="min-h-[80px]"
            maxLength={500}
          />
          <div className="text-xs text-muted-foreground text-right">
            {assinaturas.observacoesFinais.length}/500 caracteres
          </div>
        </div>

        {/* Área de Assinatura Digital */}
        <div className="p-4 border-2 border-dashed border-primary/30 rounded-lg bg-primary/5">
          <div className="text-center space-y-2">
            <PenTool className="h-8 w-8 mx-auto text-primary opacity-60" />
            <h4 className="font-medium text-foreground">Área de Assinatura Digital</h4>
            <p className="text-sm text-muted-foreground">
              No futuro, esta área permitirá assinaturas digitais dos responsáveis
            </p>
            <Button variant="outline" size="sm" disabled>
              <PenTool className="h-4 w-4 mr-2" />
              Assinar Digitalmente (Em desenvolvimento)
            </Button>
          </div>
        </div>

        {/* Botão de Salvar */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            onClick={handleSalvarAssinaturas}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Salvando...' : 'Salvar Assinaturas'}
          </Button>
        </div>

        {/* Nota Legal */}
        <div className="text-xs text-muted-foreground bg-muted/20 p-3 rounded border-l-4 border-l-yellow-500">
          <p className="font-medium mb-1">Nota:</p>
          <p>
            Este relatório possui valor legal para controle de qualidade e acompanhamento de execução. 
            As informações aqui registradas devem ser precisas e verificáveis conforme as normas técnicas aplicáveis.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RelatorioAplicacaoAssinaturas;