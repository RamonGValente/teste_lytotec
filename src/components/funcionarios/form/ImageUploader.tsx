
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Funcionario } from "@/types/funcionario";
import { UseFormReturn } from "react-hook-form";
import { useFuncionarioImageUpload } from "@/hooks/useFuncionarioImageUpload";

interface ImageUploaderProps {
  funcionario: Funcionario | null;
  form: UseFormReturn<any>;
  isUploadingImage?: boolean;
  setIsUploadingImage?: (value: boolean) => void;
  imagePreview?: string | null;
  setImagePreview?: (value: string | null) => void;
  imageFile?: File | null;
  setImageFile?: (value: File | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  funcionario,
  form,
  isUploadingImage,
  setIsUploadingImage,
  imagePreview,
  setImagePreview,
  imageFile,
  setImageFile
}) => {
  // Get the openImageModal function from the hook
  // This is used for when we want to open the larger image edit modal
  const { openImageModal } = useFuncionarioImageUpload();

  const handleAddImageClick = () => {
    if (funcionario) {
      console.log("Opening image modal for funcionario:", funcionario);
      openImageModal(funcionario);
    } else {
      console.log("No funcionario provided, cannot open image modal");
    }
  };

  return (
    <div className="flex flex-col items-center mb-4">
      <Avatar className="h-24 w-24 mb-2">
        <AvatarImage 
          src={imagePreview || form.watch("imagem") || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.watch("nome_completo") || "Funcionário")}&background=random&size=200`} 
          alt="Foto" 
        />
        <AvatarFallback>
          {form.watch("nome_completo") ? form.watch("nome_completo").charAt(0).toUpperCase() : "FU"}
        </AvatarFallback>
      </Avatar>
      
      <div className="grid w-full max-w-sm gap-2">
        <Button 
          type="button" 
          variant="outline"
          className="flex items-center justify-center gap-2"
          onClick={handleAddImageClick}
          disabled={!funcionario}
        >
          <Upload className="h-4 w-4" />
          <span>Adicionar imagem</span>
        </Button>
        
        <FormField
          control={form.control}
          name="imagem"
          render={({ field }) => (
            <FormItem className="w-full hidden">
              <FormControl>
                <Input
                  placeholder="URL da imagem"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <p className="text-xs text-muted-foreground text-center">
          {!funcionario && "Salve o cadastro primeiro para poder adicionar uma imagem"}
        </p>
      </div>
    </div>
  );
};

export default ImageUploader;
