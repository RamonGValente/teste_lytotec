
import { z } from "zod";

// Helper para validar UUID ou string vazia (que será convertida para null)
const uuidOrEmpty = z.string().refine((val) => {
  if (val === "" || val === null || val === undefined) return true;
  // Regex para validar UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(val);
}, {
  message: "Deve ser um UUID válido ou vazio"
}).transform((val) => val === "" ? undefined : val);

export const apontamentoEquipeSchema = z.object({
  equipe_id: z.string().uuid("Equipe deve ser selecionada"),
  data_registro: z.date(), // Keep as Date object in form
  lista_entrega_id: uuidOrEmpty.optional(),
  colaboradores: z.array(z.object({
    colaborador_id: z.string().min(1, "ID do colaborador é obrigatório"),
    nome_colaborador: z.string().min(1, "Nome do colaborador é obrigatório"),
    presente: z.boolean(),
    hora_inicio: z.string().optional(),
    hora_fim: z.string().optional(),
  })).refine((colaboradores) => {
    // Validar que pelo menos um colaborador está presente
    return colaboradores.some(col => col.presente);
  }, {
    message: "Pelo menos um colaborador deve estar presente"
  })
});

export type ApontamentoEquipeSchema = z.infer<typeof apontamentoEquipeSchema>;
