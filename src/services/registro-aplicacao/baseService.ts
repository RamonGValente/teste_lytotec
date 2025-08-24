
/**
 * Base query for selecting registro aplicacao with all relations
 */
export const registroAplicacaoSelectQuery = `
  *,
  lista_entrega:lista_entrega_id (
    id,
    logradouro,
    quantidade_massa,
    data_entrega,
    tipo_lancamento,
    status,
    apontador_id,
    caminhao:caminhao_id (
      id,
      placa,
      modelo
    ),
    equipe:equipe_id (
      id,
      nome_equipe
    ),
    usina:usina_id (
      id,
      nome_usina
    ),
    requisicao:requisicao_id (
      id,
      centro_custo:centro_custo_id (
        id,
        nome_centro_custo
      )
    )
  ),
  registro_carga:registro_carga_id (
    id,
    tonelada_saida,
    tonelada_retorno,
    tonelada_real,
    data_saida,
    hora_saida
  )
`;
