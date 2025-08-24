
import React from "react";
import { Clock, Mail, Phone, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const WaitingApproval: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const result = await logoutUser();
      if (result.success) {
        navigate("/login");
      } else {
        toast({
          title: "Erro no logout",
          description: result.error?.message || "Não foi possível fazer logout",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Aguardando Aprovação
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2 text-yellow-600">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Conta Pendente de Aprovação</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Sua conta foi criada com sucesso, mas ainda precisa ser aprovada por um administrador do sistema.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-medium text-blue-900">
              O que acontece agora?
            </h3>
            <ul className="text-xs text-blue-800 space-y-2 text-left">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
                <span>Um administrador irá revisar sua solicitação</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
                <span>Você receberá uma notificação quando aprovado</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></div>
                <span>Após aprovação, você poderá acessar o sistema</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900">
              Precisa de ajuda?
            </h3>
            <div className="text-xs text-gray-600 space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" />
                <span>contato@lytotoranea.com.br</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Phone className="h-4 w-4" />
                <span>(11) 1234-5678</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="w-full"
            >
              Fazer Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WaitingApproval;
