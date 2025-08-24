
import { useCallback } from "react";
import { Funcionario } from "@/types/funcionario";
import { useToast } from "../use-toast";
import * as XLSX from 'xlsx';

export function useFuncionarioExcel(funcionarios: Funcionario[] | undefined) {
  const { toast } = useToast();

  const exportToExcel = useCallback(() => {
    if (funcionarios && funcionarios.length > 0) {
      // Prepare data for Excel export with all requested fields
      const worksheet = XLSX.utils.json_to_sheet(funcionarios.map(f => ({
        'Nome Completo': f.nome_completo || '',
        'CPF': f.cpf || '',
        'Data de Nascimento': f.data_nascimento || '',
        'Email': f.email || '',
        'Endereço Completo': f.endereco_completo || '',
        'Escolaridade': f.escolaridade || '',
        'Gênero': f.genero || '',
        'Função': f.bd_funcoes?.nome_funcao || '',
        'Departamento': f.bd_departamentos?.nome_departamento || '',
        'Centro de Custo': f.bd_centros_custo ? 
          `${f.bd_centros_custo.codigo_centro_custo} - ${f.bd_centros_custo.nome_centro_custo}` : '',
        'Empresa': f.bd_empresas?.nome_empresa || '',
        'Equipe': f.equipe_id || '', // Assuming equipe_id contains the name, adjust if needed
        'Data de Admissão': f.data_admissao || '',
        'Data de Férias': f.data_ferias || '',
        'Data de Demissão': f.data_demissao || '',
        'Status': f.status || '',
        'Salário Base': f.salario_base || 0,
        'Insalubridade': f.insalubridade || 0,
        'Periculosidade': f.periculosidade || 0,
        'Gratificação': f.gratificacao || 0,
        'Adicional Noturno': f.adicional_noturno || 0,
        'Custo Passagem': f.custo_passagem || 0,
        'Refeição': f.refeicao || 0,
        'Diárias': f.diarias || 0
      })));
      
      // Set column widths for better readability
      const columnWidths = [
        { wch: 30 }, // Nome Completo
        { wch: 15 }, // CPF
        { wch: 15 }, // Data de Nascimento
        { wch: 30 }, // Email
        { wch: 40 }, // Endereço Completo
        { wch: 15 }, // Escolaridade
        { wch: 10 }, // Gênero
        { wch: 20 }, // Função
        { wch: 20 }, // Departamento
        { wch: 30 }, // Centro de Custo
        { wch: 20 }, // Empresa
        { wch: 20 }, // Equipe
        { wch: 15 }, // Data de Admissão
        { wch: 15 }, // Data de Férias
        { wch: 15 }, // Data de Demissão
        { wch: 10 }, // Status
        { wch: 15 }, // Salário Base
        { wch: 15 }, // Insalubridade
        { wch: 15 }, // Periculosidade
        { wch: 15 }, // Gratificação
        { wch: 15 }, // Adicional Noturno
        { wch: 15 }, // Custo Passagem
        { wch: 15 }, // Refeição
        { wch: 15 }  // Diárias
      ];
      
      worksheet['!cols'] = columnWidths;
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Funcionários");
      
      // Generate Excel file
      XLSX.writeFile(workbook, "funcionarios.xlsx");
      
      toast({
        title: "Exportação concluída",
        description: "Os dados foram exportados com sucesso."
      });
    } else {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há funcionários para exportar.",
        variant: "destructive"
      });
    }
  }, [funcionarios, toast]);

  return { exportToExcel };
}
