
import { useState, useCallback } from "react";

export type SidebarState = {
  isSidebarOpen: boolean;
  openGroups: Record<string, boolean>;
  openCategories: string[];
  toggleSidebar: () => void;
  toggleCategory: (category: string) => void;
  toggleGroup: (group: string) => void;
};

export const useSidebarState = (): SidebarState => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openCategories, setOpenCategories] = useState<string[]>(["gestao-rh"]);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "Gestão de RH": true,
    "Gestão de Maquinas/Equipamentos": true
  });

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const toggleCategory = useCallback((category: string) => {
    setOpenCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  }, []);

  const toggleGroup = useCallback((group: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  }, []);

  return {
    isSidebarOpen,
    openGroups,
    openCategories,
    toggleSidebar,
    toggleCategory,
    toggleGroup
  };
};
