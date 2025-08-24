-- FASE 1: ESTRUTURA DE BANCO DE DADOS para Fluxo de Registro de Cargas

-- 1. Criar tabela bd_carga_status_historico para rastrear mudanças de status
CREATE TABLE public.bd_carga_status_historico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registro_carga_id UUID REFERENCES bd_registro_cargas(id) ON DELETE CASCADE,
  lista_entrega_id UUID REFERENCES bd_lista_programacao_entrega(id) ON DELETE CASCADE,
  status_anterior TEXT,
  status_novo TEXT NOT NULL,
  percentual_aplicado NUMERIC DEFAULT 0,
  massa_remanescente NUMERIC DEFAULT 0,
  data_alteracao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  alterado_por UUID REFERENCES profiles(id),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Desabilitar RLS temporariamente para desenvolvimento
ALTER TABLE bd_carga_status_historico DISABLE ROW LEVEL SECURITY;

-- 2. Função RPC para calcular massa remanescente
CREATE OR REPLACE FUNCTION public.calcular_massa_remanescente(entrega_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  massa_total NUMERIC;
  massa_aplicada NUMERIC;
  massa_remanescente NUMERIC;
BEGIN
  -- Buscar massa total da carga
  SELECT COALESCE(rc.tonelada_real, rc.tonelada_saida, 0)
  INTO massa_total
  FROM bd_registro_cargas rc
  WHERE rc.lista_entrega_id = entrega_id
  ORDER BY rc.created_at DESC
  LIMIT 1;
  
  -- Se não há registro de carga, retorna a quantidade programada
  IF massa_total IS NULL OR massa_total = 0 THEN
    SELECT quantidade_massa INTO massa_total
    FROM bd_lista_programacao_entrega
    WHERE id = entrega_id;
  END IF;
  
  -- Calcular total aplicado
  SELECT COALESCE(SUM(tonelada_aplicada), 0)
  INTO massa_aplicada
  FROM bd_registro_apontamento_aplicacao
  WHERE lista_entrega_id = entrega_id;
  
  -- Calcular massa remanescente
  massa_remanescente = COALESCE(massa_total, 0) - COALESCE(massa_aplicada, 0);
  
  -- Garantir que não seja negativo
  IF massa_remanescente < 0 THEN
    massa_remanescente = 0;
  END IF;
  
  RETURN massa_remanescente;
END;
$$;

-- 3. Função RPC para atualizar status da entrega
CREATE OR REPLACE FUNCTION public.atualizar_status_entrega_automatico(
  lista_id UUID, 
  novo_status TEXT,
  percentual_aplicado NUMERIC DEFAULT 0,
  massa_remanescente NUMERIC DEFAULT 0
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  status_atual TEXT;
  registro_carga_id UUID;
BEGIN
  -- Buscar status atual
  SELECT status INTO status_atual
  FROM bd_lista_programacao_entrega
  WHERE id = lista_id;
  
  -- Se status já é o mesmo, não faz nada
  IF status_atual = novo_status THEN
    RETURN FALSE;
  END IF;
  
  -- Buscar ID do registro de carga
  SELECT id INTO registro_carga_id
  FROM bd_registro_cargas
  WHERE lista_entrega_id = lista_id
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Atualizar status da entrega
  UPDATE bd_lista_programacao_entrega
  SET status = novo_status, updated_at = now()
  WHERE id = lista_id;
  
  -- Inserir histórico de mudança
  INSERT INTO bd_carga_status_historico (
    registro_carga_id,
    lista_entrega_id,
    status_anterior,
    status_novo,
    percentual_aplicado,
    massa_remanescente,
    alterado_por
  ) VALUES (
    registro_carga_id,
    lista_id,
    status_atual,
    novo_status,
    percentual_aplicado,
    massa_remanescente,
    auth.uid()
  );
  
  RETURN TRUE;
END;
$$;

-- 4. Função para finalizar carga manualmente
CREATE OR REPLACE FUNCTION public.finalizar_carga_manual(carga_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_aplicado NUMERIC := 0;
  massa_total NUMERIC := 0;
  espessura_media NUMERIC := 0;
  num_aplicacoes INTEGER := 0;
  lista_entrega_id UUID;
  resultado JSON;
BEGIN
  -- Buscar informações da carga
  SELECT rc.lista_entrega_id, COALESCE(rc.tonelada_real, rc.tonelada_saida, 0)
  INTO lista_entrega_id, massa_total
  FROM bd_registro_cargas rc
  WHERE rc.id = carga_id;
  
  -- Calcular totais das aplicações
  SELECT 
    COALESCE(SUM(tonelada_aplicada), 0),
    COALESCE(AVG(espessura), 0),
    COUNT(*)
  INTO total_aplicado, espessura_media, num_aplicacoes
  FROM bd_registro_apontamento_aplicacao
  WHERE lista_entrega_id = lista_entrega_id;
  
  -- Marcar todas as aplicações como finalizadas
  UPDATE bd_registro_apontamento_aplicacao
  SET carga_finalizada = true, updated_at = now()
  WHERE lista_entrega_id = lista_entrega_id;
  
  -- Atualizar status para "Entregue"
  PERFORM atualizar_status_entrega_automatico(
    lista_entrega_id,
    'Entregue',
    CASE WHEN massa_total > 0 THEN (total_aplicado / massa_total * 100) ELSE 100 END,
    GREATEST(massa_total - total_aplicado, 0)
  );
  
  -- Preparar resultado
  resultado = json_build_object(
    'success', true,
    'carga_id', carga_id,
    'total_aplicado', total_aplicado,
    'massa_total', massa_total,
    'espessura_media', espessura_media,
    'num_aplicacoes', num_aplicacoes
  );
  
  RETURN resultado;
END;
$$;

-- FASE 2: TRIGGERS AUTOMÁTICAS

-- 5. Trigger para atualizar status quando cria registro de carga (Pendente → Enviada)
CREATE OR REPLACE FUNCTION public.trigger_status_carga_criada()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Atualizar status para "Enviada" quando carga é registrada
  PERFORM atualizar_status_entrega_automatico(
    NEW.lista_entrega_id,
    'Enviada',
    0, -- percentual ainda é 0
    (SELECT calcular_massa_remanescente(NEW.lista_entrega_id))
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_atualizar_status_entrega
AFTER INSERT ON bd_registro_cargas
FOR EACH ROW EXECUTE FUNCTION trigger_status_carga_criada();

-- 6. Trigger para verificar massa remanescente após aplicação
CREATE OR REPLACE FUNCTION public.trigger_verificar_massa_aplicacao()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  massa_remanescente NUMERIC;
  massa_total NUMERIC;
  percentual_aplicado NUMERIC;
BEGIN
  -- Calcular massa remanescente
  massa_remanescente = calcular_massa_remanescente(NEW.lista_entrega_id);
  
  -- Buscar massa total
  SELECT COALESCE(rc.tonelada_real, rc.tonelada_saida, lpe.quantidade_massa)
  INTO massa_total
  FROM bd_lista_programacao_entrega lpe
  LEFT JOIN bd_registro_cargas rc ON rc.lista_entrega_id = lpe.id
  WHERE lpe.id = NEW.lista_entrega_id
  ORDER BY rc.created_at DESC
  LIMIT 1;
  
  -- Calcular percentual aplicado
  IF massa_total > 0 THEN
    percentual_aplicado = ((massa_total - massa_remanescente) / massa_total * 100);
  ELSE
    percentual_aplicado = 0;
  END IF;
  
  -- Se massa remanescente <= 0.001, finalizar entrega
  IF massa_remanescente <= 0.001 THEN
    PERFORM atualizar_status_entrega_automatico(
      NEW.lista_entrega_id,
      'Entregue',
      100, -- 100% aplicado
      0    -- massa remanescente = 0
    );
    
    -- Marcar carga como finalizada
    UPDATE bd_registro_apontamento_aplicacao
    SET carga_finalizada = true
    WHERE lista_entrega_id = NEW.lista_entrega_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_atualizar_status_massa_remanescente
AFTER INSERT OR UPDATE ON bd_registro_apontamento_aplicacao
FOR EACH ROW EXECUTE FUNCTION trigger_verificar_massa_aplicacao();

-- 7. Trigger para finalizar quando hora de saída é preenchida
CREATE OR REPLACE FUNCTION public.trigger_finalizar_hora_saida()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  massa_remanescente NUMERIC;
  massa_total NUMERIC;
  percentual_aplicado NUMERIC;
BEGIN
  -- Só executa se hora_saida_caminhao foi preenchida
  IF NEW.hora_saida_caminhao IS NOT NULL AND (OLD.hora_saida_caminhao IS NULL OR OLD.hora_saida_caminhao != NEW.hora_saida_caminhao) THEN
    
    -- Calcular valores para histórico
    massa_remanescente = calcular_massa_remanescente(NEW.lista_entrega_id);
    
    SELECT COALESCE(rc.tonelada_real, rc.tonelada_saida, lpe.quantidade_massa)
    INTO massa_total
    FROM bd_lista_programacao_entrega lpe
    LEFT JOIN bd_registro_cargas rc ON rc.lista_entrega_id = lpe.id
    WHERE lpe.id = NEW.lista_entrega_id
    ORDER BY rc.created_at DESC
    LIMIT 1;
    
    IF massa_total > 0 THEN
      percentual_aplicado = ((massa_total - massa_remanescente) / massa_total * 100);
    ELSE
      percentual_aplicado = 0;
    END IF;
    
    -- Atualizar status para "Entregue"
    PERFORM atualizar_status_entrega_automatico(
      NEW.lista_entrega_id,
      'Entregue',
      percentual_aplicado,
      massa_remanescente
    );
    
    -- Marcar como finalizada
    UPDATE bd_registro_apontamento_aplicacao
    SET carga_finalizada = true
    WHERE lista_entrega_id = NEW.lista_entrega_id;
    
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_finalizar_hora_saida
AFTER UPDATE ON bd_registro_apontamento_aplicacao
FOR EACH ROW EXECUTE FUNCTION trigger_finalizar_hora_saida();

-- 8. Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_carga_status_historico_lista_entrega ON bd_carga_status_historico(lista_entrega_id);
CREATE INDEX IF NOT EXISTS idx_carga_status_historico_registro_carga ON bd_carga_status_historico(registro_carga_id);
CREATE INDEX IF NOT EXISTS idx_carga_status_historico_data ON bd_carga_status_historico(data_alteracao DESC);

COMMENT ON TABLE bd_carga_status_historico IS 'Histórico de mudanças de status das cargas e entregas - rastreabilidade completa do fluxo';
COMMENT ON FUNCTION calcular_massa_remanescente IS 'Calcula massa remanescente baseada na diferença entre carga total e aplicações';
COMMENT ON FUNCTION atualizar_status_entrega_automatico IS 'Atualiza status da entrega automaticamente e registra no histórico';
COMMENT ON FUNCTION finalizar_carga_manual IS 'Finaliza carga manualmente com cálculos de totais e médias';