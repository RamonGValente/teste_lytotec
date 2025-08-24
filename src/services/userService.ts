
import { supabase } from "@/integrations/supabase/client";
import { uploadImage } from "./storageService";

export const updateUserProfile = async (userId: string, data: { nome_completo?: string; email?: string }) => {
  const { error } = await supabase
    .from("profiles")
    .update(data)
    .eq("id", userId);

  if (error) throw error;
  return { success: true };
};

export const updateUserImage = async (userId: string, file: File) => {
  try {
    // Upload image to storage
    const imageUrl = await uploadImage(file, "avatars");

    // Update user profile with new image URL
    const { error } = await supabase
      .from("profiles")
      .update({ imagem_url: imageUrl })
      .eq("id", userId);

    if (error) throw error;
    return { success: true, imageUrl };
  } catch (error) {
    console.error("Error updating user image:", error);
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
};

// Add these functions for MainLayout
export const fetchCurrentUser = async () => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) throw sessionError;
  if (!sessionData.session) return null;
  
  return getUserProfile(sessionData.session.user.id);
};

export const updateUserProfileImage = async (userId: string, file: File): Promise<string | void> => {
  const result = await updateUserImage(userId, file);
  return result.imageUrl; // Return just the imageUrl string to match the expected return type
};
