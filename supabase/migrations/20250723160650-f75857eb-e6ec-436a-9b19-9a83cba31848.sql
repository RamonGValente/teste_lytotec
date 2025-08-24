-- Sincronizar equipe_id dos funcionários com base nas equipes
-- 1. Criar tabela de auditoria para registrar as mudanças
CREATE TABLE IF NOT EXISTS bd_auditoria_sync_equipe_funcionario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  funcionario_id uuid NOT NULL,
  nome_funcionario text NOT NULL,
  equipe_id_anterior uuid,
  equipe_id_novo uuid NOT NULL,
  nome_equipe text NOT NULL,
  data_sync timestamp with time zone DEFAULT now(),
  motivo text DEFAULT 'Sincronização automática - funcionário estava na lista da equipe mas sem equipe_id'
);

-- 2. Registrar mudanças na auditoria antes de fazer as atualizações
INSERT INTO bd_auditoria_sync_equipe_funcionario (
  funcionario_id, 
  nome_funcionario, 
  equipe_id_anterior, 
  equipe_id_novo, 
  nome_equipe
)
SELECT 
  f.id as funcionario_id,
  f.nome_completo as nome_funcionario,
  f.equipe_id as equipe_id_anterior,
  e.id as equipe_id_novo,
  e.nome_equipe
FROM bd_funcionarios f
INNER JOIN bd_equipes e ON f.id = ANY(e.equipe)
WHERE f.equipe_id IS NULL OR f.equipe_id != e.id;

-- 3. Atualizar o equipe_id dos funcionários baseado nas listas das equipes
UPDATE bd_funcionarios 
SET equipe_id = e.id,
    updated_at = now()
FROM bd_equipes e
WHERE bd_funcionarios.id = ANY(e.equipe)
  AND (bd_funcionarios.equipe_id IS NULL OR bd_funcionarios.equipe_id != e.id);

-- 4. Verificar e reportar inconsistências (funcionários em múltiplas equipes)
DO $$
DECLARE
  inconsistencias integer;
BEGIN
  SELECT COUNT(*) INTO inconsistencias
  FROM (
    SELECT f.id, f.nome_completo, COUNT(e.id) as num_equipes
    FROM bd_funcionarios f
    INNER JOIN bd_equipes e ON f.id = ANY(e.equipe)
    GROUP BY f.id, f.nome_completo
    HAVING COUNT(e.id) > 1
  ) duplicados;
  
  IF inconsistencias > 0 THEN
    RAISE WARNING 'Encontradas % inconsistências: funcionários em múltiplas equipes. Verificar tabela bd_auditoria_sync_equipe_funcionario', inconsistencias;
  END IF;
END $$;

-- 5. Criar função para manter sincronização futura
CREATE OR REPLACE FUNCTION sync_funcionario_equipe_on_equipe_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Limpar equipe_id dos funcionários que não estão mais na lista
  UPDATE bd_funcionarios 
  SET equipe_id = NULL, updated_at = now()
  WHERE equipe_id = OLD.id 
    AND NOT (id = ANY(NEW.equipe));
    
  -- Definir equipe_id para funcionários que estão na nova lista
  UPDATE bd_funcionarios 
  SET equipe_id = NEW.id, updated_at = now()
  WHERE id = ANY(NEW.equipe) 
    AND (equipe_id IS NULL OR equipe_id != NEW.id);
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar trigger para manter sincronização automática
DROP TRIGGER IF EXISTS trigger_sync_funcionario_equipe ON bd_equipes;
CREATE TRIGGER trigger_sync_funcionario_equipe
  AFTER UPDATE OF equipe ON bd_equipes
  FOR EACH ROW
  EXECUTE FUNCTION sync_funcionario_equipe_on_equipe_change();

-- 7. Verificar resultado final da sincronização
SELECT 
  'Sincronização concluída' as status,
  COUNT(*) as funcionarios_sincronizados
FROM bd_auditoria_sync_equipe_funcionario 
WHERE data_sync >= now() - interval '1 minute';

-- 8. Validar integridade final
SELECT 
  'Validação' as tipo,
  CASE 
    WHEN COUNT(*) = 0 THEN 'Todos os funcionários das equipes têm equipe_id correto'
    ELSE CONCAT(COUNT(*), ' funcionários ainda precisam de correção')
  END as resultado
FROM bd_funcionarios f
INNER JOIN bd_equipes e ON f.id = ANY(e.equipe)
WHERE f.equipe_id != e.id OR f.equipe_id IS NULL;