
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, ChevronLeft, Home } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, isLoading } = useAuth();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Aguardar carregamento da autenticação antes de redirecionar
  useEffect(() => {
    if (isLoading) return; // Não redirecionar enquanto verifica autenticação

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirecionar baseado no estado de autenticação
          if (userId) {
            navigate("/dashboard", { replace: true });
          } else {
            navigate("/login", { replace: true });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, userId, isLoading]);

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    if (userId) {
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  };

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white shadow-md rounded-lg max-w-md w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const redirectTarget = userId ? "Dashboard" : "Login";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white shadow-md rounded-lg max-w-md w-full">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-16 w-16 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Página não encontrada</h1>
        <p className="text-gray-600 mb-4">
          A página "{location.pathname}" não existe ou não está disponível.
        </p>
        
        {/* Countdown de redirecionamento */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-700 text-sm">
            Você será redirecionado automaticamente para {redirectTarget} em{" "}
            <span className="font-bold text-blue-900">{countdown}</span> segundos.
          </p>
        </div>
        
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button variant="outline" onClick={handleGoBack} className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Button onClick={handleGoHome} className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Ir para {redirectTarget}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
