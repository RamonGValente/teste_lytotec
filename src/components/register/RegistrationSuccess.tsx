
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import AuthLayout from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Clock } from "lucide-react";

interface RegistrationSuccessProps {
  onCreateAnother: () => void;
}

const RegistrationSuccess: React.FC<RegistrationSuccessProps> = ({ onCreateAnother }) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const [autoRedirect, setAutoRedirect] = useState(true);

  useEffect(() => {
    if (!autoRedirect) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate("/login");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate, autoRedirect]);

  const handleManualRedirect = () => {
    setAutoRedirect(false);
    navigate("/login");
  };

  const handleCancelAutoRedirect = () => {
    setAutoRedirect(false);
  };

  return (
    <AuthLayout title="Conta Criada!" description="Seu cadastro foi realizado com sucesso">
      <div className="space-y-6 text-center">
        <div className="mx-auto h-20 w-20 rounded-full bg-green-100 flex items-center justify-center animate-scale-in">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        
        <Alert className="text-left border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="space-y-3">
            <div className="font-medium text-green-800">
              Parabéns! Sua conta foi criada com sucesso! 🎉
            </div>
            <div className="text-sm text-green-700">
              Agora você precisa aguardar que um administrador aprove sua conta e configure suas permissões de acesso.
            </div>
            <div className="text-sm text-green-600">
              Você será notificado por email quando sua conta estiver aprovada e pronta para uso.
            </div>
          </AlertDescription>
        </Alert>

        {autoRedirect && (
          <Alert className="border-blue-200 bg-blue-50">
            <Clock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              <div className="flex items-center justify-between">
                <span>Redirecionando para login em {countdown}s</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleCancelAutoRedirect}
                  className="text-blue-600 hover:text-blue-800 p-1 h-auto"
                >
                  Cancelar
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3 pt-2">
          <Button 
            onClick={handleManualRedirect} 
            className="w-full"
            size="lg"
          >
            Ir para Login Agora
          </Button>
          <Button 
            variant="outline" 
            onClick={onCreateAnother} 
            className="w-full"
            size="lg"
          >
            Cadastrar Outra Conta
          </Button>
        </div>

        <div className="text-xs text-muted-foreground pt-4 border-t">
          <p>💡 <strong>Dica:</strong> Guarde suas credenciais em local seguro</p>
          <p>Em caso de dúvidas, entre em contato com o RH</p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default RegistrationSuccess;
