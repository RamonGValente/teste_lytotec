
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { truncateText } from "@/lib/truncateText";

interface MediaPorFuncaoChartProps {
  data: { nome_funcao: string; media: number }[];
}

const cores = [
  "#0ea5e9", "#60a5fa", "#7dd3fc", "#06b6d4", "#10b981", "#f59e42", "#f472b6",
];

export default function MediaPorFuncaoChart({ data }: MediaPorFuncaoChartProps) {
  console.log("🔍 DEBUG MediaPorFuncaoChart - data recebida:", data);
  
  // Filtrar dados válidos (com média > 0) e funções nomeadas
  const dadosValidos = data.filter(d => 
    d.media > 0 && 
    d.nome_funcao && 
    d.nome_funcao !== "Não informada"
  );
  
  console.log("🔍 DEBUG MediaPorFuncaoChart - dados válidos:", dadosValidos);
  
  if (!data || data.length === 0 || dadosValidos.length === 0) {
    return (
      <div className="text-muted-foreground text-center py-4 text-xs">
        {data?.length === 0 ? "Sem funções cadastradas." : "Sem salários cadastrados para funções."}
      </div>
    );
  }

  // Truncar nomes para labels e oferecer tooltip
  function renderYAxisTick({ x, y, payload }: any) {
    const fullLabel = payload.value;
    const truncLabel = truncateText(fullLabel, 18);
    return (
      <g transform={`translate(${x},${y})`}>
        <title>{fullLabel}</title>
        <text x={0} y={0} dy={4} textAnchor="end" fill="#6b7280" fontSize={12}>
          {truncLabel}
        </text>
      </g>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart
        data={dadosValidos.sort((a, b) => b.media - a.media)}
        layout="vertical"
        margin={{ left: 120, right: 10 }}
      >
        <XAxis type="number" />
        <YAxis
          dataKey="nome_funcao"
          type="category"
          width={120}
          tick={renderYAxisTick}
        />
        <Tooltip
          formatter={v => `R$ ${(v as number).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
          labelFormatter={label => label}
        />
        <Bar dataKey="media" radius={[0, 6, 6, 0]}>
          {dadosValidos.map((entry, i) => (
            <Cell key={entry.nome_funcao} fill={cores[i % cores.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
