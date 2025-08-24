
import React from "react";
import { UseFormReturn } from "react-hook-form";
import WeightInput from "./WeightInput";
import ImageUpload from "./ImageUpload";

interface PesagemSectionProps {
  form: UseFormReturn<any>;
  ticketSaidaPreview: string | null;
  ticketRetornoPreview: string | null;
  handleTicketSaidaChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTicketRetornoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  modoRetorno?: {
    ativo: boolean;
    entregaId: string;
    massaEsperada: number;
  } | null;
}

const PesagemSection: React.FC<PesagemSectionProps> = ({
  form,
  ticketSaidaPreview,
  ticketRetornoPreview,
  handleTicketSaidaChange,
  handleTicketRetornoChange,
  modoRetorno = null,
}) => {
  // Função para calcular tonelada real com validação - convertendo de kg para toneladas
  const calcularToneladaReal = (): string => {
    try {
      const pesoSaidaKg = form.watch("tonelada_saida");
      const pesoRetornoKg = form.watch("tonelada_retorno");

      console.log("PesagemSection - Valores para cálculo (kg):", { pesoSaidaKg, pesoRetornoKg });

      // Validar peso de saída - trabalhando em kg
      const saidaKgNum = Number(pesoSaidaKg);
      if (isNaN(saidaKgNum) || saidaKgNum <= 0) {
        return "0.0 t";
      }

      // Validar peso de retorno (pode ser null, undefined ou vazio)
      let retornoKgNum = 0;
      if (pesoRetornoKg !== null && pesoRetornoKg !== undefined && pesoRetornoKg !== '') {
        retornoKgNum = Number(pesoRetornoKg);
        if (isNaN(retornoKgNum) || retornoKgNum < 0) {
          retornoKgNum = 0;
        }
      }

      // Calcular a diferença em kg e converter para toneladas
      const resultadoKg = saidaKgNum - retornoKgNum;
      const resultadoToneladas = resultadoKg / 1000;
      
      console.log("PesagemSection - Resultado calculado:", { resultadoKg, resultadoToneladas });

      // Exibir com 1 casa decimal para melhor legibilidade
      return `${Math.max(0, resultadoToneladas).toFixed(1)} t`;
    } catch (error) {
      console.error("PesagemSection - Erro no cálculo:", error);
      return "0.0 t";
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Dados da Pesagem</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <WeightInput
            form={form}
            name="tonelada_saida"
            label="Peso da Balança - Saída (kg)"
          />
          
          <ImageUpload
            form={form}
            name="imagem_ticket_saida"
            label="Imagem do Ticket (Saída)"
            inputId="ticketSaida"
            preview={ticketSaidaPreview}
            onImageChange={handleTicketSaidaChange}
            icon="camera"
            required={true}
          />
        </div>
        
        <div className="space-y-4">
          {/* Campo de retorno com destaque especial se estiver em modo retorno */}
          <div className={modoRetorno?.ativo ? "p-3 border-2 border-orange-300 bg-orange-50 rounded-md" : ""}>
            {modoRetorno?.ativo && (
              <div className="mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-orange-800">
                  CAMPO PRIORITÁRIO - Retorno de Massa
                </span>
                <span className="text-xs text-orange-600 ml-auto">
                  Esperado: ~{(modoRetorno.massaEsperada * 1000).toFixed(0)}kg
                </span>
              </div>
            )}
            
            <WeightInput
              form={form}
              name="tonelada_retorno"
              label={modoRetorno?.ativo ? "🎯 Peso da Balança - Retorno (kg) - PRIORIDADE" : "Peso da Balança - Retorno (kg)"}
              isRetorno={true}
              className={modoRetorno?.ativo ? "border-orange-400 focus:border-orange-500 bg-white" : ""}
            />
          </div>
          
          <ImageUpload
            form={form}
            name="imagem_ticket_retorno"
            label="Imagem do Ticket (Retorno - Opcional)"
            inputId="ticketRetorno"
            preview={ticketRetornoPreview}
            onImageChange={handleTicketRetornoChange}
            icon="upload"
            required={false}
          />
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-muted rounded-md">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium">Tonelada Real (Aplicada)</h4>
          <div className="text-xl font-bold">
            {calcularToneladaReal()}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Calculado automaticamente (Peso Saída - Peso Retorno) ÷ 1000
        </p>
        <p className="text-xs text-blue-600 mt-1">
          * Este valor é calculado pelo sistema após o salvamento
        </p>
      </div>
    </div>
  );
};

export default PesagemSection;
