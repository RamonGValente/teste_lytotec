
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Funcionario, FuncionarioFormData } from "@/types/funcionario";
import { useFuncionarioForm } from "@/hooks/useFuncionarioForm";
import FormTabs from "./form/FormTabs";

interface FuncionarioFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  funcionario?: Funcionario | null;
  onSubmit: (data: FuncionarioFormData) => void;
  isSubmitting: boolean;
}

const FuncionarioFormModal: React.FC<FuncionarioFormModalProps> = ({
  isOpen,
  onClose,
  funcionario,
  onSubmit,
  isSubmitting
}) => {
  const {
    form,
    activeTab,
    setActiveTab,
    imagePreview,
    setImagePreview,
    imageFile,
    setImageFile,
    isUploadingImage,
    setIsUploadingImage
  } = useFuncionarioForm(funcionario, isOpen);

  const handleSubmit = (data: FuncionarioFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {funcionario ? "Editar Funcionário" : "Novo Funcionário"}
          </DialogTitle>
        </DialogHeader>

        <FormTabs
          form={form}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onSubmit={handleSubmit}
          onClose={onClose}
          isSubmitting={isSubmitting}
          imagePreview={imagePreview}
          setImagePreview={setImagePreview}
          imageFile={imageFile}
          setImageFile={setImageFile}
          isUploadingImage={isUploadingImage}
          setIsUploadingImage={setIsUploadingImage}
          funcionarioId={funcionario?.id}
          funcionario={funcionario}
        />
      </DialogContent>
    </Dialog>
  );
};

export default FuncionarioFormModal;
