
/**
 * This file re-exports all registro aplicacao service functions from the new structure
 * for backward compatibility
 */
export {
  fetchRegistrosAplicacao,
  fetchEntregasEnviadas,
  fetchRegistroAplicacaoById,
  fetchRegistroAplicacaoByListaEntregaId,
  createRegistroAplicacao,
  updateRegistroAplicacao,
  exportRegistrosAplicacaoToExcel,
  registroAplicacaoSelectQuery
} from './registro-aplicacao';
