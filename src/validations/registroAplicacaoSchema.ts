
import * as z from "zod";

/**
 * Schema de validação corrigido para registro aplicacao - compatível com os tipos esperados
 */
export const registroAplicacaoSchema = z.object({
  // Campos obrigatórios
  lista_entrega_id: z.string().uuid("ID da entrega deve ser um UUID válido"),
  registro_carga_id: z.string().uuid("ID do registro de carga deve ser um UUID válido"),
  data_aplicacao: z.string().min(1, "Data de aplicação é obrigatória"),
  hora_chegada_local: z.string().min(1, "Hora de chegada é obrigatória"),
  
  // Campos que existem na tabela bd_registro_apontamento_aplicacao
  logradouro_id: z.string().uuid().optional(),
  logradouro_aplicado: z.string().optional().nullable(),
  temperatura_chegada: z.number().nullable().optional(),
  hora_aplicacao: z.string().optional().nullable(),
  temperatura_aplicacao: z.number().nullable().optional(),
  bordo: z.enum(["Direito", "Esquerdo", "Centro", "Único", "Embocadura"] as const).optional().nullable(),
  estaca_inicial: z.number().nullable().optional(),
  comprimento: z.number().nullable().optional(),
  largura_media: z.number().nullable().optional(),
  tonelada_aplicada: z.number().nullable().optional(),
  espessura: z.number().nullable().optional(),
  espessura_calculada: z.number().nullable().optional(),
  hora_saida_caminhao: z.string().optional().nullable(),
  estaca_final: z.number().nullable().optional(),
  anotacoes_apontador: z.string().nullable().optional(),
  observacoes_gerais: z.string().nullable().optional(),
  aplicacao_sequencia: z.number().default(1),
  carga_finalizada: z.boolean().default(false),
  percentual_aplicado: z.number().nullable().optional(),
  status_aplicacao: z.string().optional(),
  area: z.number().nullable().optional(),
  carga_total_aplicada: z.number().nullable().optional(),
});

export type RegistroAplicacaoSchema = z.infer<typeof registroAplicacaoSchema>;

// Schema específico para criação (todos os campos obrigatórios para criação)
export const createRegistroAplicacaoSchema = registroAplicacaoSchema.extend({
  lista_entrega_id: z.string().uuid(),
  registro_carga_id: z.string().uuid(),
  data_aplicacao: z.string().min(1),
  hora_chegada_local: z.string().min(1),
});

export type CreateRegistroAplicacaoSchema = z.infer<typeof createRegistroAplicacaoSchema>;
