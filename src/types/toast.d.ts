
import { ToasterToast } from '@/components/ui/toast';

export interface ToastApi {
  toast: (props: {
    title?: string;
    description?: string;
    variant?: "default" | "destructive";
    duration?: number;
  }) => {
    id: string;
    dismiss: () => void;
    update: (props: ToasterToast) => void;
  };
  dismiss: (toastId?: string) => void;
}
