
import { z } from "zod";

export const itemSchema = z.object({
  id: z.string().optional(),
  requisicao_id: z.string().optional(),
  centro_custo_nome: z.string().min(1, "Centro de custo é obrigatório"),
  logradouro: z.string().optional(), // Optional during programming - filled during application
  caminhao_id: z.string().min(1, "Caminhão é obrigatório"),
  tipo_lancamento: z.string().min(1, "Tipo de lançamento é obrigatório"),
  equipe_id: z.string().min(1, "Equipe é obrigatória"),
  apontador_id: z.string().optional(),
  usina_id: z.string().min(1, "Usina é obrigatória"),
  data_entrega: z.string().min(1, "Data de entrega é obrigatória").optional(),
  status: z.enum(['Pendente', 'Enviada', 'Cancelada', 'Entregue']).optional(),
  cancelled: z.boolean().optional(),
  cancelReason: z.string().optional(),
  quantidade_massa: z.number().min(0.01, "Quantidade deve ser maior que zero"),
});

export const programacaoSchema = z.object({
  requisicao_id: z.string().min(1, "Requisição é obrigatória"),
  centro_custo_id: z.string().optional(),
  data_entrega: z.string().min(1, "Data de entrega é obrigatória"),
  ruas: z.array(z.object({
    logradouro: z.string().optional(),
    area: z.number().optional(),
    volume: z.number().optional(),
  })).optional(),
  itens: z.array(itemSchema).optional(),
});

export type ProgramacaoFormValues = z.infer<typeof programacaoSchema>;
export type ItemFormValues = z.infer<typeof itemSchema>;
