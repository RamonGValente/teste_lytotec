
import React, { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import SafeModalWrapper from "@/components/safe/SafeModalWrapper";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ListaProgramacaoEntrega } from "@/types/programacaoEntrega";
import { RegistroCarga } from "@/types/registroCargas";
import { fetchCentroCustoForProgramacao } from "@/services/centroCustoRegistroService";
import RegistroCargaHeader from "./RegistroCargaHeader";
import PesagemSection from "./PesagemSection";

interface RegistroCargaFormProps {
  isOpen: boolean;
  onClose: () => void;
  form: UseFormReturn<any>;
  isLoading: boolean;
  onSubmit: () => void;
  ticketSaidaPreview: string | null;
  ticketRetornoPreview: string | null;
  handleTicketSaidaChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTicketRetornoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentEntrega: ListaProgramacaoEntrega | null;
  existingRegistro: RegistroCarga | null;
  modoRetorno?: {
    ativo: boolean;
    entregaId: string;
    massaEsperada: number;
  } | null;
}

const RegistroCargaForm: React.FC<RegistroCargaFormProps> = ({
  isOpen,
  onClose,
  form,
  isLoading,
  onSubmit,
  ticketSaidaPreview,
  ticketRetornoPreview,
  handleTicketSaidaChange,
  handleTicketRetornoChange,
  currentEntrega,
  existingRegistro,
  modoRetorno = null,
}) => {
  const [centroCustoInfo, setCentroCustoInfo] = useState<string>("Carregando...");

  useEffect(() => {
    const loadCentroCusto = async () => {
      if (currentEntrega?.programacao_entrega_id) {
        const centroCusto = await fetchCentroCustoForProgramacao(currentEntrega.programacao_entrega_id);
        if (centroCusto) {
          setCentroCustoInfo(`${centroCusto.codigo_centro_custo}`);
        } else {
          setCentroCustoInfo("Centro de custo não encontrado");
        }
      } else {
        setCentroCustoInfo("Não associado");
      }
    };

    loadCentroCusto();
  }, [currentEntrega]);

  if (!currentEntrega) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <SafeModalWrapper onError={() => console.warn('Modal error interceptado')}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {modoRetorno?.ativo && (
                <div className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-md font-medium">
                  RETORNO DE MASSA
                </div>
              )}
              {existingRegistro ? 'Atualizar Registro de Carga' : 'Novo Registro de Carga'}
            </DialogTitle>
            <DialogDescription>
              {modoRetorno?.ativo ? (
                <div className="space-y-1">
                  <span>Registrando retorno de massa remanescente</span>
                  <div className="text-orange-700 font-medium text-sm">
                    ⚠️ Massa esperada para retorno: ~{modoRetorno.massaEsperada.toFixed(2)}t
                  </div>
                </div>
              ) : (
                "Preencha os dados para registrar a carga"
              )}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-6">
              <RegistroCargaHeader
                form={form}
                currentEntrega={currentEntrega}
                centroCustoInfo={centroCustoInfo}
              />

              <Separator />

              <PesagemSection
                form={form}
                ticketSaidaPreview={ticketSaidaPreview}
                ticketRetornoPreview={ticketRetornoPreview}
                handleTicketSaidaChange={handleTicketSaidaChange}
                handleTicketRetornoChange={handleTicketRetornoChange}
                modoRetorno={modoRetorno}
              />

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                      Salvando...
                    </>
                  ) : existingRegistro ? "Atualizar" : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </SafeModalWrapper>
      </DialogContent>
    </Dialog>
  );
};

export default RegistroCargaForm;
