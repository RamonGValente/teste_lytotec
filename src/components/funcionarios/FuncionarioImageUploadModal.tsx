
import React, { useState } from "react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Funcionario } from "@/types/funcionario";

interface FuncionarioImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  funcionario: Funcionario | null;
  onImageUpdate: (imageUrl: string) => Promise<void>;
}

const FuncionarioImageUploadModal: React.FC<FuncionarioImageUploadModalProps> = ({ 
  isOpen, onClose, funcionario, onImageUpdate 
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  if (!funcionario) return null;
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione um arquivo de imagem válido.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 2MB.",
        variant: "destructive"
      });
      return;
    }
    
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleSubmit = async () => {
    if (!imageFile || !funcionario.id) {
      toast({
        title: "Nenhuma imagem selecionada",
        description: "Por favor, selecione uma imagem para continuar.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create a unique file path for the funcionario's avatar
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${funcionario.id}-${Date.now()}.${fileExt}`;
      
      // Upload the image to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('funcionarios')
        .upload(fileName, imageFile, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        throw new Error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
      }
      
      // Get the public URL of the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('funcionarios')
        .getPublicUrl(fileName);
      
      // Update the funcionario's record with the new image URL
      const { error: updateError } = await supabase
        .from('bd_funcionarios')
        .update({ imagem: publicUrl })
        .eq('id', funcionario.id);
      
      if (updateError) {
        throw new Error(`Erro ao atualizar funcionário: ${updateError.message}`);
      }
      
      // Update the funcionario's image in the app state
      await onImageUpdate(publicUrl);
      
      toast({
        title: "Imagem atualizada",
        description: "A imagem do funcionário foi atualizada com sucesso."
      });
      
      // Reset state and close modal
      resetState();
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido';
      toast({
        title: "Erro",
        description: `Ocorreu um erro ao atualizar a imagem do funcionário: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetState = () => {
    setImagePreview(null);
    setImageFile(null);
  };
  
  const handleCancel = () => {
    resetState();
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Imagem do Funcionário</DialogTitle>
          <DialogDescription>
            Escolha uma nova imagem para o funcionário.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-4 py-4">
          <Avatar className="h-24 w-24">
            {imagePreview ? (
              <AvatarImage src={imagePreview} alt="Preview" />
            ) : (
              <>
                <AvatarImage 
                  src={funcionario.imagem || `https://ui-avatars.com/api/?name=${encodeURIComponent(funcionario.nome_completo)}&background=random&size=200`}
                  alt={funcionario.nome_completo} 
                />
                <AvatarFallback>{funcionario.nome_completo?.[0] || 'F'}</AvatarFallback>
              </>
            )}
          </Avatar>
          
          <div className="grid w-full gap-4">
            <Label htmlFor="funcionario-picture" className="cursor-pointer">
              <div className="flex items-center justify-center gap-2 rounded-md border-2 border-dashed p-4 hover:bg-muted/50">
                <Upload className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {imagePreview ? "Alterar imagem" : "Selecionar imagem"}
                </span>
              </div>
              <Input 
                id="funcionario-picture" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageChange}
              />
            </Label>
            
            {imagePreview && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full" 
                onClick={() => {
                  setImagePreview(null);
                  setImageFile(null);
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Remover imagem
              </Button>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting} type="button">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!imagePreview || isSubmitting} type="button">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FuncionarioImageUploadModal;
