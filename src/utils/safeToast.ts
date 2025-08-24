
import { toast } from "@/hooks/use-toast";

// Enhanced SafeToast com detecção de erros da plataforma
export const safeToast = {
  success: (message: string, options?: any) => {
    try {
      toast({
        title: "Sucesso",
        description: message,
        variant: "default",
        ...options
      });
    } catch (error: any) {
      // Silenciar erros TypeID da plataforma
      if (error?.message?.includes('TypeID') || error?.message?.includes('UserMessageID')) {
        console.warn('🔇 Platform toast error silenciado:', error.message);
        // Fallback para console em caso de erro da plataforma
        console.info(`✅ ${message}`);
        return;
      }
      console.warn('Toast falhou:', error);
    }
  },
  
  error: (message: string, options?: any) => {
    try {
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
        ...options
      });
    } catch (error: any) {
      // Silenciar erros TypeID da plataforma
      if (error?.message?.includes('TypeID') || error?.message?.includes('UserMessageID')) {
        console.warn('🔇 Platform toast error silenciado:', error.message);
        // Fallback para console em caso de erro da plataforma
        console.error(`❌ ${message}`);
        return;
      }
      console.warn('Toast falhou:', error);
    }
  },
  
  info: (message: string, options?: any) => {
    try {
      toast({
        title: "Informação",
        description: message,
        variant: "default",
        ...options
      });
    } catch (error: any) {
      // Silenciar erros TypeID da plataforma
      if (error?.message?.includes('TypeID') || error?.message?.includes('UserMessageID')) {
        console.warn('🔇 Platform toast error silenciado:', error.message);
        // Fallback para console em caso de erro da plataforma
        console.info(`ℹ️ ${message}`);
        return;
      }
      console.warn('Toast falhou:', error);
    }
  },

  // Método para limpar backups de formulários antigos
  clearFormBackups: () => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('form_backup')) {
          const backup = JSON.parse(localStorage.getItem(key) || '{}');
          // Remove backups com mais de 24h
          if (Date.now() - backup.timestamp > 24 * 60 * 60 * 1000) {
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn('Erro ao limpar backups:', error);
    }
  }
};
