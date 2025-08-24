import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MessageSquare, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const RelatorioAplicacaoObservacoes: React.FC = () => {
  const [observacoes, setObservacoes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSalvarObservacoes = async () => {
    setIsLoading(true);
    
    try {
      // Aqui você pode implementar a lógica para salvar as observações
      // Por exemplo, salvar no localStorage ou enviar para o servidor
      localStorage.setItem('relatorio_aplicacao_observacoes', observacoes);
      
      toast({
        title: "Observações salvas",
        description: "As observações foram salvas com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as observações",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar observações salvas na inicialização
  React.useEffect(() => {
    const observacoesSalvas = localStorage.getItem('relatorio_aplicacao_observacoes');
    if (observacoesSalvas) {
      setObservacoes(observacoesSalvas);
    }
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Observações Gerais
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="observacoes" className="text-sm font-medium text-foreground">
            Observações do Apontador/Responsável
          </label>
          <Textarea
            id="observacoes"
            placeholder="Digite aqui observações sobre as condições da aplicação, ocorrências, condições climáticas, qualidade do material, dificuldades encontradas, etc..."
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            className="min-h-[120px] resize-none"
            maxLength={1000}
          />
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>
              Utilize este espaço para registrar informações importantes sobre a execução do serviço
            </span>
            <span>{observacoes.length}/1000 caracteres</span>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSalvarObservacoes}
            disabled={isLoading}
            size="sm"
            className="bg-primary hover:bg-primary/90"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Salvando...' : 'Salvar Observações'}
          </Button>
        </div>

        {/* Exemplos de observações */}
        <div className="mt-6 p-4 bg-muted/30 rounded-lg border-l-4 border-l-primary/50">
          <h4 className="font-medium text-sm text-foreground mb-2">Exemplos de observações importantes:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Condições climáticas (chuva, vento, temperatura)</li>
            <li>• Qualidade do material asfáltico (temperatura, consistência)</li>
            <li>• Dificuldades operacionais ou interferências</li>
            <li>• Ocorrências de segurança ou qualidade</li>
            <li>• Observações sobre equipamentos ou veículos</li>
            <li>• Coordenação com outras equipes ou atividades</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default RelatorioAplicacaoObservacoes;