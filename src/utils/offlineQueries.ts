
import { supabase } from '@/integrations/supabase/client';

// Cache simples para dados offline
const offlineCache = new Map<string, { data: any; timestamp: number; staleTime: number }>();

// Função para cache offline simplificado
export const getCachedData = <T>(key: string): T | null => {
  const cached = offlineCache.get(key);
  if (!cached) return null;
  
  const isStale = Date.now() - cached.timestamp > cached.staleTime;
  if (isStale) {
    offlineCache.delete(key);
    return null;
  }
  
  return cached.data;
};

export const setCachedData = <T>(key: string, data: T, staleTime: number = 300000) => {
  offlineCache.set(key, {
    data,
    timestamp: Date.now(),
    staleTime
  });
};

// Executar query com cache offline
export const executeOfflineQuery = async <T>(
  key: string,
  queryFn: () => Promise<{ data: T; error: any }>,
  staleTime: number = 300000
): Promise<T> => {
  // Verificar cache primeiro
  const cached = getCachedData<T>(key);
  if (cached) {
    console.log(`📋 Cache hit: ${key}`);
    return cached;
  }

  try {
    const { data, error } = await queryFn();
    if (error) throw error;
    
    // Armazenar no cache
    setCachedData(key, data, staleTime);
    console.log(`💾 Cache stored: ${key}`);
    
    return data;
  } catch (error) {
    console.warn(`⚠️ Query failed for ${key}:`, error);
    throw error;
  }
};

// Queries otimizadas para offline
export const offlineQueries = {
  funcionarios: () => executeOfflineQuery(
    'funcionarios',
    async () => {
      return await supabase
        .from('bd_funcionarios')
        .select('*')
        .eq('status', 'Ativo')
        .order('nome_completo');
    },
    10 * 60 * 1000 // 10 minutos
  ),

  equipes: () => executeOfflineQuery(
    'equipes',
    async () => {
      return await supabase
        .from('bd_equipes')
        .select(`
          *,
          apontador:apontador_id(id, nome_completo),
          encarregado:encarregado_id(id, nome_completo)
        `)
        .order('nome_equipe');
    },
    15 * 60 * 1000 // 15 minutos
  ),

  centrosCusto: () => executeOfflineQuery(
    'centros-custo',
    async () => {
      return await supabase
        .from('bd_centros_custo')
        .select('*')
        .eq('situacao', 'Ativo')
        .order('nome_centro_custo');
    },
    30 * 60 * 1000 // 30 minutos
  ),

  veiculos: () => executeOfflineQuery(
    'veiculos',
    async () => {
      return await supabase
        .from('bd_caminhoes_equipamentos')
        .select('*')
        .order('frota');
    },
    20 * 60 * 1000 // 20 minutos
  ),

  usinas: () => executeOfflineQuery(
    'usinas',
    async () => {
      return await supabase
        .from('bd_usinas')
        .select('*')
        .order('nome_usina');
    },
    60 * 60 * 1000 // 1 hora
  )
};

// Função otimizada para pré-carregar dados essenciais
export const preloadEssentialData = async () => {
  console.log('🔄 Pré-carregando dados essenciais...');
  
  const preloadQueries = [
    { key: 'funcionarios', fn: offlineQueries.funcionarios },
    { key: 'equipes', fn: offlineQueries.equipes },
    { key: 'centros-custo', fn: offlineQueries.centrosCusto },
    { key: 'veiculos', fn: offlineQueries.veiculos },
    { key: 'usinas', fn: offlineQueries.usinas }
  ];

  let successful = 0;
  
  // Executar com controle de erro individual
  for (const query of preloadQueries) {
    try {
      await query.fn();
      successful++;
      console.log(`✅ ${query.key} pré-carregado`);
    } catch (error) {
      console.warn(`⚠️ Falha ao pré-carregar ${query.key}:`, error);
    }
  }
  
  console.log(`🎯 Pré-carregamento: ${successful}/${preloadQueries.length} queries`);
  
  // Armazenar timestamp do último preload
  localStorage.setItem('last-preload', Date.now().toString());
};

// Limpar cache antigo
export const clearOldCache = () => {
  const keysToRemove: string[] = [];
  
  offlineCache.forEach((value, key) => {
    const isExpired = Date.now() - value.timestamp > value.staleTime;
    if (isExpired) {
      keysToRemove.push(key);
    }
  });
  
  keysToRemove.forEach(key => offlineCache.delete(key));
  
  if (keysToRemove.length > 0) {
    console.log(`🧹 Cache limpo: ${keysToRemove.length} itens removidos`);
  }
};
