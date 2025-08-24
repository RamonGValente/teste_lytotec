
import { v4 as uuidv4 } from 'uuid';
import { canAccessOfflineModule } from './offlinePermissions';

export type TipoApontamento = 
  | 'apontamento_equipe'
  | 'apontamento_caminhoes'
  | 'registro_aplicacao'
  | 'registro_cargas'
  | 'chamados_os'
  | 'ordens_servico';

export interface DadosOffline {
  id: string;
  timestamp: string;
  data: any;
  tentativas: number;
  erro?: string;
  usuario_id?: string;
}

export interface ConfigTipoApontamento {
  tabela: string;
  chaveLocalStorage: string;
  nomeExibicao: string;
}

// Mapeamento de tipos para configurações
export const TIPOS_APONTAMENTO: Record<TipoApontamento, ConfigTipoApontamento> = {
  apontamento_equipe: {
    tabela: 'bd_apontamento_equipe',
    chaveLocalStorage: 'offline_apontamento_equipe',
    nomeExibicao: 'Apontamento de Equipe'
  },
  apontamento_caminhoes: {
    tabela: 'bd_registro_apontamento_cam_equipa',
    chaveLocalStorage: 'offline_apontamento_caminhoes',
    nomeExibicao: 'Apontamento de Caminhões'
  },
  registro_aplicacao: {
    tabela: 'bd_registro_apontamento_aplicacao',
    chaveLocalStorage: 'offline_registro_aplicacao',
    nomeExibicao: 'Registro de Aplicação'
  },
  registro_cargas: {
    tabela: 'bd_registro_cargas',
    chaveLocalStorage: 'offline_registro_cargas',
    nomeExibicao: 'Registro de Cargas'
  },
  chamados_os: {
    tabela: 'bd_chamados_os',
    chaveLocalStorage: 'offline_chamados_os',
    nomeExibicao: 'Chamados OS'
  },
  ordens_servico: {
    tabela: 'bd_ordens_servico',
    chaveLocalStorage: 'offline_ordens_servico',
    nomeExibicao: 'Ordens de Serviço'
  }
};

/**
 * Salva dados de apontamento offline no localStorage
 */
export const salvarApontamentoOffline = (
  tipo: TipoApontamento,
  formData: any,
  usuarioId?: string
): string => {
  try {
    // Verificar permissão antes de salvar offline
    if (!canAccessOfflineModule(tipo)) {
      throw new Error(`Sem permissão para salvar ${TIPOS_APONTAMENTO[tipo].nomeExibicao} offline`);
    }
    
    const config = TIPOS_APONTAMENTO[tipo];
    const chave = config.chaveLocalStorage;
    
    // Gerar ID único para o registro offline
    const id = `temp_${uuidv4()}`;
    
    // Preparar dados offline
    const dadosOffline: DadosOffline = {
      id,
      timestamp: new Date().toISOString(),
      data: {
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...(usuarioId && { created_by: usuarioId })
      },
      tentativas: 0,
      usuario_id: usuarioId
    };
    
    // Recuperar dados existentes
    const dadosExistentes = obterDadosOffline(tipo);
    
    // Adicionar novo registro
    const novosDados = [...dadosExistentes, dadosOffline];
    
    // Salvar no localStorage
    localStorage.setItem(chave, JSON.stringify(novosDados));
    
    console.log(`💾 ${config.nomeExibicao} salvo offline:`, id);
    
    return id;
  } catch (error) {
    console.error(`Erro ao salvar ${tipo} offline:`, error);
    throw new Error(`Falha ao salvar ${TIPOS_APONTAMENTO[tipo].nomeExibicao} offline`);
  }
};

/**
 * Obtém dados offline de um tipo específico
 */
export const obterDadosOffline = (tipo: TipoApontamento): DadosOffline[] => {
  try {
    const chave = TIPOS_APONTAMENTO[tipo].chaveLocalStorage;
    const dados = localStorage.getItem(chave);
    return dados ? JSON.parse(dados) : [];
  } catch (error) {
    console.error(`Erro ao obter dados offline de ${tipo}:`, error);
    return [];
  }
};

/**
 * Remove dados offline após sincronização bem-sucedida
 */
export const limparDadosOffline = (tipo: TipoApontamento, ids?: string[]): void => {
  try {
    const chave = TIPOS_APONTAMENTO[tipo].chaveLocalStorage;
    
    if (ids && ids.length > 0) {
      // Remover apenas IDs específicos
      const dadosExistentes = obterDadosOffline(tipo);
      const dadosFiltrados = dadosExistentes.filter(item => !ids.includes(item.id));
      localStorage.setItem(chave, JSON.stringify(dadosFiltrados));
    } else {
      // Limpar todos os dados do tipo
      localStorage.removeItem(chave);
    }
    
    console.log(`🧹 Dados offline de ${TIPOS_APONTAMENTO[tipo].nomeExibicao} limpos`);
  } catch (error) {
    console.error(`Erro ao limpar dados offline de ${tipo}:`, error);
  }
};

/**
 * Obtém todos os tipos que possuem dados offline pendentes
 */
export const obterTiposComDadosPendentes = (): TipoApontamento[] => {
  const tiposComDados: TipoApontamento[] = [];
  
  Object.keys(TIPOS_APONTAMENTO).forEach(tipo => {
    const dados = obterDadosOffline(tipo as TipoApontamento);
    if (dados.length > 0) {
      tiposComDados.push(tipo as TipoApontamento);
    }
  });
  
  return tiposComDados;
};

/**
 * Conta total de registros pendentes
 */
export const contarRegistrosPendentes = (): number => {
  return obterTiposComDadosPendentes().reduce((total, tipo) => {
    return total + obterDadosOffline(tipo).length;
  }, 0);
};

/**
 * Incrementa tentativas de sincronização para um registro
 */
export const incrementarTentativas = (tipo: TipoApontamento, id: string, erro?: string): void => {
  try {
    const dados = obterDadosOffline(tipo);
    const dadosAtualizados = dados.map(item => {
      if (item.id === id) {
        return {
          ...item,
          tentativas: item.tentativas + 1,
          erro: erro || item.erro
        };
      }
      return item;
    });
    
    const chave = TIPOS_APONTAMENTO[tipo].chaveLocalStorage;
    localStorage.setItem(chave, JSON.stringify(dadosAtualizados));
  } catch (error) {
    console.error(`Erro ao incrementar tentativas para ${tipo}:`, error);
  }
};
