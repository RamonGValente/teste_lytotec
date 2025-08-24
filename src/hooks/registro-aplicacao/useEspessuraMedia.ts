
import { useMemo } from "react";
import { RegistroAplicacaoDetalhes } from "@/types/registroAplicacaoDetalhes";
import { validateEspessuraLYTEC, EspessuraStatus } from "@/utils/espessuraValidation";

export interface EspessuraMediaInfo {
  espessuraMedia: number;
  numeroAplicacoes: number;
  statusEspessura: EspessuraStatus;
  descricaoStatus: string;
}

export const useEspessuraMedia = (aplicacoes: RegistroAplicacaoDetalhes[]): EspessuraMediaInfo => {
  return useMemo(() => {
    if (!aplicacoes || aplicacoes.length === 0) {
      return {
        espessuraMedia: 0,
        numeroAplicacoes: 0,
        statusEspessura: null,
        descricaoStatus: "Nenhuma aplicação registrada"
      };
    }

    // Primeira tentativa: usar espessura_aplicada salva no banco (já em centímetros)
    const aplicacoesComEspessuraSalva = aplicacoes.filter(app => 
      app.espessura_aplicada && app.espessura_aplicada > 0
    );

    let espessuraMediaCm = 0;
    let numeroAplicacoesUsadas = 0;

    if (aplicacoesComEspessuraSalva.length > 0) {
    console.log("📏 useEspessuraMedia: Usando espessura_aplicada salva (já em cm)");
      const somaEspessuras = aplicacoesComEspessuraSalva.reduce(
        (soma, app) => {
          const espessuraCm = (app.espessura_aplicada || 0); // Já está em centímetros
          console.log(`📏 useEspessuraMedia: ${espessuraCm}cm`);
          return soma + espessuraCm;
        }, 
        0
      );
      
      espessuraMediaCm = somaEspessuras / aplicacoesComEspessuraSalva.length;
      numeroAplicacoesUsadas = aplicacoesComEspessuraSalva.length;
    } else {
      // Segunda tentativa: calcular usando fórmula (tonelada / área / 2.4) * 100
      console.log("📏 useEspessuraMedia: Calculando espessura usando fórmula");
      const aplicacoesCalculaveis = aplicacoes.filter(app => 
        (app.tonelada_aplicada && app.tonelada_aplicada > 0) && 
        (app.area_aplicada && app.area_aplicada > 0)
      );

      if (aplicacoesCalculaveis.length > 0) {
        const somaEspessuras = aplicacoesCalculaveis.reduce(
          (soma, app) => {
            // Usar densidade correta: 2400 kg/m³ = 2.4 t/m³
            const espessuraCalculada = ((app.tonelada_aplicada || 0) / (app.area_aplicada || 0) / 2.4) * 100;
            console.log(`📏 useEspessuraMedia: Calculada: ${app.tonelada_aplicada}t / ${app.area_aplicada}m² / 2.4 = ${espessuraCalculada.toFixed(2)}cm`);
            return soma + espessuraCalculada;
          }, 
          0
        );
        
        espessuraMediaCm = somaEspessuras / aplicacoesCalculaveis.length;
        numeroAplicacoesUsadas = aplicacoesCalculaveis.length;
      } else {
        return {
          espessuraMedia: 0,
          numeroAplicacoes: aplicacoes.length,
          statusEspessura: null,
          descricaoStatus: "Dados insuficientes para calcular espessura"
        };
      }
    }

    // Determinar status baseado na espessura média usando padrão LYTEC
    const validationResult = validateEspessuraLYTEC(espessuraMediaCm);

    console.log(`📏 useEspessuraMedia: Resultado final: ${espessuraMediaCm.toFixed(1)}cm (${numeroAplicacoesUsadas} aplicações)`);

    return {
      espessuraMedia: Number(espessuraMediaCm.toFixed(1)),
      numeroAplicacoes: numeroAplicacoesUsadas,
      statusEspessura: validationResult.status,
      descricaoStatus: validationResult.description
    };
  }, [aplicacoes]);
};
