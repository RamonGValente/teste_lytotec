// Export all service functions
export * from './baseService';
export * from './createUpdateRegistroAplicacao';
export * from './fetchRegistroAplicacao';
export * from './fetchRegistroAplicacaoExistente';
export * from './fetchRegistrosAplicacao';
export * from './fetchEntregasEnviadas';
export * from './exportRegistrosAplicacao';
export * from './statusIntegrityService';
export * from './statusHistoryService';
export { finalizarCargaManual } from './manualFinalizationService';

export { updateRegistroAplicacao } from './updateRegistroAplicacao';

// NOVO: Export do service para aplicações por rua
export * from './aplicacaoPorRuaService';
