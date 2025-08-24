
import { useCallback } from "react";
import * as XLSX from "xlsx";
import { Equipe } from "@/types/equipe";

export function useEquipeExcel() {
  const exportToExcel = useCallback((equipes: Equipe[]) => {
    try {
      // Prepare data for export
      const exportData = equipes.map(equipe => ({
        "Nome da Equipe": equipe.nome_equipe,
        "Encarregado": equipe.encarregado?.nome_completo || "",
        "Apontador": equipe.apontador?.nome_completo || "",
        "Total de Membros": equipe.equipe?.length || 0,
        "Data de Criação": equipe.created_at ? new Date(equipe.created_at).toLocaleDateString('pt-BR') : "",
        "Última Atualização": equipe.updated_at ? new Date(equipe.updated_at).toLocaleDateString('pt-BR') : ""
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Set column widths
      const columnWidths = [
        { wch: 30 }, // Nome da Equipe
        { wch: 30 }, // Encarregado
        { wch: 30 }, // Apontador
        { wch: 20 }, // Total de Membros
        { wch: 15 }, // Data de Criação
        { wch: 15 }  // Última Atualização
      ];
      
      worksheet["!cols"] = columnWidths;

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Equipes");

      // Generate Excel file and trigger download
      XLSX.writeFile(workbook, "equipes.xlsx");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      throw error;
    }
  }, []);

  return { exportToExcel };
}
