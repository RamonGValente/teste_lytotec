
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { menuStructure } from '@/constants/menuStructure';

export const useSidebarState = () => {
  const location = useLocation();

  // Determine which groups should be open based on current path
  const getInitialOpenGroups = () => {
    const path = location.pathname;
    
    // Initialize all groups as closed
    const initialState: Record<string, boolean> = {};
    
    menuStructure.forEach(group => {
      initialState[group.title] = false;
    });
    
    // Open the appropriate group based on the current path
    if (path === '/' || path === '/dashboard') {
      initialState["Dashboard"] = true;
    } else if (path.includes('/gestao-rh/')) {
      initialState["Gestão de RH"] = true;
    } else if (path.includes('/gestao-maquinas/')) {
      initialState["Gestão de Máquinas"] = true;
    } else if (path.includes('/requisicoes/')) {
      initialState["Requisições e Logística"] = true;
    } else if (path.includes('/admin/')) {
      initialState["Administração"] = true;
    }
    
    return initialState;
  };
  
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(getInitialOpenGroups());
  
  useEffect(() => {
    // Update open groups when location changes
    setOpenGroups(getInitialOpenGroups());
  }, [location.pathname]);
  
  // Load saved sidebar state from localStorage on component mount
  useEffect(() => {
    const savedOpenGroups = localStorage.getItem('sidebarOpenGroups');
    if (savedOpenGroups) {
      try {
        const parsedState = JSON.parse(savedOpenGroups);
        
        // Ensure the current path's group is open, regardless of saved state
        const currentState = getInitialOpenGroups();
        const mergedState = { ...parsedState, ...currentState };
        
        setOpenGroups(mergedState);
      } catch (error) {
        console.error("Error parsing saved sidebar state:", error);
        setOpenGroups(getInitialOpenGroups());
      }
    }
  }, []);
  
  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('sidebarOpenGroups', JSON.stringify(openGroups));
  }, [openGroups]);
  
  const toggleGroup = (group: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  return {
    openGroups,
    setOpenGroups,
    toggleGroup
  };
};
