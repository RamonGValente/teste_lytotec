
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import FuncionarioPage from "@/components/funcionarios/FuncionarioPage";
import FuncionarioImageUploadModal from "@/components/funcionarios/FuncionarioImageUploadModal";
import { useFuncionarioImageUpload } from "@/hooks/useFuncionarioImageUpload";

const GestaoFuncionarios: React.FC = () => {
  const { 
    isImageModalOpen, 
    selectedFuncionario, 
    closeImageModal, 
    updateFuncionarioImage,
    openImageModal
  } = useFuncionarioImageUpload();

  return (
    <MainLayout>
      <FuncionarioPage openImageModal={openImageModal} />
      
      {/* Image Upload Modal */}
      <FuncionarioImageUploadModal
        isOpen={isImageModalOpen}
        onClose={closeImageModal}
        funcionario={selectedFuncionario}
        onImageUpdate={updateFuncionarioImage}
      />
    </MainLayout>
  );
};

export default GestaoFuncionarios;
