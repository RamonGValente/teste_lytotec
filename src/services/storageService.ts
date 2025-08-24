
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

export const uploadImage = async (file: File, bucketName: string): Promise<string> => {
  try {
    console.log(`Starting upload to ${bucketName} bucket...`);
    
    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${fileName}`;
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error(`Error uploading file to ${bucketName}:`, error);
      throw error;
    }
    
    console.log(`File uploaded successfully to ${bucketName}:`, filePath);
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    console.log("Public URL:", urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error(`Error in uploadImage to ${bucketName}:`, error);
    throw error;
  }
};

// Export the function with a different name for backward compatibility
export const uploadFile = uploadImage;
