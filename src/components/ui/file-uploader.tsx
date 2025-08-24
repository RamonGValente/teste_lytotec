
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  onFilesSelected: (files: FileList | null) => void;
  accept?: string;
  maxFiles?: number;
  label?: string;
  className?: string;
}

export function FileUploader({
  onFilesSelected,
  accept = "*",
  maxFiles = 1,
  label = "Arraste e solte seu arquivo aqui ou clique para selecionar",
  className,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    // Convert FileList to array and filter by accepted file types
    const fileArray = Array.from(files);
    
    // Check if the number of files exceeds the maximum
    if (fileArray.length > maxFiles) {
      alert(`Você só pode selecionar até ${maxFiles} arquivo(s).`);
      return;
    }
    
    setSelectedFiles(fileArray);
    onFilesSelected(files);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    
    // If we've removed all files, clear the input
    if (newFiles.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = '';
      onFilesSelected(null);
    } else {
      // Create a new FileList with the remaining files
      const dataTransfer = new DataTransfer();
      newFiles.forEach(file => dataTransfer.items.add(file));
      onFilesSelected(dataTransfer.files);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-gray-300 hover:bg-gray-50",
          className
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <div className="flex flex-col items-center justify-center">
          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mt-2">{label}</p>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Arquivos selecionados:</p>
          <ul className="space-y-1">
            {selectedFiles.map((file, index) => (
              <li
                key={`${file.name}-${index}`}
                className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
              >
                <span className="text-sm truncate">{file.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        className="hidden"
        accept={accept}
        multiple={maxFiles > 1}
      />
    </div>
  );
}
