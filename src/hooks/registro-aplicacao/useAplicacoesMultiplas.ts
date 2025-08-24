
import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { RegistroAplicacaoDetalhes, RegistroAplicacaoDetalhesFormValues } from "@/types/registroAplicacaoDetalhes";
import { 
  fetchAplicacaoDetalhes, 
  createAplicacaoDetalhe, 
  updateAplicacaoDetalhe,
  deleteAplicacaoDetalhe 
} from "@/services/registroAplicacaoDetalhesService";
import { forceUpdateDeliveryStatus } from "@/services/registro-aplicacao/statusIntegrityService";

export const useAplicacoesMultiplas = (
  registroAplicacaoId?: string,
  registroCargaId?: string,
  listaEntregaId?: string,
  onDataChange?: () => void // Novo callback para notificar mudanças
) => {
  const [aplicacoes, setAplicacoes] = useState<RegistroAplicacaoDetalhes[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingAplicacao, setEditingAplicacao] = useState<RegistroAplicacaoDetalhes | null>(null);
  const { toast } = useToast();
  const loadingRef = useRef(false);
  const lastRegistroIdRef = useRef<string | undefined>();
  const cacheRef = useRef<Record<string, RegistroAplicacaoDetalhes[]>>({});

  // Carregar aplicações existentes com controle de race conditions MELHORADO
  const loadAplicacoes = useCallback(async (registroId: string, forceReload = false) => {
    console.log("🎯 [loadAplicacoes] INICIANDO carregamento:", {
      registroId,
      forceReload,
      isLoading: loadingRef.current,
      lastRegistroId: lastRegistroIdRef.current,
      temCache: !!cacheRef.current[registroId],
      timestamp: new Date().toISOString()
    });

    if (!registroId) {
      console.log("❌ [loadAplicacoes] registroId inválido:", registroId);
      setAplicacoes([]);
      return;
    }

    // Evitar carregamentos duplicados apenas se não for force reload
    if (loadingRef.current && !forceReload) {
      console.log("⏭️ [loadAplicacoes] PULANDO - já está carregando");
      return;
    }

    // Verificar cache primeiro (mas só usar cache se não for force reload)
    if (!forceReload && cacheRef.current[registroId] && lastRegistroIdRef.current === registroId) {
      console.log("📋 [loadAplicacoes] Usando dados do cache para:", registroId);
      setAplicacoes(cacheRef.current[registroId]);
      return;
    }

    loadingRef.current = true;
    setIsLoading(true);
    lastRegistroIdRef.current = registroId;
    
    console.log("🔄 [loadAplicacoes] EXECUTANDO fetch para registro:", registroId);
    
    try {
      const data = await fetchAplicacaoDetalhes(registroId);
      
      console.log("✅ [loadAplicacoes] Aplicações carregadas:", {
        registroId,
        quantidade: data?.length || 0,
        isEmpty: !data || data.length === 0,
        primeiraAplicacao: data?.[0]?.logradouro_nome || 'N/A',
        dados: data
      });
      
      const aplicacoesData = data || [];
      
      // CRÍTICO: Sempre atualizar o estado, mesmo se vazio
      console.log("📝 [loadAplicacoes] Atualizando estado com aplicações:", aplicacoesData.length);
      setAplicacoes(aplicacoesData);
      
      // Armazenar no cache
      cacheRef.current[registroId] = aplicacoesData;
      
    } catch (error) {
      console.error("❌ [loadAplicacoes] Erro ao carregar aplicações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as aplicações",
        variant: "destructive",
      });
      setAplicacoes([]);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
      console.log("🏁 [loadAplicacoes] Finalizando carregamento");
    }
  }, [toast]);

  // Limpar cache quando necessário
  const clearCache = useCallback((registroId?: string) => {
    if (registroId) {
      delete cacheRef.current[registroId];
    } else {
      cacheRef.current = {};
    }
  }, []);

  // Forçar reload das aplicações com log detalhado
  const forceReloadAplicacoes = useCallback(async () => {
    if (registroAplicacaoId) {
      console.log("🔄 [forceReloadAplicacoes] FORÇANDO reload para:", {
        registroAplicacaoId,
        cacheAntes: !!cacheRef.current[registroAplicacaoId],
        aplicacoesAntes: aplicacoes.length,
        timestamp: new Date().toISOString()
      });
      
      // Limpar tudo
      clearCache(registroAplicacaoId);
      lastRegistroIdRef.current = undefined;
      loadingRef.current = false;
      
      // Forçar carregamento
      await loadAplicacoes(registroAplicacaoId, true);
      
      console.log("✅ [forceReloadAplicacoes] Reload concluído");
    }
  }, [registroAplicacaoId, loadAplicacoes, clearCache, aplicacoes.length]);

  // Função para forçar atualização de status após mudanças
  const forceUpdateStatus = useCallback(async () => {
    if (listaEntregaId) {
      console.log("🔄 Forçando atualização de status para entrega:", listaEntregaId);
      try {
        await forceUpdateDeliveryStatus(listaEntregaId);
        console.log("✅ Status da entrega atualizado com sucesso");
      } catch (error) {
        console.error("❌ Erro ao atualizar status da entrega:", error);
      }
    }
  }, [listaEntregaId]);

  // Adicionar nova aplicação com logs detalhados
  const adicionarAplicacao = async (dadosAplicacao: RegistroAplicacaoDetalhesFormValues) => {
    console.log("🚀 [adicionarAplicacao] ==================== INÍCIO ====================");
    console.log("📊 Validando estado atual:");
    console.log("   - registroAplicacaoId:", registroAplicacaoId, "| Tipo:", typeof registroAplicacaoId);
    console.log("   - registroCargaId:", registroCargaId, "| Tipo:", typeof registroCargaId);
    console.log("   - listaEntregaId:", listaEntregaId, "| Tipo:", typeof listaEntregaId);
    console.log("   - aplicacoes.length atual:", aplicacoes.length);
    console.log("📋 Dados da aplicação recebidos:");
    console.log("   - logradouro_nome:", dadosAplicacao.logradouro_nome);
    console.log("   - area_aplicada:", dadosAplicacao.area_aplicada);
    console.log("   - tonelada_aplicada:", dadosAplicacao.tonelada_aplicada);
    
    if (!registroAplicacaoId || !registroCargaId || !listaEntregaId) {
      console.error("❌ [adicionarAplicacao] ERRO CRÍTICO - IDs necessários não fornecidos:");
      console.error("   - registroAplicacaoId:", registroAplicacaoId);
      console.error("   - registroCargaId:", registroCargaId);
      console.error("   - listaEntregaId:", listaEntregaId);
      throw new Error("IDs necessários não fornecidos para criar aplicação");
    }
    
    console.log("✅ Validação dos IDs passou, continuando...");

    console.log("🏗️ [adicionarAplicacao] Iniciando criação de aplicação:", {
      dadosAplicacao,
      registroAplicacaoId,
      registroCargaId,
      listaEntregaId,
      timestamp: new Date().toISOString()
    });

    setIsLoading(true);
    try {
      console.log("📞 [adicionarAplicacao] Chamando createAplicacaoDetalhe...");
      
      const novaAplicacao = await createAplicacaoDetalhe(
        registroAplicacaoId,
        registroCargaId,
        listaEntregaId,
        dadosAplicacao
      );

      console.log("✅ [adicionarAplicacao] Aplicação criada com sucesso:", novaAplicacao);

      // Atualizar estado local imediatamente
      setAplicacoes(prev => {
        const novaLista = [...prev, novaAplicacao];
        console.log("📝 [adicionarAplicacao] Estado local atualizado:", {
          anterior: prev.length,
          novo: novaLista.length
        });
        return novaLista;
      });

      // Limpar cache para forçar reload na próxima consulta
      clearCache(registroAplicacaoId);
      console.log("🧹 [adicionarAplicacao] Cache limpo para:", registroAplicacaoId);
      
      // Forçar atualização de status após adicionar aplicação
      console.log("🔄 [adicionarAplicacao] Atualizando status da entrega...");
      await forceUpdateStatus();
      
      toast({
        title: "✅ Aplicação por rua salva!",
        description: `${dadosAplicacao.logradouro_nome} - ${dadosAplicacao.tonelada_aplicada}t aplicada`,
      });

      console.log("🎯 [adicionarAplicacao] Processo concluído com sucesso");

      // Notificar componente pai sobre mudança nos dados ANTES do reload
      onDataChange?.();

      // CRÍTICO: Aguardar um pouco antes do reload para garantir que os dados foram commitados
      console.log("⏳ [adicionarAplicacao] Aguardando commit dos dados...");
      await new Promise(resolve => setTimeout(resolve, 500));

      // Forçar reload completo dos dados para garantir sincronização
      console.log("🔄 [adicionarAplicacao] Forçando reload completo após timeout...");
      await forceReloadAplicacoes();

      return novaAplicacao;
    } catch (error) {
      console.error("❌ [adicionarAplicacao] Erro ao adicionar aplicação:", error);
      
      let errorMessage = "Não foi possível adicionar a aplicação";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "❌ Erro ao salvar aplicação",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
      console.log("🏁 [adicionarAplicacao] Finalizando operação");
    }
  };

  // Editar aplicação existente
  const editarAplicacao = async (aplicacaoId: string, dadosAtualizados: Partial<RegistroAplicacaoDetalhesFormValues>) => {
    setIsLoading(true);
    try {
      const aplicacaoAtualizada = await updateAplicacaoDetalhe(aplicacaoId, dadosAtualizados);
      
      setAplicacoes(prev => 
        prev.map(app => app.id === aplicacaoId ? aplicacaoAtualizada : app)
      );

      if (registroAplicacaoId) {
        clearCache(registroAplicacaoId);
      }

      // Forçar atualização de status após editar aplicação
      await forceUpdateStatus();

      toast({
        title: "Sucesso",
        description: "Aplicação atualizada com sucesso",
      });

      setEditingAplicacao(null);

      // Notificar componente pai sobre mudança nos dados
      onDataChange?.();

      return aplicacaoAtualizada;
    } catch (error) {
      console.error("Erro ao atualizar aplicação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a aplicação",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Remover aplicação
  const removerAplicacao = async (aplicacaoId: string) => {
    setIsLoading(true);
    try {
      await deleteAplicacaoDetalhe(aplicacaoId);
      
      setAplicacoes(prev => prev.filter(app => app.id !== aplicacaoId));

      if (registroAplicacaoId) {
        clearCache(registroAplicacaoId);
      }

      // Forçar atualização de status após remover aplicação
      await forceUpdateStatus();

      toast({
        title: "Sucesso",
        description: "Aplicação removida com sucesso",
      });

      // Notificar componente pai sobre mudança nos dados
      onDataChange?.();
    } catch (error) {
      console.error("Erro ao remover aplicação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a aplicação",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Iniciar edição
  const iniciarEdicao = (aplicacao: RegistroAplicacaoDetalhes) => {
    setEditingAplicacao(aplicacao);
  };

  const cancelarEdicao = () => {
    setEditingAplicacao(null);
  };

  const aplicacaoParaFormulario = (aplicacao: RegistroAplicacaoDetalhes): RegistroAplicacaoDetalhesFormValues => {
    return {
      logradouro_nome: aplicacao.logradouro_nome,
      area_aplicada: aplicacao.area_aplicada,
      tonelada_aplicada: aplicacao.tonelada_aplicada,
      espessura_aplicada: aplicacao.espessura_aplicada,
      comprimento: aplicacao.comprimento,
      largura_media: aplicacao.largura_media,
      bordo: aplicacao.bordo,
      temperatura_aplicacao: aplicacao.temperatura_aplicacao,
      condicoes_climaticas: aplicacao.condicoes_climaticas,
      densidade_compactacao: aplicacao.densidade_compactacao,
      numero_passadas: aplicacao.numero_passadas,
      equipamento_compactacao: aplicacao.equipamento_compactacao,
      observacoes_aplicacao: aplicacao.observacoes_aplicacao,
      hora_inicio_aplicacao: aplicacao.hora_inicio_aplicacao,
      hora_fim_aplicacao: aplicacao.hora_fim_aplicacao,
      estaca_inicial: aplicacao.estaca_inicial,
      estaca_final: aplicacao.estaca_final,
    };
  };

  // Calcular totais
  const totais = {
    totalAplicado: aplicacoes.reduce((sum, app) => sum + app.tonelada_aplicada, 0),
    areaTotal: aplicacoes.reduce((sum, app) => sum + app.area_aplicada, 0),
    numeroAplicacoes: aplicacoes.length,
    proximaSequencia: aplicacoes.length + 1,
  };

  // useEffect melhorado com logs detalhados
  useEffect(() => {
    console.log("🔄 [useAplicacoesMultiplas] useEffect disparado:", {
      registroAplicacaoId,
      lastRegistroId: lastRegistroIdRef.current,
      isLoading: loadingRef.current,
      aplicacoesCount: aplicacoes.length,
      timestamp: new Date().toISOString()
    });

    if (registroAplicacaoId) {
      console.log("📥 [useAplicacoesMultiplas] Carregando aplicações para registro:", registroAplicacaoId);
      // FORCE reload para garantir dados atualizados
      setTimeout(() => {
        loadAplicacoes(registroAplicacaoId, true); // Force reload sempre
      }, 100);
    } else {
      console.log("🧹 [useAplicacoesMultiplas] Limpando aplicações - nenhum registro ID");
      setAplicacoes([]);
      lastRegistroIdRef.current = undefined;
    }
  }, [registroAplicacaoId, loadAplicacoes]);

  // Cleanup quando componente desmonta
  useEffect(() => {
    return () => {
      loadingRef.current = false;
      lastRegistroIdRef.current = undefined;
    };
  }, []);

  return {
    aplicacoes,
    isLoading,
    editingAplicacao,
    totais,
    adicionarAplicacao,
    editarAplicacao,
    removerAplicacao,
    iniciarEdicao,
    cancelarEdicao,
    aplicacaoParaFormulario,
    forceReloadAplicacoes,
    clearCache,
    forceUpdateStatus
  };
};
