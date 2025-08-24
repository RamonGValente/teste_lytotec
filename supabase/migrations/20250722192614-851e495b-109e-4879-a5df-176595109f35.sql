-- ==========================================
-- CORREÇÃO DA ESTRUTURA DO BANCO DE DADOS
-- ==========================================

-- 1. Adicionar campos faltantes na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS imagem_url TEXT,
ADD COLUMN IF NOT EXISTS funcoes TEXT[] DEFAULT '{}';

-- 2. Adicionar colunas de avaliação na tabela bd_apontamento_equipe
ALTER TABLE public.bd_apontamento_equipe
ADD COLUMN IF NOT EXISTS pontualidade INTEGER CHECK (pontualidade >= 1 AND pontualidade <= 5),
ADD COLUMN IF NOT EXISTS proatividade INTEGER CHECK (proatividade >= 1 AND proatividade <= 5),
ADD COLUMN IF NOT EXISTS organizacao INTEGER CHECK (organizacao >= 1 AND organizacao <= 5),
ADD COLUMN IF NOT EXISTS competencia_tecnica INTEGER CHECK (competencia_tecnica >= 1 AND competencia_tecnica <= 5),
ADD COLUMN IF NOT EXISTS comunicacao INTEGER CHECK (comunicacao >= 1 AND comunicacao <= 5),
ADD COLUMN IF NOT EXISTS trabalho_em_equipe INTEGER CHECK (trabalho_em_equipe >= 1 AND trabalho_em_equipe <= 5);

-- 3. Adicionar relacionamento na tabela bd_programacao_entrega
ALTER TABLE public.bd_programacao_entrega
ADD COLUMN IF NOT EXISTS centro_custo_id UUID REFERENCES public.bd_centros_custo(id),
ADD COLUMN IF NOT EXISTS requisicao_id UUID REFERENCES public.bd_requisicoes(id),
ADD COLUMN IF NOT EXISTS data_entrega DATE DEFAULT CURRENT_DATE;

-- 4. Adicionar campo carga_total_aplicada na tabela bd_registro_apontamento_aplicacao
ALTER TABLE public.bd_registro_apontamento_aplicacao
ADD COLUMN IF NOT EXISTS carga_total_aplicada NUMERIC DEFAULT 0;

-- 5. Comentários para documentar as mudanças
COMMENT ON COLUMN public.profiles.imagem_url IS 'URL da imagem de perfil do usuário';
COMMENT ON COLUMN public.profiles.funcoes IS 'Array de funções/roles do usuário no sistema';

COMMENT ON COLUMN public.bd_apontamento_equipe.pontualidade IS 'Avaliação de pontualidade (1-5)';
COMMENT ON COLUMN public.bd_apontamento_equipe.proatividade IS 'Avaliação de proatividade (1-5)';
COMMENT ON COLUMN public.bd_apontamento_equipe.organizacao IS 'Avaliação de organização (1-5)';
COMMENT ON COLUMN public.bd_apontamento_equipe.competencia_tecnica IS 'Avaliação de competência técnica (1-5)';
COMMENT ON COLUMN public.bd_apontamento_equipe.comunicacao IS 'Avaliação de comunicação (1-5)';
COMMENT ON COLUMN public.bd_apontamento_equipe.trabalho_em_equipe IS 'Avaliação de trabalho em equipe (1-5)';

COMMENT ON COLUMN public.bd_programacao_entrega.centro_custo_id IS 'Referência ao centro de custo';
COMMENT ON COLUMN public.bd_programacao_entrega.requisicao_id IS 'Referência à requisição';
COMMENT ON COLUMN public.bd_programacao_entrega.data_entrega IS 'Data de entrega programada';

COMMENT ON COLUMN public.bd_registro_apontamento_aplicacao.carga_total_aplicada IS 'Total de carga aplicada no registro';

-- 6. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_bd_programacao_entrega_centro_custo ON public.bd_programacao_entrega(centro_custo_id);
CREATE INDEX IF NOT EXISTS idx_bd_programacao_entrega_requisicao ON public.bd_programacao_entrega(requisicao_id);
CREATE INDEX IF NOT EXISTS idx_bd_apontamento_equipe_avaliacoes ON public.bd_apontamento_equipe(pontualidade, proatividade, organizacao, competencia_tecnica, comunicacao, trabalho_em_equipe);

-- 7. Verificar a estrutura atualizada
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name IN ('profiles', 'bd_apontamento_equipe', 'bd_programacao_entrega', 'bd_registro_apontamento_aplicacao')
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;