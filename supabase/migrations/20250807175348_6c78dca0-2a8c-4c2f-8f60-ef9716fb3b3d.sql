-- Transferir apontamento do funcionário duplicado para o funcionário correto
UPDATE bd_registro_apontamento_cam_equipa 
SET 
  operador_id = '0ad8d8d9-e853-4263-8dd0-8dd5613db6be',
  created_by = '0ad8d8d9-e853-4263-8dd0-8dd5613db6be',
  updated_at = now()
WHERE operador_id = '97fa7228-788e-4431-a287-22772a0dc3b7';

-- Verificar se existem outras referências do funcionário duplicado
-- Atualizar equipes se necessário
UPDATE bd_equipes 
SET apontador_id = '0ad8d8d9-e853-4263-8dd0-8dd5613db6be'
WHERE apontador_id = '97fa7228-788e-4431-a287-22772a0dc3b7';

UPDATE bd_equipes 
SET encarregado_id = '0ad8d8d9-e853-4263-8dd0-8dd5613db6be'
WHERE encarregado_id = '97fa7228-788e-4431-a287-22772a0dc3b7';

-- Atualizar programações de entrega se necessário
UPDATE bd_lista_programacao_entrega 
SET apontador_id = '0ad8d8d9-e853-4263-8dd0-8dd5613db6be'
WHERE apontador_id = '97fa7228-788e-4431-a287-22772a0dc3b7';

-- Atualizar apontamentos de equipe por nome
UPDATE bd_apontamento_equipe 
SET colaborador_id = '0ad8d8d9-e853-4263-8dd0-8dd5613db6be'
WHERE colaborador_id = '97fa7228-788e-4431-a287-22772a0dc3b7';

-- Remover da lista de equipes (array)
UPDATE bd_equipes 
SET equipe = array_replace(equipe, '97fa7228-788e-4431-a287-22772a0dc3b7'::uuid, '0ad8d8d9-e853-4263-8dd0-8dd5613db6be'::uuid)
WHERE '97fa7228-788e-4431-a287-22772a0dc3b7'::uuid = ANY(equipe);

-- Remover funcionário duplicado da tabela profiles se existir
DELETE FROM profiles WHERE funcionario_id = '97fa7228-788e-4431-a287-22772a0dc3b7';

-- Agora excluir o funcionário duplicado
DELETE FROM bd_funcionarios WHERE id = '97fa7228-788e-4431-a287-22772a0dc3b7';

-- Adicionar constraint para evitar funcionários duplicados com mesmo nome e CPF não nulos
CREATE OR REPLACE FUNCTION prevent_duplicate_funcionarios()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar duplicação por nome completo
  IF EXISTS (
    SELECT 1 FROM bd_funcionarios 
    WHERE nome_completo = NEW.nome_completo 
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND status != 'Inativo'
  ) THEN
    RAISE EXCEPTION 'Já existe um funcionário ativo com o nome "%". Verifique se não há duplicação.', NEW.nome_completo;
  END IF;
  
  -- Verificar duplicação por CPF se não for nulo/vazio
  IF NEW.cpf IS NOT NULL AND trim(NEW.cpf) != '' THEN
    IF EXISTS (
      SELECT 1 FROM bd_funcionarios 
      WHERE cpf = NEW.cpf 
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND status != 'Inativo'
    ) THEN
      RAISE EXCEPTION 'Já existe um funcionário ativo com o CPF "%". Verifique se não há duplicação.', NEW.cpf;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para prevenir duplicações
DROP TRIGGER IF EXISTS trigger_prevent_duplicate_funcionarios ON bd_funcionarios;
CREATE TRIGGER trigger_prevent_duplicate_funcionarios
  BEFORE INSERT OR UPDATE ON bd_funcionarios
  FOR EACH ROW EXECUTE FUNCTION prevent_duplicate_funcionarios();

-- Criar função para consolidar funcionários duplicados no futuro
CREATE OR REPLACE FUNCTION consolidar_funcionarios_duplicados(
  funcionario_principal_id uuid,
  funcionario_duplicado_id uuid
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se ambos os funcionários existem
  IF NOT EXISTS (SELECT 1 FROM bd_funcionarios WHERE id = funcionario_principal_id) THEN
    RAISE EXCEPTION 'Funcionário principal não encontrado: %', funcionario_principal_id;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM bd_funcionarios WHERE id = funcionario_duplicado_id) THEN
    RAISE EXCEPTION 'Funcionário duplicado não encontrado: %', funcionario_duplicado_id;
  END IF;
  
  -- Transferir todas as referências
  UPDATE bd_registro_apontamento_cam_equipa 
  SET operador_id = funcionario_principal_id, updated_at = now()
  WHERE operador_id = funcionario_duplicado_id;
  
  UPDATE bd_equipes 
  SET apontador_id = funcionario_principal_id
  WHERE apontador_id = funcionario_duplicado_id;
  
  UPDATE bd_equipes 
  SET encarregado_id = funcionario_principal_id
  WHERE encarregado_id = funcionario_duplicado_id;
  
  UPDATE bd_lista_programacao_entrega 
  SET apontador_id = funcionario_principal_id
  WHERE apontador_id = funcionario_duplicado_id;
  
  UPDATE bd_apontamento_equipe 
  SET colaborador_id = funcionario_principal_id
  WHERE colaborador_id = funcionario_duplicado_id;
  
  -- Atualizar arrays de equipes
  UPDATE bd_equipes 
  SET equipe = array_replace(equipe, funcionario_duplicado_id, funcionario_principal_id)
  WHERE funcionario_duplicado_id = ANY(equipe);
  
  -- Remover da tabela profiles
  DELETE FROM profiles WHERE funcionario_id = funcionario_duplicado_id;
  
  -- Excluir funcionário duplicado
  DELETE FROM bd_funcionarios WHERE id = funcionario_duplicado_id;
  
  RETURN TRUE;
END;
$$;