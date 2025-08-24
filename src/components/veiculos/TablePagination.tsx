
import React from "react";
import { Table } from "@tanstack/react-table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface TablePaginationProps<T> {
  table: Table<T>;
}

export default function TablePagination<T>({ table }: TablePaginationProps<T>) {
  const currentPage = table.getState().pagination.pageIndex;
  const totalPages = table.getPageCount();
  const pageSize = table.getState().pagination.pageSize;
  const totalItems = table.getFilteredRowModel().rows.length;
  const startIndex = currentPage * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(0, currentPage - 2);
      const end = Math.min(totalPages - 1, start + maxVisiblePages - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        Mostrando {startIndex + 1} a {endIndex} de {totalItems} registros
      </div>
      
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Itens por página</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 50].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">
            Página {currentPage + 1} de {totalPages}
          </span>
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
            </PaginationItem>
            
            <PaginationItem>
              <PaginationPrevious
                onClick={() => table.previousPage()}
                className={`h-8 ${!table.getCanPreviousPage() ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </PaginationPrevious>
            </PaginationItem>
            
            {getPageNumbers().map((pageNum) => (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  onClick={() => table.setPageIndex(pageNum)}
                  isActive={pageNum === currentPage}
                  className="h-8 cursor-pointer"
                >
                  {pageNum + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext
                onClick={() => table.nextPage()}
                className={`h-8 ${!table.getCanNextPage() ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
              >
                Próximo
                <ChevronRight className="h-4 w-4 ml-1" />
              </PaginationNext>
            </PaginationItem>
            
            <PaginationItem>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => table.setPageIndex(totalPages - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
