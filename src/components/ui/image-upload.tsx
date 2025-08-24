
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ImageUploadProps extends React.HTMLAttributes<HTMLDivElement> {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  existingImages?: string[];
  isLoading?: boolean;
}

export function ImageUpload({
  onFilesSelected,
  maxFiles = 5,
  existingImages = [],
  isLoading = false,
  className,
  ...props
}: ImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.type.startsWith("image/"));
    
    // Check if adding these files would exceed the limit
    if (validFiles.length + selectedFiles.length + existingImages.length > maxFiles) {
      alert(`Você só pode fazer upload de até ${maxFiles} imagens no total.`);
      return;
    }
    
    // Create preview URLs for the valid files
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    onFilesSelected([...selectedFiles, ...validFiles]);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove a selected file
  const removeFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    
    onFilesSelected(selectedFiles.filter((_, i) => i !== index));
  };

  // Clean up URLs when component unmounts
  React.useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const totalImages = selectedFiles.length + existingImages.length;
  
  return (
    <div 
      className={cn("space-y-4", className)}
      {...props}
    >
      {/* Image preview grid */}
      {(previewUrls.length > 0 || existingImages.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Show existing images */}
          {existingImages.map((url, index) => (
            <div 
              key={`existing-${index}`} 
              className="relative aspect-square rounded-md overflow-hidden border bg-background"
            >
              <img
                src={url}
                alt={`Imagem ${index + 1}`}
                className="h-full w-full object-cover"
              />
              {/* We don't allow removing existing images in this interface */}
            </div>
          ))}
          
          {/* Show newly selected files */}
          {previewUrls.map((url, index) => (
            <div 
              key={`preview-${index}`} 
              className="relative aspect-square rounded-md overflow-hidden border bg-background"
            >
              <img
                src={url}
                alt={`Preview ${index + 1}`}
                className="h-full w-full object-cover"
              />
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-1 right-1 h-6 w-6 rounded-full"
                onClick={() => removeFile(index)}
                disabled={isLoading}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
          
          {/* Add more button if under limit */}
          {totalImages < maxFiles && (
            <button
              type="button"
              className="border border-dashed rounded-md flex items-center justify-center aspect-square bg-muted/50 hover:bg-muted/80 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <Plus className="h-8 w-8 mb-1" />
                <span className="text-xs">Adicionar</span>
              </div>
            </button>
          )}
        </div>
      )}
      
      {/* Upload button - shown only if no images are uploaded yet */}
      {totalImages === 0 && (
        <div 
          className="border border-dashed rounded-md p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center">
            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium">Clique para fazer upload</h3>
            <p className="text-sm text-muted-foreground mt-1">
              ou arraste e solte suas imagens aqui
            </p>
          </div>
        </div>
      )}
      
      {/* Counter */}
      <div className="text-sm text-muted-foreground">
        {totalImages} de {maxFiles} imagens
      </div>
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple={maxFiles > 1}
        className="hidden"
        disabled={isLoading || totalImages >= maxFiles}
      />
    </div>
  );
}
