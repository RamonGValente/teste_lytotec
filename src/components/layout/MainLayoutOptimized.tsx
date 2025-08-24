
import React, { useEffect, memo } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import AppHeader from "./AppHeader";
import { useSidebarState } from "@/hooks/useSidebarState";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useIsMobile } from "@/hooks/use-mobile";
import { PWAInstallBanner } from "@/components/pwa/PWAInstallBanner";
import { PWAUpdateNotification } from "@/components/pwa/PWAUpdateNotification";
import { OfflineIndicator } from "@/components/pwa/OfflineIndicator";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayoutOptimized = memo(({ children }: MainLayoutProps) => {
  const { openGroups, setOpenGroups, toggleGroup } = useSidebarState();
  const { user, isLoading, updateUserImage } = useUserProfile();
  const isMobile = useIsMobile();

  // Update document title apenas uma vez
  useEffect(() => {
    document.title = "Lytorânea Construtora - Sistema ERP";
  }, []);

  // Meta viewport otimizado - apenas uma vez
  useEffect(() => {
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.setAttribute('name', 'viewport');
      document.head.appendChild(viewportMeta);
    }
    
    viewportMeta.setAttribute(
      'content', 
      'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover'
    );
    
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.setAttribute('name', 'theme-color');
      themeColorMeta.setAttribute('content', '#ffffff');
      document.head.appendChild(themeColorMeta);
    }
  }, []);

  console.log("MainLayout rendering optimized, user:", user ? "loaded" : "loading");

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        
        <SidebarInset className="flex-1 overflow-hidden">
          <div className="flex flex-col h-screen">
            <AppHeader 
              user={!isLoading ? user : null}
              updateUserImage={updateUserImage}
            />
            
            <main className="flex-1 overflow-auto p-1 sm:p-2 md:p-4 lg:p-6">
              <div className="max-w-full mx-auto">
                {children}
              </div>
            </main>
          </div>
        </SidebarInset>
        
        {/* Componentes PWA memoizados */}
        <OfflineIndicator />
        <PWAInstallBanner />
        <PWAUpdateNotification />
      </div>
    </SidebarProvider>
  );
});

MainLayoutOptimized.displayName = 'MainLayoutOptimized';

export default MainLayoutOptimized;
