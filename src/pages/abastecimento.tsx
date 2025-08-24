import React, { useState, useEffect, useRef } from 'react';
import ApexCharts from 'apexcharts';
import MainLayout from "@/components/layout/MainLayout";
import { usePermissionGuard } from "@/hooks/usePermissionGuard";
import * as XLSX from 'xlsx';

interface Abastecimento {
  identificador: string;
  tipo_procedimento: string;
  data_abast: string;
  hora_abast: string;
  comboista: string | number;
  operador: string;
  operacao: string;
  frota: string;
  medidor: number;
  medidor_via_entrada: string;
  medidor_unidade: string;
  bico: string;
  combustivel: string;
  litragem: number;
  encerrante_fim: number;
  codigo_terceiro: string;
  latitude: number;
  longitude: number;
  foto_verificada: boolean;
  identificacao_do_ponto: string;
  estoque: string;
  medidor_anterior_data: string;
  medidor_anterior_valor: number;
  placa: string;
  cc: string;
  registro_editado_em: string;
  registrado_editado_por: string;
  frota_tag: string;
  comboista_tag: string;
  operador_tag: string;
  data_integracao: string;
}

const RENDER_API_BASE_URL = "https://abastecimento-proxy.onrender.com/api";
const AUTH_ENDPOINT = `${RENDER_API_BASE_URL}/authenticate`;
const ABASTECIMENTOS_ENDPOINT = `${RENDER_API_BASE_URL}/abastecimentos`;
const comboistaNames: { [key: string]: string } = {};

// Nova paleta de cores para os gráficos
const CHART_COLORS = [
  '#546E7A', // Azul
  '#00E396', // Verde
  '#546E7A', // Laranja
  '#FF4560', // Vermelho
  '#F46036', // Roxo
  '#546E7A', // Azul acinzentado
  '#26a69a', // Teal
  '#D7263D', // Vermelho escuro
  '#1B998B', // Teal mais escuro
  '#F46036'  // Laranja queimado FEB019
];

function formatNumberWithCommas(number: number | null | undefined): string {
  if (isNaN(Number(number)) || number === null || typeof number === 'undefined') return '0';
  const integer = Math.round(number);
  return integer.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatDate(date: Date): string {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  return [year, month, day].join('-');
}

const AbastecimentoPage: React.FC = () => {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [filteredAbastecimentos, setFilteredAbastecimentos] = useState<Abastecimento[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [comboista, setComboista] = useState('');
  const [frota, setFrota] = useState('');
  const [placa, setPlaca] = useState('');
  const [cc, setCc] = useState('');
  const [limit, setLimit] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [dataStatus, setDataStatus] = useState('Use os filtros acima e clique em "Buscar" para carregar os dados.');
  const [showDashboard, setShowDashboard] = useState(false);
  const [frotaComparativa1, setFrotaComparativa1] = useState('');
  const [frotaComparativa2, setFrotaComparativa2] = useState('');
  const [comparativeData, setComparativeData] = useState<{ item: string; litragemTotal: number; }[]>([]);
  const [comparativeConsumptionData, setComparativeConsumptionData] = useState<{ item: string; avgConsumption: number; }[]>([]);
  const [frotaConsumo1, setFrotaConsumo1] = useState('');
  const [frotaConsumo2, setFrotaConsumo2] = useState('');
  const [comparativeField, setComparativeField] = useState<'frota' | 'placa'>('frota');
  const [showComparative, setShowComparative] = useState(false);

  const { canAccess, isLoading: permissionLoading } = usePermissionGuard({
    requiredPermission: "gestao_maquinas_abastecimento_view"
  });

  // Refs para os gráficos
  const chartLitragemRef = useRef<ApexCharts | null>(null);
  const chartConsumoDiarioRef = useRef<ApexCharts | null>(null);
  const chartAbastecimentosPorDiaRef = useRef<ApexCharts | null>(null);
  const chartLitragemPorCCRef = useRef<ApexCharts | null>(null);
  const chartAbastecimentosPorComboistaRef = useRef<ApexCharts | null>(null);
  const chartLitragemPorCombustivelRef = useRef<ApexCharts | null>(null);
  const chartConsumoPorFrotaRef = useRef<ApexCharts | null>(null);
  const chartAbastecimentosPorProcedimentoRef = useRef<ApexCharts | null>(null);
  const comparativeChartRef = useRef<HTMLDivElement>(null);
  const comparativeChartInstance = useRef<ApexCharts | null>(null);
  const comparativeConsumptionChartRef = useRef<HTMLDivElement>(null);
  const comparativeConsumptionChartInstance = useRef<ApexCharts | null>(null);

  useEffect(() => {
    setRowsPerPage(limit);
    setCurrentPage(1);
  }, [limit]);

  useEffect(() => {
    if (filteredAbastecimentos.length > 0) {
      displayPaginatedData(filteredAbastecimentos, currentPage, rowsPerPage);
      generateCharts(filteredAbastecimentos);
    } else {
      destroyCharts();
      setShowDashboard(false);
    }
  }, [filteredAbastecimentos, currentPage, rowsPerPage]);

  useEffect(() => {
    if (showComparative && comparativeChartRef.current && comparativeData.length > 0) {
      const categories = comparativeData.map(d => d.item);
      const seriesData = comparativeData.map(d => d.litragemTotal);

      const options: ApexCharts.ApexOptions = {
        chart: { type: 'bar', height: 350 },
        series: [{ name: 'Litragem Total', data: seriesData }],
        xaxis: {
          categories,
          title: { text: comparativeField === 'frota' ? 'Frota' : 'Placa' }
        },
        yaxis: { show: false, title: { text: 'Litragem (L)' } },
        title: {
          text: `Comparativo de Litragem por ${comparativeField === 'frota' ? 'Frota' : 'Placa'}`,
          align: 'center'
        },
        dataLabels: { enabled: true, formatter: (val) => `${(val as number).toFixed(2)} L` },
        colors: CHART_COLORS
      };

      if (comparativeChartInstance.current) {
        comparativeChartInstance.current.updateOptions(options);
      } else {
        comparativeChartInstance.current = new ApexCharts(comparativeChartRef.current, options);
        comparativeChartInstance.current.render();
      }
    } else if (!showComparative && comparativeChartInstance.current) {
      comparativeChartInstance.current.destroy();
      comparativeChartInstance.current = null;
    }

    // Gráfico comparativo de consumo médio
    if (showComparative && comparativeConsumptionChartRef.current && comparativeConsumptionData.length > 0) {
      const categories = comparativeConsumptionData.map(d => d.item);
      const seriesData = comparativeConsumptionData.map(d => d.avgConsumption);

      const options: ApexCharts.ApexOptions = {
        chart: { type: 'bar', height: 350 },
        series: [{ name: 'Consumo Médio (km/L)', data: seriesData }],
        xaxis: {
          categories,
          title: { text: comparativeField === 'frota' ? 'Frota' : 'Placa' }
        },
        yaxis: { show: false, title: { text: 'Consumo (km/L)' } },
        title: {
          text: `Comparativo de Consumo Médio por ${comparativeField === 'frota' ? 'Frota' : 'Placa'}`,
          align: 'center'
        },
        dataLabels: { enabled: true, formatter: (val) => `${(val as number).toFixed(2)} km/L` },
        colors: CHART_COLORS
      };

      if (comparativeConsumptionChartInstance.current) {
        comparativeConsumptionChartInstance.current.updateOptions(options);
      } else {
        comparativeConsumptionChartInstance.current = new ApexCharts(comparativeConsumptionChartRef.current, options);
        comparativeConsumptionChartInstance.current.render();
      }
    } else if (!showComparative && comparativeConsumptionChartInstance.current) {
      comparativeConsumptionChartInstance.current.destroy();
      comparativeConsumptionChartInstance.current = null;
    }
  }, [showComparative, comparativeData, comparativeConsumptionData, comparativeField]);

  const destroyCharts = () => {
    [
      chartLitragemRef, chartConsumoDiarioRef, chartAbastecimentosPorDiaRef,
      chartLitragemPorCCRef, chartAbastecimentosPorComboistaRef,
      chartLitragemPorCombustivelRef, chartConsumoPorFrotaRef, chartAbastecimentosPorProcedimentoRef
    ].forEach(chartRef => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    });

    if (comparativeChartInstance.current) {
      comparativeChartInstance.current.destroy();
      comparativeChartInstance.current = null;
    }

    if (comparativeConsumptionChartInstance.current) {
      comparativeConsumptionChartInstance.current.destroy();
      comparativeConsumptionChartInstance.current = null;
    }
  };

  const authenticate = async () => {
    const username = 'testekorth@lytoranea';
    const password = '0123456789';
    try {
      const response = await fetch(AUTH_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ login: username, senha: password })
      });

      const data = await response.json();

      if (response.ok && data.dados?.token) {
        setAuthToken(data.dados.token);

        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 90);

        setStartDate(formatDate(startDate));
        setEndDate(formatDate(endDate));
        return true;
      } else {
        const errorMessage = data.erros?.join(', ') || 'Credenciais inválidas ou erro desconhecido.';
        console.error(`Falha no login: ${errorMessage}`);
        return false;
      }
    } catch (error: any) {
      console.error(`Erro de rede ao autenticar: ${error.message}`);
      return false;
    }
  };

  useEffect(() => {
    authenticate();
  }, []);

  const fetchAndFilterAbastecimentos = async () => {
    if (!authToken) {
      setDataStatus('Token de autenticação não encontrado. Faça login novamente.');
      return;
    }

    if (!startDate || !endDate) {
      setDataStatus('Por favor, selecione as datas inicial e final.');
      return;
    }

    setDataStatus('Carregando dados...');
    const params = new URLSearchParams({
      dataIni: startDate,
      dataFim: endDate,
      referencia: 'data_abast',
      allData: 'true',
      limit: '10000'
    });

    try {
      const response = await fetch(`${ABASTECIMENTOS_ENDPOINT}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });

      const data = await response.json();

      if (response.ok && data.dados) {
        const filtered = data.dados.filter((abast: Abastecimento) => {
          const comboistaId = abast.comboista?.toString() || '';
          const comboistaName = comboistaNames[comboistaId] || comboistaId;
          const comboistaMatches = !comboista || comboistaName.toUpperCase().includes(comboista.toUpperCase());
          const matchesFrota = !frota || (abast.frota && abast.frota.toString().toUpperCase().includes(frota.toUpperCase()));
          const matchesPlaca = !placa || (abast.placa && abast.placa.toString().toUpperCase().includes(placa.toUpperCase()));
          const matchesCc = !cc || (abast.cc && abast.cc.toString().toUpperCase().includes(cc.toUpperCase()));

          return comboistaMatches && matchesFrota && matchesPlaca && matchesCc;
        });

        setFilteredAbastecimentos(filtered);

        if (filtered.length > 0) {
          setDataStatus(`Foram encontrados ${filtered.length} abastecimentos.`);
          setShowDashboard(true);
        } else {
          setDataStatus('Nenhum abastecimento encontrado para os filtros selecionados.');
          setShowDashboard(false);
        }
      } else {
        const errorMessage = data.erros?.join(', ') || 'Erro ao carregar dados.';
        setDataStatus(`Erro: ${errorMessage}`);
        setFilteredAbastecimentos([]);
        setShowDashboard(false);
      }
    } catch (error: any) {
      setDataStatus(`Erro de rede: ${error.message}`);
      setFilteredAbastecimentos([]);
      setShowDashboard(false);
    }
  };

  const handleCompareFrotas = () => {
    if (!frotaComparativa1 || !frotaComparativa2) {
      setComparativeData([]);
      return;
    }

    const itemsToCompare = [frotaComparativa1.toUpperCase(), frotaComparativa2.toUpperCase()];
    const litragemPorItem: { [key: string]: number } = {};

    const abastecimentosFiltrados = filteredAbastecimentos.filter(abast => {
      const itemValue = comparativeField === 'frota'
        ? abast.frota
        : abast.placa;

      return itemsToCompare.includes(String(itemValue || '').toUpperCase());
    });

    abastecimentosFiltrados.forEach(abast => {
      const itemKey = comparativeField === 'frota'
        ? abast.frota || 'N/A'
        : abast.placa || 'N/A';

      const litragem = parseFloat(abast.litragem as any) || 0;
      litragemPorItem[itemKey] = (litragemPorItem[itemKey] || 0) + litragem;
    });

    const formattedData = Object.entries(litragemPorItem).map(([item, litragemTotal]) => ({
      item,
      litragemTotal
    }));

    setComparativeData(formattedData);
  };

  const handleCompareConsumption = () => {
    if (!frotaConsumo1 || !frotaConsumo2) {
      setComparativeConsumptionData([]);
      return;
    }

    const itemsToCompare = [frotaConsumo1.toUpperCase(), frotaConsumo2.toUpperCase()];
    const dataPorItem: { [key: string]: { km: number; liters: number } } = {};
    const vehicleMedidorHistory: { [key: string]: { datetime: Date; medidor: number; litragem: number; item: string }[] } = {};

    const abastecimentosFiltrados = filteredAbastecimentos.filter(abast => {
      const itemValue = comparativeField === 'frota'
        ? abast.frota
        : abast.placa;

      return itemsToCompare.includes(String(itemValue || '').toUpperCase());
    });

    abastecimentosFiltrados.forEach(abast => {
      const vehicleKey = abast.placa || abast.frota;
      if (!vehicleKey) return;

      const itemValue = comparativeField === 'frota'
        ? abast.frota || 'N/A'
        : abast.placa || 'N/A';

      const datetime = abast.data_abast && abast.hora_abast
        ? new Date(`${abast.data_abast.split('T')[0]}T${abast.hora_abast}`)
        : new Date();

      vehicleMedidorHistory[vehicleKey] = vehicleMedidorHistory[vehicleKey] || [];
      vehicleMedidorHistory[vehicleKey].push({
        datetime,
        medidor: parseFloat(abast.medidor as any),
        litragem: parseFloat(abast.litragem as any),
        item: itemValue
      });
    });

    for (const vehicleKey in vehicleMedidorHistory) {
      const entries = vehicleMedidorHistory[vehicleKey];
      entries.sort((a, b) => a.datetime.getTime() - b.datetime.getTime());

      let previousMedidorValid: number | null = null;

      entries.forEach(currentEntry => {
        const item = currentEntry.item;
        dataPorItem[item] = dataPorItem[item] || { km: 0, liters: 0 };

        if (!isNaN(currentEntry.medidor)) {
          if (previousMedidorValid !== null) {
            const kmDriven = currentEntry.medidor - previousMedidorValid;
            if (kmDriven > 0 && !isNaN(currentEntry.litragem) && currentEntry.litragem > 0) {
              dataPorItem[item].km += kmDriven;
              dataPorItem[item].liters += currentEntry.litragem;
            }
          }
          previousMedidorValid = currentEntry.medidor;
        }
      });
    }

    const formattedData = Object.entries(dataPorItem).map(([item, { km, liters }]) => ({
      item,
      avgConsumption: liters > 0 ? km / liters : 0
    }));

    setComparativeConsumptionData(formattedData);
  };

  const formatDateToDDMMYYYY = (dateString: string) => {
    if (!dateString) return 'N/A';
    const datePart = dateString.split('T')[0];
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleExportToExcel = () => {
    if (filteredAbastecimentos.length === 0) {
      alert('Nenhum dado para exportar.');
      return;
    }

    const exportData = filteredAbastecimentos.map(abast => {
      const comboistaName = comboistaNames[abast.comboista?.toString() || ''] || abast.comboista;

      return {
        'Identificador': abast.identificador,
        'Tipo de Procedimento': abast.tipo_procedimento,
        'Data de Abastecimento': formatDateToDDMMYYYY(abast.data_abast),
        'Hora de Abastecimento': abast.hora_abast,
        'Comboista': comboistaName,
        'Operação': abast.operacao,
        'Frota': abast.frota,
        'Medidor': abast.medidor,
        'Medidor Via Entrada': abast.medidor_via_entrada,
        'Medidor Unidade': abast.medidor_unidade,
        'Bico': abast.bico,
        'Combustível': abast.combustivel,
        'Litragem': abast.litragem,
        'Encerrante Final': abast.encerrante_fim,
        'Foto Verificada': abast.foto_verificada ? 'Sim' : 'Não',
        'Identificação do Ponto': abast.identificacao_do_ponto,
        'Medidor Anterior Data': abast.medidor_anterior_data ? formatDateToDDMMYYYY(abast.medidor_anterior_data) : 'N/A',
        'Medidor Anterior Valor': abast.medidor_anterior_valor,
        'Placa': abast.placa,
        'Centro de Custo (CC)': abast.cc,
        'Registro Editado Em': abast.registro_editado_em,
        'Registrado Editado Por': abast.registrado_editado_por,
        'Frota Tag': abast.frota_tag,
        'Comboista Tag': abast.comboista_tag,
        'Data Integração': abast.data_integracao
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Abastecimentos");
    XLSX.writeFile(workbook, "abastecimentos_export.xlsx");
  };

  const displayPaginatedData = (data: Abastecimento[], page: number, limit: number) => {
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, data.length);
    const totalPagesCount = Math.ceil(data.length / limit);

    setTotalPages(totalPagesCount);
  };

  const getMetricsForAbastecimentos = (subsetAbastecimentos: Abastecimento[]) => {
    let totalLiters = 0;
    let totalKm = 0;
    const vehicleMedidorHistory: { [key: string]: { datetime: Date; medidor: number }[] } = {};

    subsetAbastecimentos.forEach(abast => {
      const vehicleKey = abast.placa || abast.frota;
      const litragem = parseFloat(abast.litragem as any) || 0;
      const medidor = parseFloat(abast.medidor as any);
      const datetime = abast.data_abast && abast.hora_abast
        ? new Date(`${abast.data_abast.split('T')[0]}T${abast.hora_abast}`)
        : new Date();

      totalLiters += litragem;

      if (vehicleKey && !isNaN(medidor)) {
        if (!vehicleMedidorHistory[vehicleKey]) {
          vehicleMedidorHistory[vehicleKey] = [];
        }
        vehicleMedidorHistory[vehicleKey].push({ datetime, medidor });
      }
    });

    for (const vehicleKey in vehicleMedidorHistory) {
      const entries = vehicleMedidorHistory[vehicleKey];
      entries.sort((a, b) => a.datetime.getTime() - b.datetime.getTime());

      let previousMedidorValid: number | null = null;

      for (let i = 0; i < entries.length; i++) {
        const currentEntry = entries[i];
        if (!isNaN(currentEntry.medidor)) {
          if (previousMedidorValid !== null) {
            const kmDriven = currentEntry.medidor - previousMedidorValid;
            if (kmDriven > 0) totalKm += kmDriven;
          }
          previousMedidorValid = currentEntry.medidor;
        }
      }
    }

    const avgConsumption = totalLiters > 0 ? totalKm / totalLiters : 0;
    return { totalLiters, totalKm, avgConsumption };
  };

  const calculateLitragemPorCC = (abastecimentos: Abastecimento[]) => {
    const litragemPorCC: { [key: string]: number } = {};

    abastecimentos.forEach(abast => {
      const cc = abast.cc || 'Sem CC';
      const litragem = parseFloat(abast.litragem as any) || 0;
      litragemPorCC[cc] = (litragemPorCC[cc] || 0) + litragem;
    });

    return Object.entries(litragemPorCC)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([cc, litros]) => ({ cc, litros }));
  };

  const calculateDailyFuelConsumption = (abastecimentos: Abastecimento[]) => {
    const vehicleDailyData: { [key: string]: { [key: string]: { km_driven: number; liters_consumed: number } } } = {};
    const groupedByVehicle: { [key: string]: { datetime: Date; date: string; medidor: number; litragem: number }[] } = {};

    abastecimentos.forEach(abast => {
      const vehicleKey = abast.placa || abast.frota;
      if (!vehicleKey) return;

      groupedByVehicle[vehicleKey] = groupedByVehicle[vehicleKey] || [];
      const datetime = abast.data_abast && abast.hora_abast
        ? new Date(`${abast.data_abast.split('T')[0]}T${abast.hora_abast}`)
        : new Date();

      groupedByVehicle[vehicleKey].push({
        datetime,
        date: abast.data_abast.split('T')[0],
        medidor: parseFloat(abast.medidor as any),
        litragem: parseFloat(abast.litragem as any)
      });
    });

    for (const vehicleKey in groupedByVehicle) {
      const entries = groupedByVehicle[vehicleKey];
      entries.sort((a, b) => a.datetime.getTime() - b.datetime.getTime());

      let previousMedidorValid: number | null = null;
      if (!vehicleDailyData[vehicleKey]) {
        vehicleDailyData[vehicleKey] = {};
      }

      for (let i = 0; i < entries.length; i++) {
        const currentEntry = entries[i];
        const currentDate = currentEntry.date;

        if (!vehicleDailyData[vehicleKey][currentDate]) {
          vehicleDailyData[vehicleKey][currentDate] = { km_driven: 0, liters_consumed: 0 };
        }

        if (!isNaN(currentEntry.medidor)) {
          if (previousMedidorValid !== null) {
            const kmDriven = currentEntry.medidor - previousMedidorValid;
            if (kmDriven > 0 && !isNaN(currentEntry.litragem) && currentEntry.litragem > 0) {
              vehicleDailyData[vehicleKey][currentDate].km_driven += kmDriven;
              vehicleDailyData[vehicleKey][currentDate].liters_consumed += currentEntry.litragem;
            }
          }
          previousMedidorValid = currentEntry.medidor;
        }
      }
    }

    const chartSeries = [];
    const uniqueDates = [...new Set(abastecimentos.map(abast => abast.data_abast.split('T')[0]))]
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    for (const vehicleKey in vehicleDailyData) {
      const dataPoints = uniqueDates.map(date => {
        const dailyStats = vehicleDailyData[vehicleKey][date];
        let kmPerLiter = null;

        if (dailyStats && dailyStats.liters_consumed > 0) {
          kmPerLiter = dailyStats.km_driven / dailyStats.liters_consumed;
        }

        return {
          x: new Date(date).getTime(),
          y: kmPerLiter ? parseFloat(kmPerLiter.toFixed(2)) : null
        };
      });

      chartSeries.push({ name: vehicleKey, data: dataPoints });
    }

    return chartSeries;
  };

  const calculateLitragemPorCombustivel = (abastecimentos: Abastecimento[]) => {
    const litragemPorCombustivel: { [key: string]: number } = {};

    abastecimentos.forEach(abast => {
      const combustivel = abast.combustivel || 'N/A';
      const litragem = parseFloat(abast.litragem as any) || 0;
      litragemPorCombustivel[combustivel] = (litragemPorCombustivel[combustivel] || 0) + litragem;
    });

    return Object.entries(litragemPorCombustivel);
  };

  const calculateConsumoPorFrota = (abastecimentos: Abastecimento[]) => {
    const consumoPorFrota: { [key: string]: number } = {};

    abastecimentos.forEach(abast => {
      const frota = abast.frota || 'N/A';
      const litragem = parseFloat(abast.litragem as any) || 0;
      consumoPorFrota[frota] = (consumoPorFrota[frota] || 0) + litragem;
    });

    return Object.entries(consumoPorFrota)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  };

  const calculateAbastecimentosPorProcedimento = (abastecimentos: Abastecimento[]) => {
    const abastecimentosPorProcedimento: { [key: string]: number } = {};

    abastecimentos.forEach(abast => {
      const procedimento = abast.tipo_procedimento || 'N/A';
      abastecimentosPorProcedimento[procedimento] = (abastecimentosPorProcedimento[procedimento] || 0) + 1;
    });

    return Object.entries(abastecimentosPorProcedimento);
  };

  const generateCharts = (abastecimentos: Abastecimento[]) => {
    destroyCharts();

    const litragemDiaria: { [key: string]: number } = {};
    const abastecimentosPorDia: { [key: string]: number } = {};
    const abastecimentosPorComboista: { [key: string]: number } = {};

    abastecimentos.forEach(abast => {
      const litragem = parseFloat(abast.litragem as any) || 0;

      if (abast.data_abast) {
        const data = abast.data_abast.split('T')[0];
        litragemDiaria[data] = (litragemDiaria[data] || 0) + litragem;
        abastecimentosPorDia[data] = (abastecimentosPorDia[data] || 0) + 1;
      }

      const comboistaId = abast.comboista?.toString() || 'N/A';
      const comboistaName = comboistaNames[comboistaId] || comboistaId;
      abastecimentosPorComboista[comboistaName] = (abastecimentosPorComboista[comboistaName] || 0) + 1;
    });

    const consumptionAnalysisDaily = calculateDailyFuelConsumption(abastecimentos);
    const litragemPorCC = calculateLitragemPorCC(abastecimentos);
    const litragemPorCombustivel = calculateLitragemPorCombustivel(abastecimentos);
    const consumoPorFrota = calculateConsumoPorFrota(abastecimentos);
    const abastecimentosPorProcedimento = calculateAbastecimentosPorProcedimento(abastecimentos);

    const comboistaChartData = Object.entries(abastecimentosPorComboista)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([comboista, count]) => ({ comboista, count }));

    const totalFrotas = new Set(abastecimentos.map(abast => abast.frota).filter(f => f));
    const overallMetrics = getMetricsForAbastecimentos(abastecimentos);

    const litragemDiariaChartData = Object.entries(litragemDiaria)
      .map(([date, litros]) => ({ x: date, y: litros }))
      .sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime());

    const abastecimentosPorDiaChartData = Object.entries(abastecimentosPorDia)
      .map(([date, count]) => ({ x: date, y: count }))
      .sort((a, b) => new Date(a.x).getTime() - new Date(b.x).getTime());

    renderCharts(
      litragemDiariaChartData,
      consumptionAnalysisDaily,
      abastecimentosPorDiaChartData,
      litragemPorCC,
      comboistaChartData,
      litragemPorCombustivel,
      consumoPorFrota,
      abastecimentosPorProcedimento
    );

    const updateCard = (id: string, value: string) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    };

    updateCard('total-abastecimentos', abastecimentos.length.toLocaleString('pt-BR'));
    updateCard('total-litros', `${formatNumberWithCommas(overallMetrics.totalLiters)} L`);
    updateCard('total-frotas', totalFrotas.size.toString());
    updateCard('avg-consumption-overall', `${overallMetrics.avgConsumption.toFixed(2)} km/L`);
    updateCard('total-km-rodado', `${formatNumberWithCommas(overallMetrics.totalKm)} km`);

    const showFilteredVehicleDetails = frota || placa;
    const chartConsumoDiarioCard = document.getElementById('chartConsumoDiarioCard') as HTMLElement;
    const totalKmRodadoCard = document.getElementById('totalKmRodadoCard') as HTMLElement;

    if (chartConsumoDiarioCard) chartConsumoDiarioCard.style.display = showFilteredVehicleDetails ? 'flex' : 'none';
    if (totalKmRodadoCard) totalKmRodadoCard.style.display = showFilteredVehicleDetails ? 'flex' : 'none';
  };

  const displayNoChartDataMessage = (chartId: string, message: string) => {
    const chartContainer = document.querySelector(`#${chartId}`) as HTMLElement;
    if (chartContainer) {
      chartContainer.innerHTML = `<div class="flex items-center justify-center h-full text-center text-muted-foreground">${message}</div>`;
    }
  };

  const renderCharts = (
    litragemData: any[],
    consumptionAnalysisDailyData: any[],
    abastecimentosPorDiaData: any[],
    litragemPorCCData: any[],
    comboistaChartData: any[],
    litragemPorCombustivelData: any[],
    consumoPorFrotaData: any[],
    abastecimentosPorProcedimentoData: any[]
  ) => {
    // Gráfico de Litragem Diária
    if (litragemData.length > 0) {
      if (chartLitragemRef.current) chartLitragemRef.current.destroy();

      chartLitragemRef.current = new ApexCharts(document.querySelector("#chartLitragem")!, {
        series: [{ name: "Litros", data: litragemData }],
        chart: { height: '100%', type: 'line', zoom: { enabled: false }, toolbar: { show: false } },
        colors: [CHART_COLORS[0]],
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 3 },
        markers: { size: 5 },
        xaxis: { type: 'datetime', labels: { style: { colors: '#777', fontSize: '12px' } } },
        yaxis: { show: false, title: { text: 'Litros', style: { color: '#777', fontSize: '12px' } } },
        grid: { borderColor: '#f1f3f4' },
        tooltip: { x: { format: 'dd MMM yyyy' }, y: { formatter: val => (val as number).toFixed(0) + " litros" } }
      });

      chartLitragemRef.current.render();
    } else {
      displayNoChartDataMessage('chartLitragem', 'Não há dados de litragem para o período selecionado.');
    }

    // Gráfico de Consumo Diário
    const hasConsumptionData = consumptionAnalysisDailyData.some(s => s.data && s.data.some((d: any) => d.y !== null));

    if (hasConsumptionData) {
      if (chartConsumoDiarioRef.current) chartConsumoDiarioRef.current.destroy();

      chartConsumoDiarioRef.current = new ApexCharts(document.querySelector("#chartConsumoDiario")!, {
        series: consumptionAnalysisDailyData,
        chart: { height: '100%', type: 'line', zoom: { enabled: false }, toolbar: { show: false } },
        colors: CHART_COLORS,
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 3 },
        markers: { size: 5 },
        xaxis: { type: 'datetime', labels: { style: { colors: '#777', fontSize: '12px' } } },
        yaxis: {
          show: false,
          title: { text: 'Consumo (km/L)', style: { color: '#777', fontSize: '12px' } },
          labels: {
            formatter: val => val ? (val as number).toFixed(2) : 'N/A',
            style: { colors: '#777', fontSize: '12px' }
          }
        },
        grid: { borderColor: '#f1f3f4' },
        tooltip: {
          x: { format: 'dd MMM yyyy' },
          y: { formatter: val => val ? (val as number).toFixed(2) + " km/L" : 'N/A' }
        }
      });

      chartConsumoDiarioRef.current.render();
    } else {
      displayNoChartDataMessage('chartConsumoDiario', 'Não há dados de consumo para os filtros de veículo aplicados.');
    }

    // Gráfico de Abastecimentos Diários
    if (abastecimentosPorDiaData.length > 0) {
      if (chartAbastecimentosPorDiaRef.current) chartAbastecimentosPorDiaRef.current.destroy();

      chartAbastecimentosPorDiaRef.current = new ApexCharts(document.querySelector("#chartAbastecimentosPorDia")!, {
        series: [{ name: "Abastecimentos", data: abastecimentosPorDiaData }],
        chart: { height: '100%', type: 'line', zoom: { enabled: false }, toolbar: { show: false } },
        colors: [CHART_COLORS[2]],
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 3 },
        markers: { size: 5 },
        xaxis: { type: 'datetime', labels: { style: { colors: '#777', fontSize: '12px' } } },
        yaxis: {
          show: false,
          title: { text: 'Número de Abastecimentos', style: { color: '#777', fontSize: '12px' } },
          labels: {
            formatter: val => (val as number).toFixed(0),
            style: { colors: '#777', fontSize: '12px' }
          }
        },
        grid: { borderColor: '#f1f3f4' },
        tooltip: {
          x: { format: 'dd MMM yyyy' },
          y: { formatter: val => (val as number).toFixed(0) + " abastecimentos" }
        }
      });

      chartAbastecimentosPorDiaRef.current.render();
    } else {
      displayNoChartDataMessage('chartAbastecimentosPorDia', 'Não há dados de abastecimentos diários para o período selecionado.');
    }

    // Gráfico de Litragem por CC
    if (litragemPorCCData.length > 0) {
      if (chartLitragemPorCCRef.current) chartLitragemPorCCRef.current.destroy();

      chartLitragemPorCCRef.current = new ApexCharts(document.querySelector("#chartLitragemPorCC")!, {
        series: [{ name: 'Litros', data: litragemPorCCData.map(item => item.litros) }],
        chart: { type: 'bar', height: '100%', toolbar: { show: false } },
        plotOptions: { bar: { horizontal: false, columnWidth: '70%', endingShape: 'rounded' } },
        dataLabels: {
          enabled: true,
          formatter: val => (val as number).toFixed(0),
          style: { colors: ['#fff'] }
        },
        xaxis: {
          categories: litragemPorCCData.map(item => item.cc),
          labels: { style: { colors: '#777', fontSize: '12px' } }
        },
        yaxis: {
          show: false,
          title: { text: 'Litragem (L)', style: { color: '#777', fontSize: '12px' } },
          labels: { show: false, style: { colors: '#777', fontSize: '12px' } }
        },
        colors: CHART_COLORS,
        grid: { borderColor: '#f1f3f4' },
        tooltip: { y: { formatter: val => (val as number).toFixed(0) + " litros" } }
      });

      chartLitragemPorCCRef.current.render();
    } else {
      displayNoChartDataMessage('chartLitragemPorCC', 'Não há dados de litragem por Centro de Custo para o período selecionado.');
    }

    // Gráfico de Abastecimentos por Comboista
    if (comboistaChartData.length > 0) {
      if (chartAbastecimentosPorComboistaRef.current) chartAbastecimentosPorComboistaRef.current.destroy();

      chartAbastecimentosPorComboistaRef.current = new ApexCharts(document.querySelector("#chartAbastecimentosPorComboista")!, {
        series: comboistaChartData.map(item => item.count),
        chart: { type: 'donut', height: '100%', toolbar: { show: false } },
        labels: comboistaChartData.map(item => item.comboista),
        responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: 'bottom' } } }],
        colors: CHART_COLORS,
        legend: { show: true, position: 'bottom' },
        tooltip: { y: { formatter: val => `${val} abastecimentos` } }
      });

      chartAbastecimentosPorComboistaRef.current.render();
    } else {
      displayNoChartDataMessage('chartAbastecimentosPorComboista', 'Não há dados de abastecimentos por Comboista para o período selecionado.');
    }

    // Gráfico de Litragem por Combustível
    if (litragemPorCombustivelData.length > 0) {
      if (chartLitragemPorCombustivelRef.current) chartLitragemPorCombustivelRef.current.destroy();

      chartLitragemPorCombustivelRef.current = new ApexCharts(document.querySelector("#chartLitragemPorCombustivel")!, {
        series: litragemPorCombustivelData.map(item => item[1]),
        chart: { type: 'pie', height: '100%', toolbar: { show: false } },
        labels: litragemPorCombustivelData.map(item => item[0]),
        responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: 'bottom' } } }],
        colors: CHART_COLORS,
        tooltip: { y: { formatter: val => `${(val as number).toFixed(2)} L` } }
      });

      chartLitragemPorCombustivelRef.current.render();
    } else {
      displayNoChartDataMessage('chartLitragemPorCombustivel', 'Não há dados de litragem por tipo de combustível.');
    }

    // Gráfico de Consumo por Frota
    if (consumoPorFrotaData.length > 0) {
      if (chartConsumoPorFrotaRef.current) chartConsumoPorFrotaRef.current.destroy();

      chartConsumoPorFrotaRef.current = new ApexCharts(document.querySelector("#chartConsumoPorFrota")!, {
        series: [{ name: 'Litros', data: consumoPorFrotaData.map(item => item[1]) }],
        chart: { type: 'bar', height: '100%', toolbar: { show: false } },
        plotOptions: { bar: { horizontal: false, columnWidth: '70%', endingShape: 'rounded' } },
        dataLabels: {
          enabled: true,
          formatter: val => (val as number).toFixed(0),
          style: { colors: ['#fff'] }
        },
        xaxis: {
          categories: consumoPorFrotaData.map(item => item[0]),
          labels: { style: { colors: '#777', fontSize: '12px' } }
        },
        yaxis: {
          show: false,
          title: { text: 'Litragem (L)', style: { color: '#777', fontSize: '12px' } },
          labels: { show: false, style: { colors: '#777', fontSize: '12px' } }
        },
        colors: CHART_COLORS,
        grid: { borderColor: '#f1f3f4' },
        tooltip: { y: { formatter: val => (val as number).toFixed(0) + " litros" } }
      });

      chartConsumoPorFrotaRef.current.render();
    } else {
      displayNoChartDataMessage('chartConsumoPorFrota', 'Não há dados de consumo por frota.');
    }

    // Gráfico de Abastecimentos por Procedimento
    if (abastecimentosPorProcedimentoData.length > 0) {
      if (chartAbastecimentosPorProcedimentoRef.current) chartAbastecimentosPorProcedimentoRef.current.destroy();

      chartAbastecimentosPorProcedimentoRef.current = new ApexCharts(document.querySelector("#chartAbastecimentosPorProcedimento")!, {
        series: abastecimentosPorProcedimentoData.map(item => item[1]),
        chart: { type: 'pie', height: '100%', toolbar: { show: false } },
        labels: abastecimentosPorProcedimentoData.map(item => item[0]),
        responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: 'bottom' } } }],
        colors: CHART_COLORS,
        tooltip: { y: { formatter: val => `${val} abastecimentos` } }
      });

      chartAbastecimentosPorProcedimentoRef.current.render();
    } else {
      displayNoChartDataMessage('chartAbastecimentosPorProcedimento', 'Não há dados de abastecimentos por procedimento.');
    }
  };

  if (permissionLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-full">
          <p>Carregando permissões...</p>
        </div>
      </MainLayout>
    );
  }

  if (!canAccess) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-full">
          <p>Você não tem permissão para visualizar esta página.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-8">
        {!authToken ? (
            <div className="flex flex-col items-center justify-center">
              <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold mb-4">Carregando...</h2>
                <p className="mt-4 text-center text-gray-500">Autenticando automaticamente, por favor aguarde.</p>
              </div>
            </div>
        ) : (
          <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Dashboard de Abastecimento</h1>

            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Filtros de Busca</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex flex-col">
                  <label htmlFor="startDate" className="text-sm font-medium text-gray-600">Data Inicial</label>
                  <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="endDate" className="text-sm font-medium text-gray-600">Data Final</label>
                  <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="comboista" className="text-sm font-medium text-gray-600">Comboista</label>
                  <input
                    id="comboista"
                    type="text"
                    value={comboista}
                    onChange={(e) => setComboista(e.target.value)}
                    className="mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Nome do Comboista"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="frota" className="text-sm font-medium text-gray-600">Frota</label>
                  <input
                    id="frota"
                    type="text"
                    value={frota}
                    onChange={(e) => setFrota(e.target.value)}
                    className="mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="ID da Frota"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="placa" className="text-sm font-medium text-gray-600">Placa</label>
                  <input
                    id="placa"
                    type="text"
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value)}
                    className="mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Placa do Veículo"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="cc" className="text-sm font-medium text-gray-600">Centro de Custo</label>
                  <input
                    id="cc"
                    type="text"
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                    className="mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Código do Centro de Custo"
                  />
                </div>
              </div>
              <button
                onClick={fetchAndFilterAbastecimentos}
                className="mt-6 w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors font-semibold"
              >
                Buscar
              </button>
              <p className="mt-4 text-center text-sm text-gray-500">{dataStatus}</p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
              <button
                onClick={() => {
                  setShowDashboard(!showDashboard);
                  setShowComparative(false);
                }}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
              >
                {showDashboard ? 'Ocultar Gráficos' : 'Mostrar Gráficos'}
              </button>
              <button
                onClick={() => {
                  setShowComparative(!showComparative);
                  setShowDashboard(false);
                }}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
              >
                {showComparative ? 'Ocultar Comparativo' : 'Comparativo de Frotas/Placas'}
              </button>
              <button
                onClick={handleExportToExcel}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
              >
                Exportar para Excel
              </button>
            </div>

            {showDashboard && (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                  <div className="bg-white shadow-md rounded-lg p-4 text-center">
                    <h3 className="text-sm font-medium text-gray-500">Total de Abastecimentos</h3>
                    <p id="total-abastecimentos" className="text-2xl font-bold text-gray-800 mt-2">0</p>
                  </div>
                  <div className="bg-white shadow-md rounded-lg p-4 text-center">
                    <h3 className="text-sm font-medium text-gray-500">Total de Litros</h3>
                    <p id="total-litros" className="text-2xl font-bold text-gray-800 mt-2">0 L</p>
                  </div>
                  <div className="bg-white shadow-md rounded-lg p-4 text-center">
                    <h3 className="text-sm font-medium text-gray-500">Total de Frotas</h3>
                    <p id="total-frotas" className="text-2xl font-bold text-gray-800 mt-2">0</p>
                  </div>
                  <div id="avg-consumption-card" className="bg-white shadow-md rounded-lg p-4 text-center">
                    <h3 className="text-sm font-medium text-gray-500">Consumo Médio</h3>
                    <p id="avg-consumption-overall" className="text-2xl font-bold text-gray-800 mt-2">0.00 km/L</p>
                  </div>
                  <div id="totalKmRodadoCard" className="bg-white shadow-md rounded-lg p-4 text-center" style={{ display: 'none' }}>
                    <h3 className="text-sm font-medium text-gray-500">Total de KM Rodados</h3>
                    <p id="total-km-rodado" className="text-2xl font-bold text-gray-800 mt-2">0 km</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center justify-center h-[400px]">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Litragem Diária</h3>
                    <div id="chartLitragem" className="w-full flex-grow"></div>
                  </div>
                  <div id="chartConsumoDiarioCard" className="bg-white shadow-md rounded-lg p-6 flex-col items-center justify-center h-[400px]">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Consumo Diário por Veículo (km/L)</h3>
                    <div id="chartConsumoDiario" className="w-full flex-grow"></div>
                  </div>
                  <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center justify-center h-[400px]">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Abastecimentos Diários</h3>
                    <div id="chartAbastecimentosPorDia" className="w-full flex-grow"></div>
                  </div>
                  <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center justify-center h-[400px]">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Top 10 Centros de Custo (em Litros)</h3>
                    <div id="chartLitragemPorCC" className="w-full flex-grow"></div>
                  </div>
                  <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center justify-center h-[400px]">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Litragem por Tipo de Combustível</h3>
                    <div id="chartLitragemPorCombustivel" className="w-full flex-grow"></div>
                  </div>
                  <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center justify-center h-[400px]">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Consumo por Frota (Top 10)</h3>
                    <div id="chartConsumoPorFrota" className="w-full flex-grow"></div>
                  </div>
                  <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center justify-center h-[400px]">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Abastecimentos por Tipo de Procedimento</h3>
                    <div id="chartAbastecimentosPorProcedimento" className="w-full flex-grow"></div>
                  </div>
                  <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center justify-center h-[400px]">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Abastecimentos por Comboista</h3>
                    <div id="chartAbastecimentosPorComboista" className="w-full flex-grow"></div>
                  </div>
                </div>

                <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-gray-700">Detalhes dos Abastecimentos</h2>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 mr-2">Mostrar</label>
                      <select
                        value={limit}
                        onChange={(e) => setLimit(parseInt(e.target.value))}
                        className="px-2 py-1 border rounded-lg"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                      <span className="text-sm text-gray-500 ml-2">entradas</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Identificador</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo Procedimento</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Abastecimento</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora Abastecimento</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comboista</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operação</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frota</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medidor</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medidor Via Entrada</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medidor Unidade</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bico</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Combustível</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Litragem</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Encerrante Final</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Foto Verificada</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Identificação do Ponto</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medidor Ant. Data</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medidor Ant. Valor</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placa</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Centro de Custo (CC)</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registro Editado Em</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registrado Editado Por</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frota Tag</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comboista Tag</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Integração</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredAbastecimentos.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map((abast) => (
                          <tr key={abast.identificador}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{abast.identificador}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{abast.tipo_procedimento}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDateToDDMMYYYY(abast.data_abast)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{abast.hora_abast}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comboistaNames[abast.comboista?.toString() || ''] || abast.comboista}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{abast.operacao}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{abast.frota}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{abast.medidor}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{abast.medidor_via_entrada}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{abast.medidor_unidade}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{abast.bico}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{abast.combustivel}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumberWithCommas(abast.litragem)} L</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{abast.encerrante_fim}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{abast.foto_verificada ? 'Sim' : 'Não'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{abast.identificacao_do_ponto}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{abast.medidor_anterior_data ? formatDateToDDMMYYYY(abast.medidor_anterior_data) : 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{abast.medidor_anterior_valor}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{abast.placa}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{abast.cc}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{abast.registro_editado_em}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{abast.registrado_editado_por}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{abast.frota_tag}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{abast.comboista_tag}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{abast.data_integracao}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-gray-500">
                      Mostrando {(currentPage - 1) * rowsPerPage + 1} a {Math.min(currentPage * rowsPerPage, filteredAbastecimentos.length)} de {filteredAbastecimentos.length} entradas
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50"
                      >
                        Anterior
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50"
                      >
                        Próximo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showComparative && (
              <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                <div className="mb-4">
                  <label className="text-sm font-medium text-gray-600 mr-4">Comparar por:</label>
                  <label className="inline-flex items-center mr-4">
                    <input
                      type="radio"
                      className="form-radio"
                      checked={comparativeField === 'frota'}
                      onChange={() => setComparativeField('frota')}
                    />
                    <span className="ml-2">Frota</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      checked={comparativeField === 'placa'}
                      onChange={() => setComparativeField('placa')}
                    />
                    <span className="ml-2">Placa</span>
                  </label>
                </div>

                <h2 className="text-xl font-semibold mb-4 text-gray-700">
                  Comparativo de Litragem por {comparativeField === 'frota' ? 'Frota' : 'Placa'}
                </h2>

                <div className="flex gap-4 mb-4 items-end">
                  <div className="flex flex-col flex-1">
                    <label className="text-sm font-medium text-gray-600">
                      {comparativeField === 'frota' ? 'Frota 1' : 'Placa 1'}
                    </label>
                    <input
                      type="text"
                      value={frotaComparativa1}
                      onChange={(e) => setFrotaComparativa1(e.target.value)}
                      placeholder={comparativeField === 'frota' ? 'Nome da Frota 1' : 'Placa do Veículo 1'}
                      className="mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex flex-col flex-1">
                    <label className="text-sm font-medium text-gray-600">
                      {comparativeField === 'frota' ? 'Frota 2' : 'Placa 2'}
                    </label>
                    <input
                      type="text"
                      value={frotaComparativa2}
                      onChange={(e) => setFrotaComparativa2(e.target.value)}
                      placeholder={comparativeField === 'frota' ? 'Nome da Frota 2' : 'Placa do Veículo 2'}
                      className="mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleCompareFrotas}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
                  >
                    Compara
                  </button>
                </div>

                <div id="comparative-chart" ref={comparativeChartRef} className="w-full h-[400px]">
                  {comparativeData.length === 0 && (
                    <div className="flex items-center justify-center h-full text-center text-gray-500">
                      Selecione duas {comparativeField === 'frota' ? 'frotas' : 'placas'} para comparar e clique em "Comparar".
                    </div>
                  )}
                </div>

                <h2 className="text-xl font-semibold mb-4 mt-8 text-gray-700">
                  Comparativo de Consumo Médio (km/L) por {comparativeField === 'frota' ? 'Frota' : 'Placa'}
                </h2>

                <div className="flex gap-4 mb-4 items-end">
                  <div className="flex flex-col flex-1">
                    <label className="text-sm font-medium text-gray-600">
                      {comparativeField === 'frota' ? 'Frota 1' : 'Placa 1'}
                    </label>
                    <input
                      type="text"
                      value={frotaConsumo1}
                      onChange={(e) => setFrotaConsumo1(e.target.value)}
                      placeholder={comparativeField === 'frota' ? 'Nome da Frota 1' : 'Placa do Veículo 1'}
                      className="mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex flex-col flex-1">
                    <label className="text-sm font-medium text-gray-600">
                      {comparativeField === 'frota' ? 'Frota 2' : 'Placa 2'}
                    </label>
                    <input
                      type="text"
                      value={frotaConsumo2}
                      onChange={(e) => setFrotaConsumo2(e.target.value)}
                      placeholder={comparativeField === 'frota' ? 'Nome da Frota 2' : 'Placa do Veículo 2'}
                      className="mt-1 px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleCompareConsumption}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
                  >
                    Comparar Consumo
                  </button>
                </div>

                <div id="comparative-consumption-chart" ref={comparativeConsumptionChartRef} className="w-full h-[400px]">
                  {comparativeConsumptionData.length === 0 && (
                    <div className="flex items-center justify-center h-full text-center text-gray-500">
                      Selecione duas {comparativeField === 'frota' ? 'frotas' : 'placas'} para comparar e clique em "Comparar Consumo".
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AbastecimentoPage;