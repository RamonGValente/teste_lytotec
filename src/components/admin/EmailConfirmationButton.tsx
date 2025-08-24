
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { confirmSpecificUserEmail } from "@/services/adminService";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, AlertCircle } from "lucide-react";

const EmailConfirmationButton: React.FC = () => {
  const [isConfirming, setIsConfirming] = useState(false);
  const { toast } = useToast();

  const handleConfirmEmail = async () => {
    setIsConfirming(true);
    try {
      await confirmSpecificUserEmail();
      toast({
        title: "Email confirmado com sucesso! ✅",
        description: "O usuário xmatheus457@gmail.com agora pode fazer login.",
      });
    } catch (error: any) {
      console.error("Erro ao confirmar email:", error);
      toast({
        title: "Erro ao confirmar email",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-3">
        <AlertCircle className="h-5 w-5 text-yellow-500" />
        <h3 className="font-medium">Confirmar Email de Usuário</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-3">
        Confirmar email do usuário xmatheus457@gmail.com para permitir login.
      </p>
      <Button
        onClick={handleConfirmEmail}
        disabled={isConfirming}
        className="w-full"
      >
        {isConfirming ? (
          <>
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
            Confirmando...
          </>
        ) : (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Confirmar Email
          </>
        )}
      </Button>
    </div>
  );
};

export default EmailConfirmationButton;
