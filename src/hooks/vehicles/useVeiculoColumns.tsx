
import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Veiculo } from "@/types/veiculo";
import VeiculoImage from "@/components/veiculos/table/VeiculoImage";
import VeiculoStatusBadge from "@/components/veiculos/table/VeiculoStatusBadge";
import VeiculoActions from "@/components/veiculos/table/VeiculoActions";

interface UseVeiculoColumnsProps {
  onView: (veiculo: Veiculo) => void;
  onEdit: (veiculo: Veiculo) => void;
  onDelete: (veiculo: Veiculo) => void;
}

export const useVeiculoColumns = ({
  onView,
  onEdit,
  onDelete
}: UseVeiculoColumnsProps): ColumnDef<Veiculo>[] => {
  return [
    {
      id: "imagem",
      header: "Imagem",
      cell: ({ row }) => {
        const veiculo = row.original;
        return (
          <VeiculoImage 
            imageUrl={veiculo.imagem_url} 
            alt={veiculo.placa || 'Veículo'} 
          />
        );
      },
    },
    {
      id: "identificador",
      header: "Identificador",
      cell: ({ row }) => {
        const veiculo = row.original;
        let identificador = "";
        
        if (veiculo.frota && veiculo.numero_frota) {
          identificador += `${veiculo.frota}${veiculo.numero_frota}`;
        }
        
        if (veiculo.placa) {
          identificador += identificador ? ` - ${veiculo.placa}` : veiculo.placa;
        }
        
        return identificador || "N/A";
      },
    },
    {
      accessorKey: "tipo_veiculo",
      header: "Tipo",
    },
    {
      accessorKey: "modelo",
      header: "Modelo",
    },
    {
      accessorKey: "nome_departamento",
      header: "Departamento",
    },
    {
      accessorKey: "situacao",
      header: "Situação",
      cell: ({ row }) => {
        const situacao = row.original.situacao;
        return <VeiculoStatusBadge situacao={situacao} />;
      },
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const veiculo = row.original;
        return (
          <VeiculoActions 
            veiculo={veiculo}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        );
      },
    },
  ];
};
