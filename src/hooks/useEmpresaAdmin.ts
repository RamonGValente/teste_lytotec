import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  email: string;
  user_metadata?: {
    role?: string;
  };
}

export const useEmpresaAdmin = (user: User | null = null) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        // If user is passed as a prop, use it
        if (user) {
          const hasAdminRole = user.user_metadata?.role === 'admin';
          setIsAdmin(hasAdminRole);
          setIsLoading(false);
          return;
        }

        // Otherwise get current user
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (!currentUser) {
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }

        // Check if user has admin role
        const hasAdminRole = currentUser.user_metadata?.role === 'admin';
        setIsAdmin(hasAdminRole);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdmin();
  }, [user]);

  return { isAdmin, isLoading };
};
