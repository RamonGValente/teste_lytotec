
import React, { useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import AppHeader from "./AppHeader";
import { useSidebarState } from "@/hooks/useSidebarState";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useIsMobile } from "@/hooks/use-mobile";
import { PWAInstallBanner } from "@/components/pwa/PWAInstallBanner";
import { PWAUpdateNotification } from "@/components/pwa/PWAUpdateNotification";
import { OfflinePermissionStatus } from "@/components/pwa/OfflinePermissionStatus";
import { useOfflinePermissionsSync } from "@/hooks/useOfflinePermissionsSync";

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { openGroups, setOpenGroups, toggleGroup } = useSidebarState();
  const { user, isLoading, updateUserImage } = useUserProfile();
  const isMobile = useIsMobile();
  
  // Sincronizar permissões com contexto offline
  useOfflinePermissionsSync();

  // Update document title
  useEffect(() => {
    document.title = "Lytorânea Construtora - Sistema ERP";
  }, []);

  // Meta viewport otimizado para PWA
  useEffect(() => {
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.setAttribute('name', 'viewport');
      document.head.appendChild(viewportMeta);
    }
    
    // Configuração otimizada para PWA
    viewportMeta.setAttribute(
      'content', 
      'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover'
    );
    
    // Adicionar meta theme-color para PWA
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.setAttribute('name', 'theme-color');
      themeColorMeta.setAttribute('content', '#ffffff');
      document.head.appendChild(themeColorMeta);
    }
    
    return () => {
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0');
    };
  }, []);

  console.log("MainLayout rendering, user:", user ? "loaded" : "not loaded");

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
        
        {/* Componentes PWA */}
        <OfflinePermissionStatus />
        <PWAInstallBanner />
        <PWAUpdateNotification />
      </div>
    </SidebarProvider>
  );
}
