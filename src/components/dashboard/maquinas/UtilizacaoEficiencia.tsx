
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CentroCustoUtilizacao } from "@/types/maquinas";

interface UtilizacaoEficienciaProps {
  centroCustoData: CentroCustoUtilizacao[];
  isLoading: boolean;
}

export default function UtilizacaoEficiencia({ 
  centroCustoData, 
  isLoading 
}: UtilizacaoEficienciaProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <Card key={i} className="h-80">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-60 bg-gray-100 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Utilização e Eficiência</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Utilização por Centro de Custo - Horas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Horas Trabalhadas por Centro de Custo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={centroCustoData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="centroCusto" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="totalHoras" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Consumo de Combustível por Centro de Custo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Consumo de Combustível por Centro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={centroCustoData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="centroCusto" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="totalCombustivel" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
