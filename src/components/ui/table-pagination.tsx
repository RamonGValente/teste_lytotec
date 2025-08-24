
import React from "react";
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
import { PaginationResult } from "@/hooks/usePagination";

interface TablePaginationProps<T> {
  pagination: PaginationResult<T>;
  className?: string;
}

export default function TablePagination<T>({ pagination, className }: TablePaginationProps<T>) {
  const {
    currentPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    canPreviousPage,
    canNextPage,
    pageSize,
    setPage,
    nextPage,
    previousPage,
    setPageSize,
    goToFirstPage,
    goToLastPage,
  } = pagination;

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
    <div className={`flex items-center justify-between px-2 ${className}`}>
      <div className="flex-1 text-sm text-muted-foreground">
        Mostrando {startIndex + 1} a {endIndex} de {totalItems} registros
      </div>
      
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Itens por página</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => setPageSize(Number(value))}
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
                onClick={goToFirstPage}
                disabled={!canPreviousPage}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
            </PaginationItem>
            
            <PaginationItem>
              <PaginationPrevious
                onClick={previousPage}
                className={`h-8 ${!canPreviousPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </PaginationPrevious>
            </PaginationItem>
            
            {getPageNumbers().map((pageNum) => (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  onClick={() => setPage(pageNum)}
                  isActive={pageNum === currentPage}
                  className="h-8 cursor-pointer"
                >
                  {pageNum + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext
                onClick={nextPage}
                className={`h-8 ${!canNextPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
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
                onClick={goToLastPage}
                disabled={!canNextPage}
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
