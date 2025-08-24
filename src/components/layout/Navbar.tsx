
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, Maximize, Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import UserMenu from "@/components/user/UserMenu";
import UserProfileModal from "@/components/user/UserProfileModal";
import UserImageEditModal from "@/components/user/UserImageEditModal";
import UserAccountModal from "@/components/user/UserAccountModal";
import { getCurrentUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isImageEditModalOpen, setIsImageEditModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();
  
  // Example notification count
  const notificationCount = 3;

  React.useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        
        if (user) {
          // Get user profile from profiles table
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (error) {
            console.error("Error loading user profile:", error);
            setCurrentUser(user);
          } else {
            setCurrentUser({
              ...user,
              ...profile
            });
          }
          
          console.log("Navbar: Current user loaded:", user.email);
        }
      } catch (error) {
        console.error("Error loading current user in Navbar:", error);
      }
    };
    
    loadCurrentUser();
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Error attempting to enable full-screen mode: ${e.message}`);
      });
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  const handleImageUpdate = async (file: File): Promise<void> => {
    try {
      if (!currentUser) {
        throw new Error("Nenhum usuário autenticado");
      }
      
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;
      
      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type
        });
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      // Update profiles table with new image URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ imagem_url: publicUrl })
        .eq('id', currentUser.id);
        
      if (updateError) throw updateError;
      
      // Update local state
      setCurrentUser({
        ...currentUser,
        imagem_url: publicUrl
      });
      
      toast({
        title: "Imagem atualizada",
        description: "Sua imagem de perfil foi atualizada com sucesso",
      });
    } catch (error) {
      console.error("Error updating profile image:", error);
      toast({
        title: "Erro ao atualizar imagem",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-full items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="text-lg font-semibold hidden md:block">Dashboard</div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <Badge
                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0"
                variant="destructive"
              >
                {notificationCount}
              </Badge>
            )}
          </Button>
          
          <Button variant="ghost" size="icon" onClick={toggleFullScreen}>
            <Maximize className="h-5 w-5" />
          </Button>
          
          <UserMenu 
            onProfileClick={() => setIsProfileModalOpen(true)}
            onAccountClick={() => setIsAccountModalOpen(true)}
            onImageClick={() => setIsImageEditModalOpen(true)}
            userImage={currentUser?.imagem_url}
            userName={currentUser?.nome_completo || currentUser?.email}
          />
        </div>
      </div>
      
      {/* User Profile Modal */}
      <UserProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={currentUser}
      />
      
      {/* User Image Edit Modal */}
      <UserImageEditModal
        isOpen={isImageEditModalOpen}
        onClose={() => setIsImageEditModalOpen(false)}
        onImageUpdate={handleImageUpdate}
        currentImage={currentUser?.imagem_url}
      />

      {/* User Account Modal */}
      <UserAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        userProfile={currentUser}
      />
    </header>
  );
};

export default Navbar;
