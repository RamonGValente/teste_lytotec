
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  fetchEquipes, 
  getEquipeById, 
  createEquipe, 
  updateEquipe, 
  deleteEquipe,
  fetchFuncionariosByRole
} from "@/services/equipe";
import { EquipeFilter, EquipeFormData } from "@/types/equipe";
import { supabase } from "@/integrations/supabase/client";

export function useEquipeQueries(filters: EquipeFilter = {}) {
  const queryClient = useQueryClient();
  
  // Query to fetch equipes with filters and optimized member loading
  const { 
    data: equipes = [], 
    isLoading, 
    isError,
    refetch 
  } = useQuery({
    queryKey: ['equipes', filters],
    queryFn: async () => {
      const equipesData = await fetchEquipes(filters);
      
      // For each equipe, fetch the member names if equipe array exists
      const equipesWithMembers = await Promise.all(
        equipesData.map(async (equipe) => {
          if (equipe.equipe && equipe.equipe.length > 0) {
            try {
              const { data: membrosData } = await supabase
                .from("bd_funcionarios")
                .select("id, nome_completo")
                .in("id", equipe.equipe);
              
              const membrosMap = new Map(membrosData?.map(m => [m.id, m]) || []);
              equipe.membros = equipe.equipe
                .map(id => membrosMap.get(id))
                .filter(Boolean) as { id: string; nome_completo: string }[];
            } catch (error) {
              console.warn(`Erro ao carregar membros da equipe ${equipe.id}:`, error);
              equipe.membros = [];
            }
          } else {
            equipe.membros = [];
          }
          return equipe;
        })
      );
      
      return equipesWithMembers;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
  
  // Function to get a single equipe by ID with its members
  const getEquipe = async (id: string) => {
    // Try to get from cache first
    const cachedEquipe = equipes.find(e => e.id === id);
    if (cachedEquipe && cachedEquipe.membros) {
      return cachedEquipe;
    }
    
    // If not in cache or no members, fetch fresh data
    return await getEquipeById(id);
  };
  
  // Query to fetch funcionarios with "Encarregado" role
  const { 
    data: encarregados = [], 
    isLoading: isLoadingEncarregados
  } = useQuery({
    queryKey: ['funcionarios', 'encarregados'],
    queryFn: () => fetchFuncionariosByRole('Encarregado'),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Query to fetch funcionarios with "Apontador" role
  const { 
    data: apontadores = [], 
    isLoading: isLoadingApontadores 
  } = useQuery({
    queryKey: ['funcionarios', 'apontadores'],
    queryFn: () => fetchFuncionariosByRole('Apontador'),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Query to fetch all funcionarios (for team members selection)
  const { 
    data: allFuncionarios = [], 
    isLoading: isLoadingFuncionarios 
  } = useQuery({
    queryKey: ['funcionarios', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bd_funcionarios")
        .select("id, nome_completo, equipe_id");
        
      if (error) throw new Error(error.message);
      console.log("All funcionarios loaded:", data?.length || 0);
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Mutation to create a new equipe
  const createEquipeMutation = useMutation({
    mutationFn: (data: EquipeFormData) => createEquipe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipes'] });
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
    }
  });
  
  // Mutation to update an existing equipe
  const updateEquipeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: EquipeFormData }) => 
      updateEquipe(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipes'] });
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
    }
  });
  
  // Mutation to delete an equipe
  const deleteEquipeMutation = useMutation({
    mutationFn: (id: string) => deleteEquipe(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipes'] });
      queryClient.invalidateQueries({ queryKey: ['funcionarios'] });
    }
  });
  
  return {
    equipes,
    isLoading,
    isError,
    refetch,
    encarregados,
    isLoadingEncarregados,
    apontadores,
    isLoadingApontadores,
    allFuncionarios,
    isLoadingFuncionarios,
    createEquipeMutation,
    updateEquipeMutation,
    deleteEquipeMutation,
    getEquipe
  };
}
