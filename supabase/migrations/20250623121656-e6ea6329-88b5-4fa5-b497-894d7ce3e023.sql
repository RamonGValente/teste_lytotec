
-- Função para atualizar a situação do veículo quando um apontamento é criado
CREATE OR REPLACE FUNCTION fn_atualizar_situacao_veiculo_apontamento()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Atualiza a situação do veículo para a situação do apontamento quando criado
  IF NEW.caminhao_equipamento_id IS NOT NULL AND NEW.situacao IS NOT NULL THEN
    UPDATE bd_caminhoes_equipamentos
    SET situacao = NEW.situacao,
        updated_at = NOW()
    WHERE id = NEW.caminhao_equipamento_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Função para atualizar a situação do veículo para "Disponível" quando apontamento é finalizado
CREATE OR REPLACE FUNCTION fn_finalizar_situacao_veiculo_apontamento()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Verifica se o apontamento foi finalizado (tem horimetro_final e hora_final)
  IF NEW.horimetro_final IS NOT NULL AND NEW.hora_final IS NOT NULL AND
     (OLD.horimetro_final IS NULL OR OLD.hora_final IS NULL) THEN
    
    UPDATE bd_caminhoes_equipamentos
    SET situacao = 'Disponível',
        updated_at = NOW()
    WHERE id = NEW.caminhao_equipamento_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger para atualizar situação do veículo quando apontamento é CRIADO
CREATE TRIGGER trg_atualizar_situacao_veiculo_insert
  AFTER INSERT ON bd_registro_apontamento_cam_equipa
  FOR EACH ROW
  EXECUTE FUNCTION fn_atualizar_situacao_veiculo_apontamento();

-- Trigger para atualizar situação do veículo para "Disponível" quando apontamento é FINALIZADO
CREATE TRIGGER trg_finalizar_situacao_veiculo_update
  AFTER UPDATE ON bd_registro_apontamento_cam_equipa
  FOR EACH ROW
  EXECUTE FUNCTION fn_finalizar_situacao_veiculo_apontamento();
