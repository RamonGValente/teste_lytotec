
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Truck, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface VeiculoImageUploadProps {
  currentImage?: string | null;
  onImageChange: (file: File) => void;
}

const VeiculoImageUpload: React.FC<VeiculoImageUploadProps> = ({ 
  currentImage, 
  onImageChange 
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione um arquivo de imagem válido.');
        return;
      }
      
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('O tamanho máximo da imagem é 5MB.');
        return;
      }
      
      // Pass file to parent component
      onImageChange(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      console.log("Image selected:", file.name, file.type, `${(file.size / 1024).toFixed(2)}KB`);
    }
  };

  const displayImage = previewUrl || currentImage;

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-32 w-32">
          {displayImage ? (
            <AvatarImage src={displayImage} alt="Imagem do veículo" className="object-cover" />
          ) : (
            <AvatarFallback className="bg-primary-50">
              <Truck className="h-16 w-16 text-primary" />
            </AvatarFallback>
          )}
        </Avatar>
      </div>
      
      <div className="w-full">
        <Label htmlFor="vehicle-image">Imagem do Veículo</Label>
        <div className="flex items-center gap-2 mt-1">
          <Input
            id="vehicle-image"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="flex-1"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Formatos suportados: JPG, PNG, GIF. Máximo: 5MB
        </p>
      </div>
    </div>
  );
};

export default VeiculoImageUpload;
