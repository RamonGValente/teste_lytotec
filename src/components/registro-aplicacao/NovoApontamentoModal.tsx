import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ListaProgramacaoEntrega } from '@/types/programacaoEntrega';
import { RegistroCarga } from '@/types/registroCargas';
import { fetchEntregasEnviadas } from '@/services/registro-aplicacao/fetchEntregasEnviadas';
import { fetchRegistroCargaByListaEntregaId } from '@/services/registroCargaService';
import { fetchLogradourosByRequisicao } from '@/services/logradourosService';
import { checkAndFixStatusIntegrity } from '@/services/registro-aplicacao/statusIntegrityService';
import { useToast } from '@/hooks/use-toast';
import LoadingIndicator from './LoadingIndicator';
import EmptyStateMessage from './EmptyStateMessage';

interface LogradouroOption {
  id: string;
  logradouro: string;
}

interface NovoApontamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEntrega: (
    entrega: ListaProgramacaoEntrega,
    registroCarga: RegistroCarga,
    logradouroId?: string,
    logradouroName?: string
  ) => void;
  selectedDate?: Date;
  equipeId?: string;
}

export const NovoApontamentoModal: React.FC<NovoApontamentoModalProps> = ({
  isOpen,
  onClose,
  onSelectEntrega,
  selectedDate,
  equipeId,
}) => {
  const [entregas, setEntregas] = useState<ListaProgramacaoEntrega[]>([]);
  const [logradouros, setLogradouros] = useState<LogradouroOption[]>([]);
  const [selectedEntregaId, setSelectedEntregaId] = useState<string>('');
  const [selectedLogradouroId, setSelectedLogradouroId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLogradouros, setIsLoadingLogradouros] = useState(false);
  const [integrityCheckDone, setIntegrityCheckDone] = useState(false);
  const [searchWithoutDateFilter, setSearchWithoutDateFilter] = useState(false);
  const { toast } = useToast();

  // Load entregas when modal opens or dependencies change
  useEffect(() => {
    if (isOpen) {
      loadEntregas();
    } else {
      // Reset state when modal closes
      setSelectedEntregaId('');
      setSelectedLogradouroId('');
      setEntregas([]);
      setLogradouros([]);
      setIntegrityCheckDone(false);
      setSearchWithoutDateFilter(false);
    }
  }, [isOpen, selectedDate, equipeId, searchWithoutDateFilter]);

  // Load logradouros when an entrega is selected
  useEffect(() => {
    if (selectedEntregaId) {
      loadLogradouros();
    } else {
      setLogradouros([]);
      setSelectedLogradouroId('');
    }
  }, [selectedEntregaId]);

  const loadEntregas = async () => {
    setIsLoading(true);
    try {
      console.log("🚀 Loading entregas for modal...");
      
      // First, run integrity check if not done yet
      if (!integrityCheckDone) {
        console.log("🔧 Running status integrity check...");
        await checkAndFixStatusIntegrity();
        setIntegrityCheckDone(true);
      }
      
      // Create filters object for the new function signature
      const filters = searchWithoutDateFilter ? {} : { data_inicio: selectedDate };
      const entregasData = await fetchEntregasEnviadas(filters);
      console.log(`📋 Loaded ${entregasData.length} entregas for modal`);
      
      setEntregas(entregasData);
      
      // Only log information to console, no toast notifications for normal operation
      if (entregasData.length === 0) {
        console.log("⚠️ No entregas found - this might indicate a problem");
        
        if (selectedDate && !searchWithoutDateFilter) {
          console.log(`No entregas found for ${selectedDate.toLocaleDateString('pt-BR')} - user can expand search`);
        } else {
          console.log("No entregas found in expanded search period");
        }
      } else {
        // Only log to console when entregas are found
        const totalMassa = entregasData.reduce((sum, e) => sum + (e.massa_remanescente || 0), 0);
        const dateRange = searchWithoutDateFilter ? "período ampliado" : 
          selectedDate ? `data ${selectedDate.toLocaleDateString('pt-BR')}` : "período recente";
        
        console.log(`✅ Found ${entregasData.length} entregas with ${totalMassa.toFixed(1)}t total massa remanescente for ${dateRange}`);
      }
    } catch (error) {
      console.error("💥 Error loading entregas:", error);
      toast({
        title: "Erro ao carregar entregas",
        description: "Não foi possível carregar as entregas disponíveis.",
        variant: "destructive",
      });
      setEntregas([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLogradouros = async () => {
    if (!selectedEntregaId) return;
    
    setIsLoadingLogradouros(true);
    try {
      const selectedEntrega = entregas.find(e => e.id === selectedEntregaId);
      if (!selectedEntrega?.requisicao_id) {
        console.error("No requisicao_id found for selected entrega");
        return;
      }

      console.log("Loading logradouros for requisicao:", selectedEntrega.requisicao_id);
      const logradourosData = await fetchLogradourosByRequisicao(selectedEntrega.requisicao_id);
      
      const logradouroOptions = logradourosData.map(l => ({
        id: l.id,
        logradouro: l.logradouro,
      }));
      
      setLogradouros(logradouroOptions);
      console.log(`Loaded ${logradouroOptions.length} logradouros`);
    } catch (error) {
      console.error("Error loading logradouros:", error);
      // Only show toast for critical errors that prevent functionality
      toast({
        title: "Erro ao carregar logradouros",
        description: "Não foi possível carregar os logradouros disponíveis.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingLogradouros(false);
    }
  };

  const handleRetryWithoutFilters = () => {
    setSearchWithoutDateFilter(true);
  };

  const handleConfirm = async () => {
    if (!selectedEntregaId) {
      toast({
        title: "Seleção obrigatória",
        description: "Por favor, selecione uma entrega.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedLogradouroId) {
      toast({
        title: "Seleção obrigatória",
        description: "Por favor, selecione um logradouro.",
        variant: "destructive",
      });
      return;
    }

    try {
      const selectedEntrega = entregas.find(e => e.id === selectedEntregaId);
      const selectedLogradouro = logradouros.find(l => l.id === selectedLogradouroId);
      
      if (!selectedEntrega || !selectedLogradouro) {
        throw new Error("Entrega ou logradouro não encontrado");
      }

      console.log("Fetching registro carga for entrega:", selectedEntregaId);
      const registroCarga = await fetchRegistroCargaByListaEntregaId(selectedEntregaId);
      
      if (!registroCarga) {
        throw new Error("Registro de carga não encontrado para esta entrega");
      }

      console.log("Selected:", {
        entrega: selectedEntrega.logradouro,
        data_entrega: selectedEntrega.data_entrega,
        logradouro: selectedLogradouro.logradouro,
        massa_remanescente: selectedEntrega.massa_remanescente
      });

      // Call the selection handler silently - the form will open automatically
      onSelectEntrega(
        selectedEntrega,
        registroCarga,
        selectedLogradouro.id,
        selectedLogradouro.logradouro
      );
      
      onClose();
    } catch (error) {
      console.error("Error confirming selection:", error);
      toast({
        title: "Erro ao confirmar seleção",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const formatEntregaOption = (entrega: ListaProgramacaoEntrega) => {
    const caminhaoInfo = entrega.caminhao 
      ? `${entrega.caminhao.placa} - ${entrega.caminhao.modelo}`
      : 'Caminhão N/A';
    
    const massaInfo = entrega.massa_remanescente 
      ? `${entrega.massa_remanescente.toFixed(1)}t disponível`
      : 'Massa N/A';
    
    const dateInfo = entrega.data_entrega 
      ? new Date(entrega.data_entrega).toLocaleDateString('pt-BR')
      : 'Data N/A';
    
    const statusInfo = entrega.status ? `[${entrega.status}]` : '';
    
    return `${entrega.logradouro} | ${dateInfo} | ${caminhaoInfo} | ${massaInfo} ${statusInfo}`;
  };

  const getSearchInfo = () => {
    if (searchWithoutDateFilter) {
      return "Buscando em período ampliado (últimos e próximos 7 dias)";
    }
    if (selectedDate) {
      return `Buscando para: ${selectedDate.toLocaleDateString('pt-BR')} (±2 dias)`;
    }
    return "Buscando entregas recentes";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo Apontamento de Aplicação</DialogTitle>
          <DialogDescription>
            Selecione uma entrega com massa remanescente e o logradouro para aplicação.
            <br />
            <span className="text-xs text-muted-foreground">{getSearchInfo()}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <LoadingIndicator />
          ) : entregas.length === 0 ? (
            <EmptyStateMessage 
              hasFilters={!!selectedDate && !searchWithoutDateFilter}
              onRetryWithoutFilters={handleRetryWithoutFilters}
              selectedDate={selectedDate}
            />
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Entrega com Massa Remanescente ({entregas.length} disponível{entregas.length !== 1 ? 'is' : ''})
                </label>
                <Select value={selectedEntregaId} onValueChange={setSelectedEntregaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma entrega..." />
                  </SelectTrigger>
                  <SelectContent>
                    {entregas.map((entrega) => (
                      <SelectItem key={entrega.id} value={entrega.id}>
                        {formatEntregaOption(entrega)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedEntregaId && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Logradouro para Aplicação
                    {isLoadingLogradouros && " (Carregando...)"}
                  </label>
                  <Select 
                    value={selectedLogradouroId} 
                    onValueChange={setSelectedLogradouroId}
                    disabled={isLoadingLogradouros}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        isLoadingLogradouros 
                          ? "Carregando logradouros..." 
                          : "Selecione um logradouro..."
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {logradouros.map((logradouro) => (
                        <SelectItem key={logradouro.id} value={logradouro.id}>
                          {logradouro.logradouro}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!selectedEntregaId || !selectedLogradouroId || isLoading}
          >
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NovoApontamentoModal;
