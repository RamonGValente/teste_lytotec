
import React from "react";
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { Camera, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  inputId: string;
  preview: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: "camera" | "upload";
  required?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  form,
  name,
  label,
  inputId,
  preview,
  onImageChange,
  icon = "camera",
  required = false,
}) => {
  const IconComponent = icon === "camera" ? Camera : Upload;
  const formValue = form.watch(name);
  const hasFile = formValue instanceof File;
  const hasPreview = Boolean(preview);
  const hasImage = hasFile || hasPreview;
  
  console.log(`🖼️ [ImageUpload-${name}] Estado detalhado:`, { 
    name,
    formValue: formValue instanceof File ? `FILE: ${formValue.name}` : typeof formValue,
    hasFile,
    hasPreview,
    hasImage,
    preview: preview ? "PRESENTE" : "AUSENTE"
  });

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2">
            <IconComponent className="h-4 w-4" />
            {label}
            {required && <span className="text-destructive">*</span>}
            {hasImage && (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
            {required && !hasImage && (
              <AlertCircle className="h-4 w-4 text-amber-600" />
            )}
          </FormLabel>
          <div className="flex flex-col space-y-3">
            <Button
              type="button"
              variant={hasImage ? "default" : "outline"}
              className={cn(
                "w-full h-12 transition-all duration-200",
                hasImage 
                  ? "bg-green-600 hover:bg-green-700 text-white border-green-600" 
                  : required 
                  ? "border-amber-300 hover:border-amber-400 hover:bg-amber-50" 
                  : "hover:bg-gray-50"
              )}
              onClick={() => document.getElementById(inputId)?.click()}
            >
              <IconComponent className="mr-2 h-4 w-4" />
              {hasImage ? "✅ Imagem Anexada - Clique para Alterar" : "📸 Clique para Anexar Imagem"}
            </Button>
            
            <Input
              id={inputId}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={onImageChange}
            />
            
            {hasImage && (
              <div className="text-sm text-green-700 bg-green-50 p-3 rounded-md flex items-center gap-2">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">
                  {hasFile ? `Arquivo selecionado: ${formValue.name}` : "Imagem carregada com sucesso"}
                </span>
              </div>
            )}
            
            {required && !hasImage && (
              <div className="text-sm text-amber-700 bg-amber-50 p-3 rounded-md flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">
                  ⚠️ Campo obrigatório - Clique no botão acima para anexar uma imagem
                </span>
              </div>
            )}
            
            {!required && !hasImage && (
              <div className="text-xs text-muted-foreground text-center">
                Formatos aceitos: JPEG, PNG, WebP (máximo 5MB)
              </div>
            )}
            
            {preview && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-xs text-muted-foreground mb-2 font-medium">Preview:</p>
                <div className="relative w-full h-40 border-2 border-gray-200 rounded-md overflow-hidden bg-white">
                  <img
                    src={preview}
                    alt={`Preview - ${label}`}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ImageUpload;
