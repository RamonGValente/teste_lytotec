
import { ListaProgramacaoEntrega } from "@/types/programacaoEntrega";
import { formatBrazilianDateForDisplay, getCurrentBrazilianDate } from "@/utils/timezoneUtils";

/**
 * Export to Excel function - modified to accept ListaProgramacaoEntrega array
 */
export const exportRegistrosAplicacaoToExcel = (entregas: ListaProgramacaoEntrega[]): void => {
  import('xlsx').then((XLSX) => {
    const exportData = entregas.map(entrega => {
      return {
        'Data da Aplicação': getCurrentBrazilianDate(),
        'Logradouro': entrega.logradouro || 'N/A',
        'Caminhão': entrega.caminhao 
          ? `${entrega.caminhao.placa} - ${entrega.caminhao.modelo}` 
          : 'N/A',
        'Equipe': entrega.equipe?.nome_equipe || 'N/A',
        'Qtd. Massa (t)': entrega.quantidade_massa || 'N/A',
        'Lançamento': entrega.tipo_lancamento || 'N/A',
        'Status': entrega.status || 'N/A',
      };
    });
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    XLSX.utils.book_append_sheet(wb, ws, 'Entregas Enviadas');
    
    const fileName = `entregas-enviadas-${getCurrentBrazilianDate().replace(/-/g, '')}.xlsx`;
    
    XLSX.writeFile(wb, fileName);
  }).catch(error => {
    console.error("Error importing XLSX:", error);
  });
};
