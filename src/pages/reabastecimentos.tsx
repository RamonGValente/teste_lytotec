import React, { useState, useEffect, useRef } from 'react';
import ApexCharts from 'apexcharts';

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

const LOCAL_PROXY_BASE_URL = "http://127.0.0.1:5000/api";
const AUTH_ENDPOINT = `${LOCAL_PROXY_BASE_URL}/authenticate`;
const ABASTECIMENTOS_ENDPOINT = `${LOCAL_PROXY_BASE_URL}/abastecimentos`;

// Mapeamento de comboistas
const comboistaNames: { [key: string]: string } = {};

/**
 * Formata um número inteiro com separadores de milhar (ponto).
 * Exemplo: 1000000.5 -> "1.000.000"
 * @param {number} number - O número a ser formatado.
 * @returns {string} O número formatado como string.
 */
function formatNumberWithCommas(number: number | null | undefined): string {
  if (isNaN(Number(number)) || number === null || typeof number === 'undefined') return '0';
  const integer = Math.round(number);
  return integer.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Formata um objeto Date para o formato "YYYY-MM-DD".
 * @param {Date} date - O objeto Date a ser formatado.
 * @returns {string} A data formatada como string.
 */
function formatDate(date: Date): string {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  return [year, month, day].join('-');
}

const App: React.FC = () => {
  const [username, setUsername] = useState('testekorth@lytoranea');
  const [password, setPassword] = useState('0123456789');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [allAbastecimentos, setAllAbastecimentos] = useState<Abastecimento[]>([]);
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
  const [showComparative, setShowComparative] = useState(false);
  const [frota1Compare, setFrota1Compare] = useState('');
  const [frota2Compare, setFrota2Compare] = useState('');
  const [comparativeStatus, setComparativeStatus] = useState('');

  const chartLitragemRef = useRef<ApexCharts | null>(null);
  const chartConsumoDiarioRef = useRef<ApexCharts | null>(null);
  const chartAbastecimentosPorDiaRef = useRef<ApexCharts | null>(null);
  const chartLitragemPorCCRef = useRef<ApexCharts | null>(null);
  const chartAbastecimentosPorComboistaRef = useRef<ApexCharts | null>(null);
  const chartComparativoFrotasRef = useRef<ApexCharts | null>(null);

  useEffect(() => {
    setRowsPerPage(limit);
    setCurrentPage(1);
  }, [limit]);

  useEffect(() => {
    if (filteredAbastecimentos.length > 0) {
      displayPaginatedData(filteredAbastecimentos, currentPage, rowsPerPage);
    }
  }, [filteredAbastecimentos, currentPage, rowsPerPage]);

  const showMessage = (msg: string, isErr: boolean = true) => {
    setMessage(msg);
    setIsError(isErr);
  };

  const authenticate = async () => {
    showMessage('Autenticando...', false);
    try {
      const response = await fetch(AUTH_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ login: username, senha: password })
      });
      const data = await response.json();
      if (response.ok && data.dados?.token) {
        setAuthToken(data.dados.token);
        showMessage('Login bem-sucedido!', false);
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 90);
        setStartDate(formatDate(startDate));
        setEndDate(formatDate(endDate));
        return true;
      } else {
        const errorMessage = data.erros?.join(', ') || 'Credenciais inválidas ou erro desconhecido.';
        showMessage(`Falha no login: ${errorMessage}`);
        return false;
      }
    } catch (error: any) {
      showMessage(`Erro de rede ao autenticar: ${error.message}`);
      return false;
    }
  };

  const fetchAndFilterAbastecimentos = async () => {
    if (!authToken) {
      showMessage('Token de autenticação não encontrado. Faça login novamente.');
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
        setAllAbastecimentos(data.dados);

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
          generateCharts(filtered);
        } else {
          setDataStatus('Nenhum abastecimento encontrado para os filtros selecionados.');
          setFilteredAbastecimentos([]);
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

  const displayPaginatedData = (data: Abastecimento[], page: number, limit: number) => {
    const startIndex = (page - 1) * limit;
    const endIndex = Math.min(startIndex + limit, data.length);
    const paginatedData = data.slice(startIndex, endIndex);
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

      vehicleDailyData[vehicleKey] = {};
      let previousMedidorValid: number | null = null;

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

  const generateCharts = (abastecimentos: Abastecimento[]) => {
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
      comboistaChartData
    );
    
    // Update summary cards
    (document.getElementById('total-abastecimentos') as HTMLElement).textContent = abastecimentos.length.toLocaleString('pt-BR');
    (document.getElementById('total-litros') as HTMLElement).textContent = `${formatNumberWithCommas(overallMetrics.totalLiters)} L`;
    (document.getElementById('total-frotas') as HTMLElement).textContent = totalFrotas.size.toString();
    (document.getElementById('avg-consumption-overall') as HTMLElement).textContent = `${overallMetrics.avgConsumption.toFixed(2)} km/L`;
    (document.getElementById('total-km-rodado') as HTMLElement).textContent = `${formatNumberWithCommas(overallMetrics.totalKm)} km`;

    // Show/hide specific cards
    const showFilteredVehicleDetails = frota || placa;
    (document.getElementById('chartConsumoDiarioCard') as HTMLElement).style.display = showFilteredVehicleDetails ? 'flex' : 'none';
    (document.getElementById('totalKmRodadoCard') as HTMLElement).style.display = showFilteredVehicleDetails ? 'flex' : 'none';
  };

  const renderCharts = (
    litragemData: any[],
    consumptionAnalysisDailyData: any[],
    abastecimentosPorDiaData: any[],
    litragemPorCCData: any[],
    comboistaChartData: any[]
  ) => {
    [chartLitragemRef, chartConsumoDiarioRef, chartAbastecimentosPorDiaRef, 
      chartLitragemPorCCRef, chartAbastecimentosPorComboistaRef].forEach(chartRef => {
        if (chartRef.current) chartRef.current.destroy();
    });

    const blueColors = ['#007bff', '#4285F4', '#1E90FF', '#6495ED', '#87CEEB', '#ADD8E6', '#4682B4', '#5F9EA0'];

    if (litragemData.length > 0) {
      chartLitragemRef.current = new ApexCharts(document.querySelector("#chartLitragem")!, {
        series: [{ name: "Litros", data: litragemData }],
        chart: { height: '100%', type: 'line', zoom: { enabled: false }, toolbar: { show: false } },
        colors: [blueColors[2]],
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 3 },
        markers: { size: 5 },
        xaxis: { type: 'datetime', labels: { style: { colors: '#777', fontSize: '12px' } } },
        yaxis: { title: { text: 'Litros', style: { color: '#777', fontSize: '12px' } }, labels: { style: { colors: '#777', fontSize: '12px' } } },
        grid: { borderColor: '#f1f3f4' },
        tooltip: { x: { format: 'dd MMM yyyy' }, y: { formatter: val => val.toFixed(0) + " litros" } }
      });
      chartLitragemRef.current.render();
    } else {
      displayNoChartDataMessage('chartLitragem', 'Não há dados de litragem para o período selecionado.');
    }
    
    const hasConsumptionData = consumptionAnalysisDailyData.some(s => s.data && s.data.some((d: any) => d.y !== null));
    if (hasConsumptionData) {
      chartConsumoDiarioRef.current = new ApexCharts(document.querySelector("#chartConsumoDiario")!, {
        series: consumptionAnalysisDailyData,
        chart: { height: '100%', type: 'line', zoom: { enabled: false }, toolbar: { show: false } },
        colors: blueColors,
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 3 },
        markers: { size: 5 },
        xaxis: { type: 'datetime', labels: { style: { colors: '#777', fontSize: '12px' } } },
        yaxis: { title: { text: 'Consumo (km/L)', style: { color: '#777', fontSize: '12px' } }, labels: { formatter: val => val ? val.toFixed(2) : 'N/A', style: { colors: '#777', fontSize: '12px' } } },
        grid: { borderColor: '#f1f3f4' },
        tooltip: { x: { format: 'dd MMM yyyy' }, y: { formatter: val => val ? val.toFixed(2) + " km/L" : 'N/A' } }
      });
      chartConsumoDiarioRef.current.render();
    } else {
      displayNoChartDataMessage('chartConsumoDiario', 'Não há dados de consumo para os filtros de veículo aplicados.');
    }

    if (abastecimentosPorDiaData.length > 0) {
      chartAbastecimentosPorDiaRef.current = new ApexCharts(document.querySelector("#chartAbastecimentosPorDia")!, {
        series: [{ name: "Abastecimentos", data: abastecimentosPorDiaData }],
        chart: { height: '100%', type: 'line', zoom: { enabled: false }, toolbar: { show: false } },
        colors: ['#e23030'],
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 3 },
        markers: { size: 5 },
        xaxis: { type: 'datetime', labels: { style: { colors: '#777', fontSize: '12px' } } },
        yaxis: { title: { text: 'Número de Abastecimentos', style: { color: '#777', fontSize: '12px' } }, labels: { formatter: val => val.toFixed(0), style: { colors: '#777', fontSize: '12px' } } },
        grid: { borderColor: '#f1f3f4' },
        tooltip: { x: { format: 'dd MMM yyyy' }, y: { formatter: val => val.toFixed(0) + " abastecimentos" } }
      });
      chartAbastecimentosPorDiaRef.current.render();
    } else {
      displayNoChartDataMessage('chartAbastecimentosPorDia', 'Não há dados de abastecimentos diários para o período selecionado.');
    }

    if (litragemPorCCData.length > 0) {
      chartLitragemPorCCRef.current = new ApexCharts(document.querySelector("#chartLitragemPorCC")!, {
        series: [{ name: 'Litros', data: litragemPorCCData.map(item => item.litros) }],
        chart: { type: 'bar', height: '100%', toolbar: { show: false } },
        plotOptions: { bar: { horizontal: false, columnWidth: '70%', endingShape: 'rounded' } },
        dataLabels: { enabled: true, formatter: val => val.toFixed(0), style: { colors: ['#fff'] } },
        xaxis: {
          categories: litragemPorCCData.map(item => item.cc),
          labels: {
            style: { colors: '#777', fontSize: '12px' },
            rotate: -45,
            rotateAlways: true
          }
        },
        yaxis: {
          title: { text: 'Litros', style: { color: '#777', fontSize: '12px' } },
          labels: { style: { colors: '#777', fontSize: '12px' } }
        },
        colors: ['#F4C50B'],
        tooltip: { y: { formatter: val => val.toFixed(0) + " litros" } }
      });
      chartLitragemPorCCRef.current.render();
    } else {
      displayNoChartDataMessage('chartLitragemPorCC', 'Não há dados de litragem por Centro de Custo.');
    }

    if (comboistaChartData.length > 0) {
      chartAbastecimentosPorComboistaRef.current = new ApexCharts(document.querySelector("#chartAbastecimentosPorComboista")!, {
        series: [{
          name: "Abastecimentos",
          data: comboistaChartData.map(item => item.count)
        }],
        chart: {
          type: 'bar',
          height: '100%',
          toolbar: { show: false }
        },
        plotOptions: {
          bar: {
            horizontal: true,
          }
        },
        colors: ['#4285F4'],
        dataLabels: {
          enabled: true,
          formatter: val => val.toFixed(0),
          style: {
            fontSize: '12px',
            colors: ["#fff"]
          }
        },
        xaxis: {
          categories: comboistaChartData.map(item => item.comboista),
          title: {
            text: 'Número de Abastecimentos',
            style: {
              color: '#777',
              fontSize: '12px'
            }
          },
          labels: {
            style: {
              colors: '#777',
              fontSize: '12px'
            }
          }
        },
        yaxis: {
          labels: {
            style: {
              colors: '#777',
              fontSize: '12px'
            }
          }
        },
        tooltip: {
          y: {
            formatter: val => val + " abastecimentos"
          }
        }
      });
      chartAbastecimentosPorComboistaRef.current.render();
    } else {
      displayNoChartDataMessage('chartAbastecimentosPorComboista', 'Não há dados de abastecimentos por Comboista.');
    }
  };

  const displayNoChartDataMessage = (elementId: string, message: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = `<div style="text-align: center; padding: 20px; color: #7f8c8d;">${message}</div>`;
    }
  };

  const renderComparativeChart = () => {
    if (chartComparativoFrotasRef.current) chartComparativoFrotasRef.current.destroy();

    const frota1Code = frota1Compare.trim().toUpperCase();
    const frota2Code = frota2Compare.trim().toUpperCase();

    if (!frota1Code && !frota2Code) {
      setComparativeStatus("Por favor, insira pelo menos um código de Frota para comparar.");
      return;
    }

    setComparativeStatus("Gerando comparativo...");

    const dataFrota1 = frota1Code ? allAbastecimentos.filter(abast => abast.frota && abast.frota.toUpperCase() === frota1Code) : [];
    const dataFrota2 = frota2Code ? allAbastecimentos.filter(abast => abast.frota && abast.frota.toUpperCase() === frota2Code) : [];

    const metricsFrota1 = getMetricsForAbastecimentos(dataFrota1);
    const metricsFrota2 = getMetricsForAbastecimentos(dataFrota2);

    const categories = [];
    const seriesLitragem = [];
    const seriesConsumo = [];

    if (frota1Code) {
      categories.push(`Frota ${frota1Code}`);
      seriesLitragem.push(metricsFrota1.totalLiters);
      seriesConsumo.push(metricsFrota1.avgConsumption);
    }
    if (frota2Code) {
      categories.push(`Frota ${frota2Code}`);
      seriesLitragem.push(metricsFrota2.totalLiters);
      seriesConsumo.push(metricsFrota2.avgConsumption);
    }

    if (categories.length === 0) {
      setComparativeStatus("Nenhum dado encontrado para as frotas especificadas nas datas filtradas.");
      return;
    }

    const options = {
      series: [
        { name: 'Litragem Total (L)', data: seriesLitragem },
        { name: 'Consumo Médio (km/L)', data: seriesConsumo }
      ],
      chart: { type: 'bar', height: '100%', toolbar: { show: false } },
      plotOptions: { bar: { horizontal: false, columnWidth: '55%', endingShape: 'rounded' } },
      dataLabels: { enabled: false },
      stroke: { show: true, width: 2, colors: ['transparent'] },
      xaxis: { categories: categories, labels: { style: { colors: '#777', fontSize: '12px' } } },
      yaxis: [
        { title: { text: 'Litragem (L)', style: { color: '#777', fontSize: '12px' } }, labels: { formatter: (val: number) => val.toFixed(0), style: { colors: '#777', fontSize: '12px' } } },
        { opposite: true, title: { text: 'Consumo (km/L)', style: { color: '#777', fontSize: '12px' } }, labels: { formatter: (val: number) => val.toFixed(2), style: { colors: '#777', fontSize: '12px' } } }
      ],
      fill: { opacity: 1 },
      tooltip: { y: { formatter: (val: number, { seriesIndex }: { seriesIndex: number }) => seriesIndex === 0 ? val.toFixed(0) + " litros" : val.toFixed(2) + " km/L" } },
      colors: ['#007bff', '#6495ED'],
      legend: { position: 'top', horizontalAlign: 'right', fontSize: '14px', labels: { colors: '#555' } },
      grid: { borderColor: '#f1f3f4' }
    };

    chartComparativoFrotasRef.current = new ApexCharts(document.querySelector("#chartComparativoFrotas")!, options);
    chartComparativoFrotasRef.current.render();
    setComparativeStatus("Comparativo gerado com sucesso.");
  };

  const logout = () => {
    setAuthToken(null);
    showMessage('Sessão encerrada.', false);
    setUsername('');
    setPassword('');
    setStartDate('');
    setEndDate('');
    setComboista('');
    setFrota('');
    setPlaca('');
    setCc('');
    setLimit(5);
    setAllAbastecimentos([]);
    setFilteredAbastecimentos([]);
    setCurrentPage(1);
    setTotalPages(1);
    setShowDashboard(false);
    setShowComparative(false);
    
    [chartLitragemRef, chartConsumoDiarioRef, chartAbastecimentosPorDiaRef,
      chartLitragemPorCCRef, chartAbastecimentosPorComboistaRef, chartComparativoFrotasRef].forEach(chartRef => {
        if (chartRef.current) chartRef.current.destroy();
    });
  };

  const toggleDashboard = () => {
    setShowDashboard(prev => !prev);
    if (!showDashboard && filteredAbastecimentos.length > 0) {
      generateCharts(filteredAbastecimentos);
    }
  };
  
  const toggleComparativeAnalysis = () => {
    setShowComparative(prev => !prev);
  };
  
  const paginatedData = filteredAbastecimentos.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  return (
    <>
      <style>{`
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; flex-direction: column; color: #333; }
        .container { background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08); width: 100%; max-width: 1200px; box-sizing: border-box; margin-bottom: 20px; transition: all 0.3s ease; }
        #login-form { max-width: 400px; margin: auto; }
        h2, h3 { text-align: center; color: #2c3e50; margin-bottom: 25px; font-size: 1.8em; font-weight: 600; }
        .form-group { margin-bottom: 18px; }
        label { display: block; margin-bottom: 8px; color: #555; font-weight: 500; font-size: 1em; }
        input[type="text"], input[type="password"], input[type="date"], select { width: 100%; padding: 12px 15px; border: 1px solid #e1e5eb; border-radius: 6px; box-sizing: border-box; font-size: 1em; color: #333; background-color: #f9fafb; transition: border-color 0.3s ease, box-shadow 0.3s ease; }
        input[type="text"]:focus, input[type="password"]:focus, input[type="date"]:focus, select:focus { border-color: #3498db; box-shadow: 0 0 0 0.2rem rgba(52, 152, 219, 0.2); outline: none; }
        button { padding: 14px; background-color: #3498db; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1.1em; font-weight: 600; transition: background-color 0.3s ease; width: 100%; }
        button:hover { background-color: #2980b9; }
        #message { text-align: center; margin-top: 20px; font-weight: 500; font-size: 0.9em; }
        .message-error { color: #e74c3c; }
        .message-success { color: #27ae60; }
        #data-display { background-color: #f9fafb; padding: 20px; border-radius: 8px; width: 100%; max-width: 1200px; box-sizing: border-box; display: none; margin-top: 20px; }
        .filter-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .filter-grid .form-group { margin-bottom: 0; }
        .search-button-container { grid-column: 1 / -1; display: flex; justify-content: flex-end; padding-top: 10px; }
        .search-button-container button { min-width: 120px; padding: 10px 15px; font-size: 16px; width: auto; }
        .results-area { margin-top: 20px; border-top: 1px solid #e1e5eb; padding-top: 20px; }
        #data-status { text-align: center; margin: 10px 0; font-weight: 500; }
        #abastecimentos-table-wrapper { width: 100%; overflow-x: auto; border: 1px solid #e1e5eb; border-radius: 5px; background-color: #fff; margin-top: 20px; display: none; }
        #abastecimentos-table { display: grid; grid-template-columns: minmax(180px, 1fr) minmax(150px, 1fr) minmax(130px, 1fr) minmax(100px, 1fr) minmax(180px, 1fr) minmax(150px, 1fr) minmax(120px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(150px, 1fr) minmax(150px, 1fr) minmax(80px, 1fr) minmax(120px, 1fr) minmax(100px, 1fr) minmax(150px, 1fr) minmax(150px, 1fr) minmax(120px, 1fr) minmax(120px, 1fr) minmax(150px, 1fr) minmax(200px, 1fr) minmax(100px, 1fr) minmax(160px, 1fr) minmax(160px, 1fr) minmax(100px, 1fr) minmax(150px, 1fr) minmax(180px, 1fr) minmax(180px, 1fr) minmax(120px, 1fr) minmax(120px, 1fr) minmax(120px, 1fr) minmax(180px, 1fr); width: fit-content; min-width: 100%; }
        .table-header, .table-row { display: contents; }
        .table-header div, .table-cell { padding: 10px 8px; border-bottom: 1px solid #eef2f6; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .table-header div { background-color: #3498db; color: white; font-weight: 600; position: sticky; top: 0; z-index: 1; }
        .table-row:nth-child(even) .table-cell { background-color: #f9fafb; }
        .table-row:nth-child(odd) .table-cell { background-color: #ffffff; }
        .table-cell { font-size: 0.85em; }
        .pagination-controls { display: flex; justify-content: center; align-items: center; margin-top: 20px; gap: 10px; display: none; }
        .pagination-button { padding: 8px 15px; background-color: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; transition: background-color 0.3s ease; width: auto; }
        .pagination-button:hover { background-color: #2980b9; }
        .pagination-button:disabled { background-color: #bdc3c7; cursor: not-allowed; }
        .pagination-info { font-size: 14px; font-weight: 600; color: #333; }
        .page-size-selector { display: flex; align-items: center; gap: 10px; margin-top: 15px; }
        .page-size-selector select { width: auto; padding: 5px; }
        .dashboard-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #e1e5eb; }
        .dashboard-title { font-size: 1.5em; font-weight: 600; color: #2c3e50; }
        .summary-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .summary-card { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05); border-left: 4px solid; transition: transform 0.2s ease; }
        .summary-card:hover { transform: translateY(-3px); }
        .summary-1 { border-left-color: #3498db; }
        .summary-2 { border-left-color: #2ecc71; }
        .summary-3 { border-left-color: #f39c12; }
        .summary-4 { border-left-color: #e23030; }
        .summary-5 { border-left-color: #27ae60; }
        .summary-text h3 { font-size: 20px; font-weight: 600; margin-bottom: 5px; color: #2c3e50; }
        .summary-text p { color: #7f8c8d; font-size: 13px; margin: 0; }
        .charts-container { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px; }
        .chart-card.full-width { grid-column: 1 / -1; }
        @media (max-width: 900px) { .charts-container { grid-template-columns: 1fr; } .chart-card.full-width { grid-column: auto; } }
        .chart-card { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05); height: 350px; display: flex; flex-direction: column; border: 1px solid #e1e5eb; }
        .chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .chart-title { font-size: 16px; font-weight: 600; color: #2c3e50; }
        .chart-content { flex: 1; min-height: 280px; display: flex; align-items: center; justify-content: center; }
        .chart-tabs { display: flex; gap: 10px; margin-bottom: 15px; }
        .tab-btn { background: #ecf0f1; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 13px; transition: all 0.3s ease; }
        .tab-btn.active { background: #3498db; color: white; }
      `}</style>
      
      {authToken ? (
        <div id="data-display" className="container" style={{ display: 'block' }}>
          <div className="dashboard-header">
            <h3>LytoTec-Abastecimentos</h3>
            <button id="toggleDashboard" className="btn" style={{ width: 'auto', padding: '10px 20px' }} onClick={toggleDashboard}>
              {showDashboard ? 'Ocultar Gráficos' : 'Mostrar Gráficos'}
            </button>
          </div>
          <div className="filter-grid">
            <div className="form-group">
              <label htmlFor="startDate">Data Inicial:</label>
              <input type="date" id="startDate" required value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="endDate">Data Final:</label>
              <input type="date" id="endDate" required value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="comboista">Comboista:</label>
              <input type="text" id="comboista" placeholder="Nome do Comboista" value={comboista} onChange={(e) => setComboista(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="frota">Frota:</label>
              <input type="text" id="frota" placeholder="Código da Frota" value={frota} onChange={(e) => setFrota(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="placa">Placa:</label>
              <input type="text" id="placa" placeholder="ABC1234" value={placa} onChange={(e) => setPlaca(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="cc">Centro de Custo (CC):</label>
              <input type="text" id="cc" placeholder="Código do CC" value={cc} onChange={(e) => setCc(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="limit">Resultados por página:</label>
              <select id="limit" value={limit} onChange={(e) => setLimit(parseInt(e.target.value))}>
                <option value="5">5 Linhas</option>
                <option value="10">10 Linhas</option>
                <option value="20">20 Linhas</option>
                <option value="30">30 Linhas</option>
                <option value="50">50 Linhas</option>
              </select>
            </div>
            <div className="search-button-container">
              <button id="searchButton" onClick={fetchAndFilterAbastecimentos}>Buscar</button>
            </div>
          </div>
          
          <div id="dashboard-content" style={{ display: showDashboard ? 'block' : 'none' }}>
            <div className="summary-cards">
              <div className="summary-card summary-1">
                <div className="summary-text">
                  <h3 id="total-abastecimentos">0</h3>
                  <p>Total de Abastecimentos</p>
                </div>
              </div>
              <div className="summary-card summary-2">
                <div className="summary-text">
                  <h3 id="total-litros">0 L</h3>
                  <p>Litros Abastecidos</p>
                </div>
              </div>
              <div className="summary-card summary-3">
                <div className="summary-text">
                  <h3 id="total-frotas">0</h3>
                  <p>Frotas Ativas</p>
                </div>
              </div>
              <div className="summary-card summary-4">
                <div className="summary-text">
                  <h3 id="avg-consumption-overall">0 km/L</h3>
                  <p>Consumo Médio Geral</p>
                </div>
              </div>
              <div className="summary-card summary-5" id="totalKmRodadoCard" style={{ display: (frota || placa) ? 'flex' : 'none' }}>
                <div className="summary-text">
                  <h3 id="total-km-rodado">0 km</h3>
                  <p>Total KM Rodado (Filtrado)</p>
                </div>
              </div>
            </div>
            
            <div className="charts-container">
              <div className="chart-card full-width" id="chartConsumoDiarioCard" style={{ display: (frota || placa) ? 'flex' : 'none' }}>
                <div className="chart-header">
                  <div className="chart-title">Consumo Médio por Veículo (km/L) Diário</div>
                  <div className="chart-info">Exibido com filtros de Frota ou Placa</div>
                </div>
                <div className="chart-content" id="chartConsumoDiario"></div>
              </div>
              
              <div className="chart-card">
                <div className="chart-header">
                  <div className="chart-title">Litragem Diária</div>
                  <div className="chart-tabs">
                    <button className="tab-btn active" data-period="daily">Diário</button>
                  </div>
                </div>
                <div className="chart-content" id="chartLitragem"></div>
              </div>
              <div className="chart-card">
                <div className="chart-header">
                  <div className="chart-title">Contagem de Abastecimentos Diários</div>
                </div>
                <div className="chart-content" id="chartAbastecimentosPorDia"></div>
              </div>
              
              <div className="chart-card full-width">
                <div className="chart-header">
                  <div className="chart-title">Litragem por Centro de Custo (CC)</div>
                </div>
                <div className="chart-content" id="chartLitragemPorCC"></div>
              </div>
              
              <div className="chart-card full-width">
                <div className="chart-header">
                  <div className="chart-title">Abastecimentos por Comboista</div>
                </div>
                <div className="chart-content" id="chartAbastecimentosPorComboista"></div>
              </div>
            </div>
          </div>
          
          <div id="comparative-analysis-section" style={{ display: showComparative ? 'block' : 'none' }}>
            <div className="container">
              <div className="dashboard-header">
                <h3>Análise Comparativa de Frotas</h3>
                <button id="toggleComparativeAnalysis" className="btn" style={{ width: 'auto', padding: '10px 20px' }} onClick={toggleComparativeAnalysis}>
                  {showComparative ? 'Ocultar Comparativo' : 'Mostrar Comparativo'}
                </button>
              </div>
              <div id="comparative-content">
                <div className="filter-grid">
                  <div className="form-group">
                    <label htmlFor="frota1Compare">Frota 1:</label>
                    <input type="text" id="frota1Compare" placeholder="Código da Frota 1" value={frota1Compare} onChange={(e) => setFrota1Compare(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="frota2Compare">Frota 2:</label>
                    <input type="text" id="frota2Compare" placeholder="Código da Frota 2" value={frota2Compare} onChange={(e) => setFrota2Compare(e.target.value)} />
                  </div>
                  <div className="search-button-container">
                    <button id="compareFrotasButton" onClick={renderComparativeChart}>Gerar Comparativo</button>
                  </div>
                </div>
                <div className="chart-card full-width" style={{ height: '400px' }}>
                  <div className="chart-header">
                    <div className="chart-title">Litragem Total e Consumo Médio por Frota</div>
                  </div>
                  <div className="chart-content" id="chartComparativoFrotas"></div>
                </div>
                <p id="comparative-status" style={{ textAlign: 'center', marginTop: '15px' }}>{comparativeStatus}</p>
              </div>
            </div>
          </div>
          
          <div className="results-area">
            <p id="data-status">{dataStatus}</p>
            <div id="abastecimentos-table-wrapper" style={{ display: filteredAbastecimentos.length > 0 ? 'block' : 'none' }}>
              <div id="abastecimentos-table">
                <div className="table-header">
                  <div>Identificador</div>
                  <div>Tipo Procedimento</div>
                  <div>Data Abastecimento</div>
                  <div>Hora Abastecimento</div>
                  <div>Comboista</div>
                  <div>Operador</div>
                  <div>Operação</div>
                  <div>Frota</div>
                  <div>Medidor</div>
                  <div>Medidor Via Entrada</div>
                  <div>Medidor Unidade</div>
                  <div>Bico</div>
                  <div>Combustível</div>
                  <div>Litragem</div>
                  <div>Encerrante Final</div>
                  <div>Cód. Terceiro</div>
                  <div>Latitude</div>
                  <div>Longitude</div>
                  <div>Foto Verificada</div>
                  <div>Identificação do Ponto</div>
                  <div>Estoque</div>
                  <div>Medidor Ant. Data</div>
                  <div>Medidor Ant. Valor</div>
                  <div>Placa</div>
                  <div>Centro de Custo (CC)</div>
                  <div>Registro Editado Em</div>
                  <div>Registrado Editado Por</div>
                  <div>Frota Tag</div>
                  <div>Comboista Tag</div>
                  <div>Operador Tag</div>
                  <div>Data Integração</div>
                </div>
                {paginatedData.map((abast, index) => {
                  const comboistaId = abast.comboista?.toString() || '';
                  const comboistaDisplay = comboistaNames[comboistaId] || abast.comboista || 'N/A';
                  const dataAbastecimentoFormatada = abast.data_abast ? new Date(abast.data_abast).toLocaleDateString('pt-BR') : 'N/A';
                  const horaAbastecimentoFormatada = abast.hora_abast ? abast.hora_abast.substring(0, 5) : 'N/A';
                  const registroEditadoEmData = abast.registro_editado_em ? new Date(abast.registro_editado_em).toLocaleDateString('pt-BR') : 'N/A';
                  const registroEditadoEmHora = abast.registro_editado_em ? new Date(abast.registro_editado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
                  const dataIntegracaoData = abast.data_integracao ? new Date(abast.data_integracao).toLocaleDateString('pt-BR') : 'N/A';
                  const dataIntegracaoHora = abast.data_integracao ? new Date(abast.data_integracao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
                  
                  return (
                    <div className="table-row" key={index}>
                      <div className="table-cell">{abast.identificador || 'N/A'}</div>
                      <div className="table-cell">{abast.tipo_procedimento || 'N/A'}</div>
                      <div className="table-cell">{dataAbastecimentoFormatada}</div>
                      <div className="table-cell">{horaAbastecimentoFormatada}</div>
                      <div className="table-cell">{comboistaDisplay}</div>
                      <div className="table-cell">{abast.operador || 'N/A'}</div>
                      <div className="table-cell">{abast.operacao || 'N/A'}</div>
                      <div className="table-cell">{abast.frota || 'N/A'}</div>
                      <div className="table-cell">{(parseFloat(abast.medidor as any) || 0).toFixed(2)}</div>
                      <div className="table-cell">{abast.medidor_via_entrada || 'N/A'}</div>
                      <div className="table-cell">{abast.medidor_unidade || 'N/A'}</div>
                      <div className="table-cell">{abast.bico || 'N/A'}</div>
                      <div className="table-cell">{abast.combustivel || 'N/A'}</div>
                      <div className="table-cell">{(parseFloat(abast.litragem as any) || 0).toFixed(2)}</div>
                      <div className="table-cell">{(parseFloat(abast.encerrante_fim as any) || 0).toFixed(2)}</div>
                      <div className="table-cell">{abast.codigo_terceiro || 'N/A'}</div>
                      <div className="table-cell">{(parseFloat(abast.latitude as any) || 0).toFixed(6)}</div>
                      <div className="table-cell">{(parseFloat(abast.longitude as any) || 0).toFixed(6)}</div>
                      <div className="table-cell">{abast.foto_verificada ? 'Sim' : 'Não'}</div>
                      <div className="table-cell">{abast.identificacao_do_ponto || 'N/A'}</div>
                      <div className="table-cell">{abast.estoque || 'N/A'}</div>
                      <div className="table-cell">{abast.medidor_anterior_data ? new Date(abast.medidor_anterior_data).toLocaleDateString('pt-BR') : 'N/A'}</div>
                      <div className="table-cell">{(parseFloat(abast.medidor_anterior_valor as any) || 0).toFixed(2)}</div>
                      <div className="table-cell">{abast.placa || 'N/A'}</div>
                      <div className="table-cell">{abast.cc || 'N/A'}</div>
                      <div className="table-cell">{registroEditadoEmData} {registroEditadoEmHora}</div>
                      <div className="table-cell">{abast.registrado_editado_por || 'N/A'}</div>
                      <div className="table-cell">{abast.frota_tag || 'N/A'}</div>
                      <div className="table-cell">{abast.comboista_tag || 'N/A'}</div>
                      <div className="table-cell">{abast.operador_tag || 'N/A'}</div>
                      <div className="table-cell">{dataIntegracaoData} {dataIntegracaoHora}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="pagination-controls" style={{ display: filteredAbastecimentos.length > 0 ? 'flex' : 'none' }}>
              <button id="prev-page" className="pagination-button" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}>Anterior</button>
              <span id="page-info" className="pagination-info">Página {currentPage} de {totalPages}</span>
              <button id="next-page" className="pagination-button" onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}>Próxima</button>
            </div>
          </div>
          <button id="logoutButton" style={{ backgroundColor: '#3498db', marginTop: '20px' }} onClick={logout}>Sair</button>
        </div>
      ) : (
        <div id="login-form" className="container" style={{ display: 'block' }}>
          <h2>LytoTec Abastecimentos</h2>
          <div className="form-group">
            <label htmlFor="username">Usuário:</label>
            <input type="text" id="username" name="username" required value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="password">Senha:</label>
            <input type="password" id="password" name="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button id="loginButton" onClick={authenticate}>ACESSAR</button>
          <div id="message" className={isError ? 'message-error' : 'message-success'}>{message}</div>
        </div>
      )}
    </>
  );
};

export default App;