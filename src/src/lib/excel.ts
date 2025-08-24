
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// ========== Funções anteriores simuladas ==========
export function parseCentroCustoExcel(file) {
  console.log("Simulando parseCentroCustoExcel...");
  return [];
}

export function generateCentroCustoTemplate() {
  console.log("Simulando generateCentroCustoTemplate...");
  return new Blob([], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

export function parseFuncoesExcel(file) {
  console.log("Simulando parseFuncoesExcel...");
  return [];
}

export function generateFuncoesTemplate() {
  console.log("Simulando generateFuncoesTemplate...");
  return new Blob([], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
}

export function downloadExcel(data, filename = "dados.xlsx") {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Dados");
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, filename);
}

export function parseExcelFile(file) {
  console.log("Simulando parseExcelFile...");
  return Promise.resolve([]);
}

// ========== Função nova do relatório de medição ==========
export function downloadRelatorioMedicaoExcel(reportData, manutencaoData, vehicleDetails, dateRange, tipoVeiculo) {
  const wb = XLSX.utils.book_new();
  const sheetData = [];
  const obrasUnicas = [...new Set(reportData.map(item => item.centro_custo))].join(" / ");

  sheetData.push(["CONSTRUTORA LITORÂNEA"]);
  sheetData.push(["RELATÓRIO DE MEDIÇÃO"]);
  sheetData.push(["CONTRATADA: ABRA INFRAESTRUTURA", "", "", "", "", "", "", `OBRA: ${obrasUnicas || "NÃO INFORMADO"}`]);
  sheetData.push(["", "", "", "", "", "", "", `Mês de Referência: ${new Date(dateRange.from).toLocaleDateString("pt-BR", { month: "long" }).toUpperCase()}`]);
  sheetData.push(["", "", "", "", "", "", "", `Período: ${new Date(dateRange.from).toLocaleDateString()} à ${new Date(dateRange.to).toLocaleDateString()}`]);
  sheetData.push(["", "", "", "", "", "", "", "PM nº: 9"]);
  sheetData.push([]);
  sheetData.push([""]);
  sheetData.push(["", "", "", "DESCRIÇÃO DOS SERVIÇOS", "", "", ""]);
  sheetData.push(["", "", "", "", "", "", ""]);
  sheetData.push(["", "", "", "", "", "", ""]);
  sheetData.push([
    "DESCRIÇÃO DOS SERVIÇOS", "TOTAL MENSAL (R$)", "QTD/DIA", "VALOR (R$)",
    "PRODUTIVIDADE", "ABASTECIMENTO", "MÉDIA ABAST.", "RASTREADOR"
  ]);

  for (const item of reportData) {
    sheetData.push([
      item.label,
      `R$ ${item.totalMensal?.toFixed(2) || "0,00"}`,
      item.qtdDia || item.diasTrabalhados || "",
      `R$ ${item.valor?.toFixed(2) || "0,00"}`,
      `${item.quilometragem?.toFixed(2) || item.produtividade?.toFixed(2) || 0} km`,
      `${item.abastecimento?.toFixed(2) || 0} L`,
      `${item.mediaAbastecimento?.toFixed(2) || 0} L/KM`,
      `${item.rastreador?.toFixed(2) || 0} km`
    ]);
  }

  sheetData.push([]);
  sheetData.push(["2. DESCONTOS/ACRÉSCIMOS"]);
  sheetData.push(["2.1 DESCONTO DE MANUTENÇÃO"]);
  sheetData.push(["VALOR MENSAL", "QTD/DIA", "VALOR (R$)"]);
  sheetData.push([
    `R$ ${manutencaoData?.valorMensal?.toFixed(2) || "0,00"}`,
    manutencaoData?.qtdDia || manutencaoData?.qtdHoras || 0,
    `R$ ${manutencaoData?.valor?.toFixed(2) || "0,00"}`
  ]);

  sheetData.push([]);
  sheetData.push(["Observações:"]);
  sheetData.push([""]);
  sheetData.push([]);

  const totalPeriodo = reportData.reduce((acc, curr) => acc + (curr.valor || 0), 0);
  sheetData.push(["", "", "", "", `TOTAL NO PERÍODO: R$ ${totalPeriodo.toFixed(2)}`]);
  sheetData.push([]);
  sheetData.push(["", "", "", "", "", "", ""]);
  sheetData.push(["", "", "", "", "", "", ""]);
  sheetData.push(["", "", "", "", "", "", ""]);
  sheetData.push(["", "", "", "", "", "", ""]);
  sheetData.push(["Medição e Controle", "", "", "Gestor de Contratos", "", "", "Contratada"]);

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  XLSX.utils.book_append_sheet(wb, ws, "Relatório de Medição");

  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

  const nomeObra = obrasUnicas.replace(/[^a-zA-Z0-9]/g, "_") || "relatorio";
  const nomeMes = new Date(dateRange.from).toLocaleDateString("pt-BR", { month: "long", year: "numeric" }).toUpperCase().replace(/[^A-Z0-9]/g, "_");
  const nomeArquivo = `relatorio_medicao_${nomeObra}_${nomeMes}.xlsx`;

  saveAs(blob, nomeArquivo);
}
