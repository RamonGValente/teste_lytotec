
import { useState } from "react";
import { Funcionario, FuncionarioFilter } from "@/types/funcionario";

export function useFuncionarioState() {
  const [filters, setFilters] = useState<FuncionarioFilter>({});
  const [currentFuncionario, setCurrentFuncionario] = useState<Funcionario | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingFuncionario, setDeletingFuncionario] = useState<Funcionario | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return {
    // State
    filters,
    setFilters,
    currentFuncionario,
    setCurrentFuncionario,
    isFormModalOpen,
    setIsFormModalOpen,
    isDetailsModalOpen,
    setIsDetailsModalOpen,
    isImportModalOpen,
    setIsImportModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    deletingFuncionario,
    setDeletingFuncionario,
    isDeleting,
    setIsDeleting,
    isImporting,
    setIsImporting,
    isSubmitting,
    setIsSubmitting
  };
}
