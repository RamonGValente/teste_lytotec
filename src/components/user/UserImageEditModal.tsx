
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, X } from "lucide-react";

export interface UserImageEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageUpdate: (file: File) => Promise<void>;
  currentImage?: string;
}

const UserImageEditModal: React.FC<UserImageEditModalProps> = ({
  isOpen,
  onClose,
  onImageUpdate,
  currentImage
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      setError('Por favor, selecione uma imagem válida.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB.');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onImageUpdate(selectedFile);
      onClose();
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Erro ao atualizar imagem. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    onClose();
  };

  // Clean up preview URL when component unmounts or modal closes
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  React.useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setError(null);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Atualizar Imagem de Perfil</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex justify-center py-4">
            <Avatar className="h-24 w-24">
              {previewUrl ? (
                <AvatarImage src={previewUrl} alt="Preview" />
              ) : (
                <AvatarImage src={currentImage || ''} alt="Current profile" />
              )}
              <AvatarFallback>
                <Upload className="h-8 w-8 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="space-y-2">
            <Label htmlFor="picture">Selecione uma nova imagem</Label>
            <div className="flex">
              <input
                id="picture"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <label
                htmlFor="picture"
                className="flex-1 flex items-center justify-center px-4 py-2 border border-dashed rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Upload className="mr-2 h-4 w-4" />
                <span>{selectedFile ? selectedFile.name : "Escolher arquivo"}</span>
              </label>
              {selectedFile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="ml-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Formatos aceitos: JPG, PNG, GIF. Tamanho máximo: 5MB.
            </p>
          </div>

          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-2 rounded">
              {error}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedFile || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full" />
                Salvando...
              </>
            ) : (
              "Salvar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserImageEditModal;
