
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImage?: string;
  onImageUpdated: (file: File) => Promise<string>;
}

const UserImageUploadModal: React.FC<UserImageUploadModalProps> = ({
  isOpen,
  onClose,
  currentImage,
  onImageUpdated
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.includes("image/")) {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione um arquivo de imagem.",
          variant: "destructive"
        });
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 5MB.",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Nenhuma imagem selecionada",
        description: "Por favor, selecione uma imagem para upload.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsUploading(true);
      await onImageUpdated(selectedFile);
      
      toast({
        title: "Imagem atualizada",
        description: "Sua imagem de perfil foi atualizada com sucesso."
      });
      
      // Reset state
      setPreviewImage(null);
      setSelectedFile(null);
      onClose();
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Erro ao atualizar imagem",
        description: "Ocorreu um erro ao fazer upload da imagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const initialImage = previewImage || currentImage;
  
  const handleClose = () => {
    setPreviewImage(null);
    setSelectedFile(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Imagem de Perfil</DialogTitle>
          <DialogDescription>
            Faça upload de uma nova imagem para seu perfil.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-4 gap-4">
          {/* Current/Preview Image */}
          <Avatar className="w-32 h-32">
            {initialImage ? (
              <AvatarImage src={initialImage} alt="Preview" />
            ) : (
              <AvatarFallback>
                <User className="h-20 w-20" />
              </AvatarFallback>
            )}
          </Avatar>
          
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          
          {/* Upload button */}
          <Button 
            onClick={triggerFileInput}
            variant="outline" 
            className="flex gap-2"
          >
            <Upload size={16} />
            Selecionar imagem
          </Button>
          
          {selectedFile && (
            <p className="text-sm text-muted-foreground">
              {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </p>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? "Enviando..." : "Salvar alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserImageUploadModal;
