
import { downloadExcel, parseExcelFile } from "@/lib/excel";
import { supabase } from "@/integrations/supabase/client";
import { Veiculo, VeiculoFormData, ImportResult } from "./types";

export const exportVeiculos = async (veiculos: Veiculo[]) => {
  const data = veiculos.map(veiculo => ({
    'Placa': veiculo.placa || 'N/A',
    'Tipo de Veículo': veiculo.tipo_veiculo || 'N/A',
    'Frota': veiculo.frota || 'N/A',
    'Número Frota': veiculo.numero_frota || 'N/A',
    'Marca': veiculo.marca || 'N/A',
    'Modelo': veiculo.modelo || 'N/A',
    'Cor': veiculo.cor || 'N/A',
    'Departamento': veiculo.nome_departamento || 'N/A',
    'Motor': veiculo.motor || 'N/A',
    'Ano de Fabricação': veiculo.ano_fabricacao || 'N/A',
    'Tipo de Combustível': veiculo.tipo_combustivel || 'N/A',
    'Status IPVA': veiculo.status_ipva || 'N/A',
    'Situação': veiculo.situacao || 'N/A',
    'Capacidade': veiculo.capacidade || 'N/A',
    'Aluguel': veiculo.aluguel || 'N/A',
    'Observações': veiculo.observacoes || 'N/A',
  }));

  return downloadExcel(data, 'Veículos');
};

export const importVeiculos = async (veiculos: VeiculoFormData[] | File): Promise<ImportResult> => {
  try {
    if (veiculos instanceof File) {
      try {
        console.log("Processing Excel file import");
        const jsonData = await parseExcelFile(veiculos);
        console.log("Parsed Excel data:", jsonData);
        
        // Map Excel columns to database fields
        const mappedVeiculos = jsonData.map((row: any) => ({
          frota: row.Frota || row.frota,
          numero_frota: row["Numero frota"] || row["Número frota"] || row.numero_frota,
          departamento_id: null,
          placa: row.Placa || row.placa,
          tipo_veiculo: row["Tipo de Veículo"] || row["Tipo de Veiculo"] || row.tipo_veiculo,
          marca: row.Marca || row.marca,
          modelo: row.Modelo || row.modelo,
          cor: row.Cor || row.cor,
          motor: row.Motor || row.motor,
          ano_fabricacao: row["Ano de Fabricação"] || row["Ano de Fabricacao"] || row.ano_fabricacao,
          tipo_combustivel: row["Tipo de Combustível"] || row["Tipo de Combustivel"] || row.tipo_combustivel,
          status_ipva: row["Status IPVA"] || row.status_ipva,
          situacao: row.Situação || row.Situacao || row.situacao,
          capacidade: row.Capacidade || row.capacidade,
          aluguel: row.Aluguel || row.aluguel,
          observacoes: row.Observações || row.Observacoes || row.observacoes,
          empresa_id: null,
          imagem_url: null
        }));

        console.log("Mapped vehicles:", mappedVeiculos);

        // Try to find departments by name from the Excel data
        for (const veiculo of mappedVeiculos) {
          const rowData = jsonData.find((r: any) => 
            (r.Placa === veiculo.placa || r.placa === veiculo.placa) || 
            (!veiculo.placa && (r.Modelo === veiculo.modelo || r.modelo === veiculo.modelo))
          );
          
          if (rowData && (rowData.Departamento || rowData.departamento)) {
            const deptName = rowData.Departamento || rowData.departamento;
            try {
              console.log("Looking for department:", deptName);
              const { data: deptData } = await supabase
                .from("bd_departamentos")
                .select("id")
                .ilike("nome_departamento", deptName)
                .maybeSingle();
              
              if (deptData) {
                console.log("Found department ID:", deptData.id);
                veiculo.departamento_id = deptData.id;
              }
            } catch (err) {
              console.error("Error finding department by name:", err);
            }
          }
          
          // Similar logic for empresa_id if company name is in the Excel
          if (rowData && (rowData.Empresa || rowData.empresa)) {
            const empresaNome = rowData.Empresa || rowData.empresa;
            try {
              console.log("Looking for company:", empresaNome);
              const { data: empresaData } = await supabase
                .from("bd_empresas")
                .select("id")
                .ilike("nome_empresa", empresaNome)
                .maybeSingle();
              
              if (empresaData) {
                console.log("Found company ID:", empresaData.id);
                veiculo.empresa_id = empresaData.id;
              }
            } catch (err) {
              console.error("Error finding company by name:", err);
            }
          }
        }

        return processImportVeiculos(mappedVeiculos);
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        return { 
          success: [], 
          errors: [{ message: "Erro ao processar arquivo Excel" }] 
        };
      }
    } else {
      console.log("Processing direct data import");
      return processImportVeiculos(veiculos);
    }
  } catch (error: any) {
    console.error("Error importing veiculos:", error);
    return { 
      success: [], 
      errors: [{ message: error.message || "Erro ao importar veículos" }]
    };
  }
};

const processImportVeiculos = async (veiculos: VeiculoFormData[]): Promise<ImportResult> => {
  try {
    console.log("Processing import vehicles, count:", veiculos.length);
    
    // Filter valid vehicles - allow both vehicles with plates and equipment without plates
    const validVeiculos = veiculos.filter(v => {
      const isValid = v.tipo_veiculo && 
        (v.placa || 
         v.tipo_veiculo.toLowerCase() === 'maquina' || 
         v.tipo_veiculo.toLowerCase() === 'equipamento' ||
         v.tipo_veiculo.toLowerCase() === 'máquina');
        
      if (!isValid) {
        console.log("Invalid entry:", v);
      }
      return isValid;
    });
    
    console.log("Valid vehicles count:", validVeiculos.length);
    
    if (validVeiculos.length === 0) {
      return { 
        success: [], 
        errors: [{ message: "Nenhum veículo válido encontrado para importação" }] 
      };
    }

    // Prepare data for insertion, nullifying empty departamento_id
    const processedVeiculos = validVeiculos.map(v => ({
      ...v,
      departamento_id: (v.departamento_id === "" || v.departamento_id === "_none") ? null : v.departamento_id,
      empresa_id: (v.empresa_id === "" || v.empresa_id === "_none") ? null : v.empresa_id
    }));

    console.log("Inserting vehicles into database...");
    const { data, error } = await supabase
      .from("bd_caminhoes_equipamentos")
      .insert(processedVeiculos)
      .select();

    if (error) {
      console.error("Database insertion error:", error);
      return { success: [], errors: [{ message: error.message }] };
    }

    console.log("Successfully imported vehicles:", data?.length);
    return { 
      success: data as Veiculo[], 
      errors: []
    };
  } catch (error: any) {
    console.error("Error processing vehicle import:", error);
    return { 
      success: [], 
      errors: [{ message: error.message || "Erro ao processar importação de veículos" }] 
    };
  }
};
