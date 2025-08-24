
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TipoVeiculoDistribution, StatusOperacionalData, IdadeFrotaData } from "@/types/maquinas";

interface VisaoGeralFrotaProps {
  tipoVeiculo: TipoVeiculoDistribution[];
  statusOperacional: StatusOperacionalData[];
  idadeFrota: IdadeFrotaData[];
  isLoading: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function VisaoGeralFrota({ 
  tipoVeiculo, 
  statusOperacional, 
  idadeFrota, 
  isLoading 
}: VisaoGeralFrotaProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
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
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Visão Geral da Frota</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribuição por Tipo de Veículo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribuição por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tipoVeiculo}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="quantidade"
                  >
                    {tipoVeiculo.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Operacional */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status Operacional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusOperacional}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantidade" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Idade da Frota */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Idade da Frota</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={idadeFrota}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="faixaIdade" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantidade" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
