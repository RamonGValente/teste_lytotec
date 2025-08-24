
import React, { useMemo } from "react";
import { CartesianGrid, Line, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ComposedChart, Legend } from "recharts";
import { Badge } from "@/components/ui/badge";

interface EvolucaoChartProps {
  evolucaoTemporal: {
    data?: {
      entradas?: { data_admissao?: string }[];
      demissoes?: { data_demissao?: string }[];
    };
    isLoading?: boolean;
  };
}

// Gera dados mensais do período: [{ mes: "2024-01", entradas, demissoes }]
function buildSeries(entradas: { data_admissao?: string }[] = [], demissoes: { data_demissao?: string }[] = []) {
  const sums = new Map<string, { entradas: number; demissoes: number }>();
  entradas.forEach(e => {
    if (!e.data_admissao) return;
    const [ano, mes] = e.data_admissao.split("-"); // YYYY-MM-DD
    const mkey = `${ano}-${mes}`;
    sums.set(mkey, { ...sums.get(mkey), entradas: ((sums.get(mkey)?.entradas ?? 0) + 1), demissoes: sums.get(mkey)?.demissoes ?? 0 });
  });
  demissoes.forEach(e => {
    if (!e.data_demissao) return;
    const [ano, mes] = e.data_demissao.split("-");
    const mkey = `${ano}-${mes}`;
    sums.set(mkey, { ...sums.get(mkey), demissoes: ((sums.get(mkey)?.demissoes ?? 0) + 1), entradas: sums.get(mkey)?.entradas ?? 0 });
  });
  const ret = Array.from(sums.entries()).map(([k, v]) => ({
    mes: k,
    ...v,
  }));
  // Ordenar por mês ascendente
  ret.sort((a, b) => a.mes.localeCompare(b.mes));
  return ret;
}

export default function EvolucaoChart({ evolucaoTemporal }: EvolucaoChartProps) {
  const { data, isLoading } = evolucaoTemporal;
  const series = useMemo(() =>
    buildSeries(data?.entradas ?? [], data?.demissoes ?? []),
    [data]
  );

  if (isLoading) {
    return <Badge className="mb-2 w-full">Carregando gráfico...</Badge>
  }
  if (!series.length) {
    return <Badge className="mb-2 w-full">Sem dados</Badge>
  }

  return (
    <ResponsiveContainer minHeight={240} width="100%" height={260}>
      <ComposedChart data={series}>
        <XAxis dataKey="mes" />
        <YAxis />
        <Tooltip />
        <Legend />
        <CartesianGrid stroke="#f5f5f5" />
        <Bar dataKey="entradas" barSize={26} fill="#5CB85C" name="Entradas" />
        <Bar dataKey="demissoes" barSize={26} fill="#EF4444" name="Saídas" />
        <Line type="monotone" dataKey="entradas" stroke="#2563eb" name="Entradas" />
        <Line type="monotone" dataKey="demissoes" stroke="#dc2626" name="Saídas" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
