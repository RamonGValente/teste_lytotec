
import { useState } from "react";

type TabsType = "dados-iniciais" | "dados-tecnicos" | "finalizacao";

export const useFormTabs = (initialTab: TabsType = "dados-iniciais") => {
  const [activeTab, setActiveTab] = useState<TabsType>(initialTab);

  const handleNext = () => {
    if (activeTab === "dados-iniciais") {
      setActiveTab("dados-tecnicos");
    } else if (activeTab === "dados-tecnicos") {
      setActiveTab("finalizacao");
    }
  };

  const handlePrevious = () => {
    if (activeTab === "finalizacao") {
      setActiveTab("dados-tecnicos");
    } else if (activeTab === "dados-tecnicos") {
      setActiveTab("dados-iniciais");
    }
  };

  return {
    activeTab,
    setActiveTab,
    handleNext,
    handlePrevious,
  };
};
