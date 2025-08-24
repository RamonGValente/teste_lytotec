
import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

const EntregaTableHeader: React.FC = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Data</TableHead>
        <TableHead>Centro de Custo</TableHead>
        <TableHead>Caminhão</TableHead>
        <TableHead>Equipe</TableHead>
        <TableHead>Qtd. Caminhão (t)</TableHead>
        <TableHead>Lançamento</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className="text-right">Ações</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default EntregaTableHeader;
