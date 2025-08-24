
import { useQuery } from "@tanstack/react-query";
import { 
  fetchVeiculos,
  getDepartamentosDropdown,
  getMarcasDropdown,
  VeiculoFilter
} from "@/services/veiculo";

export const useVeiculoQueries = (filters: VeiculoFilter = {}) => {
  // Queries with better error handling
  const { 
    data: veiculos, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['veiculos', filters],
    queryFn: () => fetchVeiculos(filters),
    retry: 1,
    staleTime: 30000,
  });

  const { data: departamentosDropdown, isLoading: isLoadingDepartamentos } = useQuery({
    queryKey: ['departamentosDropdown'],
    queryFn: () => getDepartamentosDropdown(),
    retry: 1,
    staleTime: 60000,
  });

  const { data: marcasDropdown, isLoading: isLoadingMarcas } = useQuery({
    queryKey: ['marcasDropdown'],
    queryFn: () => getMarcasDropdown(),
    retry: 1,
    staleTime: 60000,
  });

  // Provide default values for better safety
  return {
    veiculos: veiculos || [],
    isLoading,
    isError,
    refetch,
    departamentosDropdown: departamentosDropdown || [],
    isLoadingDepartamentos,
    marcasDropdown: marcasDropdown || [],
    isLoadingMarcas,
  };
};
