
import React from "react";
import { Image as ImageIcon } from "lucide-react";

interface VeiculoImageProps {
  imageUrl: string | null;
  alt: string;
}

const VeiculoImage: React.FC<VeiculoImageProps> = ({ imageUrl, alt }) => {
  return (
    <div className="flex justify-center items-center h-12 w-12">
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={alt} 
          className="h-10 w-10 object-cover rounded-md" 
        />
      ) : (
        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

export default VeiculoImage;
