
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Usina } from "@/types/usina";

interface UsinaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onSave: (id: string | null, data: Partial<Usina>) => Promise<void>;
  usina?: Usina;
}

const UsinaFormModal: React.FC<UsinaFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onSave,
  usina,
}) => {
  const [formData, setFormData] = useState<{
    nome_usina: string;
    endereco: string;
    producao_total: string;
    telefone: string;
  }>({
    nome_usina: "",
    endereco: "",
    producao_total: "",
    telefone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (usina) {
      setFormData({
        nome_usina: usina.nome_usina || "",
        endereco: usina.endereco || "",
        producao_total: usina.producao_total?.toString() || "",
        telefone: usina.telefone || "",
      });
    } else {
      setFormData({
        nome_usina: "",
        endereco: "",
        producao_total: "",
        telefone: "",
      });
    }
    setErrors({});
  }, [usina, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.nome_usina.trim()) {
      newErrors.nome_usina = "Nome da usina é obrigatório";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      // Convert producao_total to number if it's not empty
      const dataToSave: Partial<Usina> = {
        nome_usina: formData.nome_usina.trim(),
        endereco: formData.endereco.trim(),
        telefone: formData.telefone.trim(),
      };
      
      // Only add producao_total if it's not empty
      if (formData.producao_total.trim()) {
        dataToSave.producao_total = parseFloat(formData.producao_total);
      }
      
      await onSave(usina?.id || null, dataToSave);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving usina:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{usina ? "Editar Usina" : "Nova Usina"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nome_usina" className="required">
              Nome da Usina
            </Label>
            <Input
              id="nome_usina"
              name="nome_usina"
              value={formData.nome_usina}
              onChange={handleChange}
              className={errors.nome_usina ? "border-red-500" : ""}
            />
            {errors.nome_usina && (
              <p className="text-sm text-red-500">{errors.nome_usina}</p>
            )}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Input
              id="endereco"
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="producao_total">Produção Total</Label>
            <Input
              id="producao_total"
              name="producao_total"
              type="number"
              value={formData.producao_total}
              onChange={handleChange}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                Salvando...
              </>
            ) : (
              usina ? "Atualizar" : "Salvar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UsinaFormModal;
