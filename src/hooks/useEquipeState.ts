
import { useState } from "react";
import { Equipe, EquipeFilter } from "@/types/equipe";

export function useEquipeState() {
  const [filters, setFilters] = useState<EquipeFilter>({});
  const [currentEquipe, setCurrentEquipe] = useState<Equipe | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingEquipe, setDeletingEquipe] = useState<Equipe | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return {
    // State
    filters,
    setFilters,
    currentEquipe,
    setCurrentEquipe,
    isFormModalOpen,
    setIsFormModalOpen,
    isDetailsModalOpen,
    setIsDetailsModalOpen,
    isImportModalOpen,
    setIsImportModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    deletingEquipe,
    setDeletingEquipe,
    isDeleting,
    setIsDeleting,
    isImporting,
    setIsImporting,
    isSubmitting,
    setIsSubmitting
  };
}
