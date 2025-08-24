
import { useState, useMemo } from "react";

export interface PaginationOptions {
  initialPage?: number;
  pageSize?: number;
}

export interface PaginationResult<T> {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  paginatedData: T[];
  canPreviousPage: boolean;
  canNextPage: boolean;
  setPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setPageSize: (size: number) => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
}

export function usePagination<T>(
  data: T[] = [],
  options: PaginationOptions = {}
): PaginationResult<T> {
  const { initialPage = 0, pageSize: initialPageSize = 10 } = options;
  
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const pagination = useMemo(() => {
    const totalItems = data.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = currentPage * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    
    const paginatedData = data.slice(startIndex, endIndex);
    
    return {
      currentPage,
      pageSize,
      totalPages,
      totalItems,
      startIndex,
      endIndex,
      paginatedData,
      canPreviousPage: currentPage > 0,
      canNextPage: currentPage < totalPages - 1,
    };
  }, [data, currentPage, pageSize]);

  const setPage = (page: number) => {
    const maxPage = Math.max(0, pagination.totalPages - 1);
    setCurrentPage(Math.max(0, Math.min(page, maxPage)));
  };

  const nextPage = () => {
    if (pagination.canNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const previousPage = () => {
    if (pagination.canPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const setPageSize = (size: number) => {
    setPageSizeState(size);
    setCurrentPage(0); // Reset to first page when changing page size
  };

  const goToFirstPage = () => setCurrentPage(0);
  const goToLastPage = () => setCurrentPage(Math.max(0, pagination.totalPages - 1));

  return {
    ...pagination,
    setPage,
    nextPage,
    previousPage,
    setPageSize,
    goToFirstPage,
    goToLastPage,
  };
}
