
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RegistroAplicacao } from '@/types/registroAplicacao';
import { RegistroAplicacaoActions } from './RegistroAplicacaoActions';
import { RegistroAplicacaoViewModal } from './RegistroAplicacaoViewModal';
import { RegistroAplicacaoEditModal } from './RegistroAplicacaoEditModal';
import { DeleteRegistroAplicacaoDialog } from './DeleteRegistroAplicacaoDialog';
import { Badge } from '@/components/ui/badge';
import { getEspessuraCalculadaStatus, getEspessuraCalculadaStatusText } from '@/utils/aplicacaoCalculations';
import { formatBrazilianDateForDisplay } from '@/utils/timezoneUtils';
import EmptyStateMessage from './EmptyStateMessage';
import { formatMassaFromDatabase } from '@/utils/massaConversionUtils';

interface RegistroAplicacaoTableProps {
  registros: RegistroAplicacao[];
  isLoading: boolean;
  onRefresh?: () => void;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}

const RegistroAplicacaoTable: React.FC<RegistroAplicacaoTableProps> = ({ 
  registros, 
  isLoading, 
  onRefresh,
  hasActiveFilters = false,
  onClearFilters
}) => {
  const [selectedRegistro, setSelectedRegistro] = useState<RegistroAplicacao | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  console.log("📊 Rendering RegistroAplicacaoTable with:", {
    registrosCount: registros?.length || 0,
    isLoading,
    hasActiveFilters,
    sampleRegistro: registros?.[0]?.id
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!registros || registros.length === 0) {
    return (
      <EmptyStateMessage 
        hasFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
      />
    );
  }

  const handleView = (registro: RegistroAplicacao) => {
    setSelectedRegistro(registro);
    setViewModalOpen(true);
  };

  const handleEdit = (registro: RegistroAplicacao) => {
    setSelectedRegistro(registro);
    setEditModalOpen(true);
  };

  const handleDelete = (registro: RegistroAplicacao) => {
    setSelectedRegistro(registro);
    setDeleteDialogOpen(true);
  };

  const getStatusDisplay = (registro: RegistroAplicacao) => {
    if (registro.espessura_calculada) {
      const status = getEspessuraCalculadaStatus(registro.espessura_calculada);
      const text = getEspessuraCalculadaStatusText(status);
      const variant = status === 'success' ? 'default' : 'destructive';
      return <Badge variant={variant}>{text}</Badge>;
    }
    return <Badge variant="secondary">Não calculado</Badge>;
  };

  return (
    <>
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Logradouro</TableHead>
              <TableHead>Centro de Custo</TableHead>
              <TableHead>Caminhão</TableHead>
              <TableHead>Qtd. Massa (t)</TableHead>
              <TableHead>Lançamento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registros.map((registro) => {
              // Get the correct logradouro - use the one directly from registro_apontamento first
              const logradouro = registro.logradouro_aplicado || 
                                registro.lista_entrega?.logradouro ||
                                "N/A";

              // Get centro de custo name - check multiple paths using new priority order
              const centroCustoNome = 
                registro.lista_entrega?.centro_custo_nome ||
                registro.lista_entrega?.centro_custo?.nome_centro_custo ||
                registro.lista_entrega?.requisicao?.centro_custo?.nome_centro_custo ||
                "N/A";

              // Get the quantity from registro_carga.tonelada_real (convert from kg to tonnes)
              const qtdMassaRaw = registro.registro_carga?.tonelada_real || registro.tonelada_aplicada;
              const qtdMassa = qtdMassaRaw 
                ? (registro.registro_carga?.tonelada_real 
                    ? formatMassaFromDatabase(registro.registro_carga.tonelada_real, 'bd_registro_cargas', 'tonelada_real')
                    : qtdMassaRaw)
                : "N/A";

              // Get tipo_lancamento from lista_entrega
              const tipoLancamento = registro.lista_entrega?.tipo_lancamento || "N/A";
              
              return (
                <TableRow key={registro.id}>
                  <TableCell>
                    {registro.data_aplicacao ? 
                      formatBrazilianDateForDisplay(registro.data_aplicacao) : 
                      "N/A"}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={logradouro}>
                    {logradouro}
                  </TableCell>
                  <TableCell className="max-w-[150px] truncate" title={centroCustoNome}>
                    {centroCustoNome}
                  </TableCell>
                  <TableCell>
                    {registro.lista_entrega?.caminhao ? 
                      `${registro.lista_entrega.caminhao.placa} - ${registro.lista_entrega.caminhao.modelo}` : 
                      "N/A"}
                  </TableCell>
                  <TableCell>
                    {typeof qtdMassa === 'number' ? `${qtdMassa.toFixed(1)}t` : qtdMassa}
                  </TableCell>
                  <TableCell>{tipoLancamento}</TableCell>
                  <TableCell>{getStatusDisplay(registro)}</TableCell>
                  <TableCell>
                    <RegistroAplicacaoActions
                      onView={() => handleView(registro)}
                      onEdit={() => handleEdit(registro)}
                      onDelete={() => handleDelete(registro)}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {selectedRegistro && (
        <>
          <RegistroAplicacaoViewModal
            registro={selectedRegistro}
            isOpen={viewModalOpen}
            onClose={() => {
              setViewModalOpen(false);
              setSelectedRegistro(null);
            }}
          />
          
          <RegistroAplicacaoEditModal
            registro={selectedRegistro}
            isOpen={editModalOpen}
            onClose={() => {
              setEditModalOpen(false);
              setSelectedRegistro(null);
            }}
            onSuccess={() => {
              setEditModalOpen(false);
              setSelectedRegistro(null);
              onRefresh?.();
            }}
          />
          
          <DeleteRegistroAplicacaoDialog
            registro={selectedRegistro}
            isOpen={deleteDialogOpen}
            onClose={() => {
              setDeleteDialogOpen(false);
              setSelectedRegistro(null);
            }}
            onSuccess={() => {
              setDeleteDialogOpen(false);
              setSelectedRegistro(null);
              onRefresh?.();
            }}
          />
        </>
      )}
    </>
  );
};

export default RegistroAplicacaoTable;
