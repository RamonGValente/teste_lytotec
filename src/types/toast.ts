
import { ToastActionElement } from "@/components/ui/toast";

export interface Toast {
  title?: string;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: "default" | "destructive";
}

export type ToastApi = {
  toast: (props: Toast) => void;
  dismiss: (toastId?: string) => void;
};
