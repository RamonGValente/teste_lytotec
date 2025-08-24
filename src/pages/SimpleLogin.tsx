import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthLayout from "@/components/AuthLayout";
import { loginUser } from "@/lib/auth";
import { useAuthRecovery } from "@/hooks/useAuthRecovery";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, CheckCircle, RefreshCw, UserPlus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const loginSchema = z.object({
  email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const SimpleLogin: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { recoverUser, isRecovering } = useAuthRecovery();
  const [isLoading, setIsLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showRecovery, setShowRecovery] = useState(false);
  const [errorType, setErrorType] = useState<'credentials' | 'confirmation' | 'other' | null>(null);

  // Verificar sessão existente de forma simplificada
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('🔐 [SimpleLogin] Verificando sessão existente...');
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          console.log('🔐 [SimpleLogin] Sessão ativa detectada, redirecionando...');
          navigate("/dashboard", { replace: true });
          return;
        }
        console.log('🔐 [SimpleLogin] Nenhuma sessão ativa');
      } catch (error) {
        console.error('❌ [SimpleLogin] Erro ao verificar sessão:', error);
      }
      setAuthChecked(true);
    };
    
    checkSession();
  }, [navigate]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const analyzeError = (errorMessage: string, email: string) => {
    console.log(`🔍 [SimpleLogin] Analisando erro para ${email}: ${errorMessage}`);
    
    if (errorMessage.includes("Invalid login credentials")) {
      setErrorType('credentials');
      setLoginError(`Credenciais inválidas para ${email}`);
      setShowRecovery(true);
    } else if (errorMessage.includes("Email not confirmed")) {
      setErrorType('confirmation');
      setLoginError("Email não confirmado - precisa ser confirmado primeiro");
      setShowRecovery(true);
    } else if (errorMessage.includes("Signups not allowed")) {
      setErrorType('other');
      setLoginError("Registro não permitido para este email");
      setShowRecovery(false);
    } else {
      setErrorType('other');
      setLoginError(errorMessage);
      setShowRecovery(false);
    }
  };

  const handleRecovery = async (email: string) => {
    console.log(`🚀 [SimpleLogin] Iniciando recuperação para: ${email}`);
    
    const result = await recoverUser(email);
    
    if (result.success) {
      setShowRecovery(false);
      setLoginError(null);
      setErrorType(null);
      
      // Tentar login automaticamente após recuperação
      const password = form.getValues("password");
      if (password) {
        toast({
          title: "Usuário recuperado! 🎉",
          description: "Tentando login automaticamente...",
        });
        
        setTimeout(() => {
          onSubmit({ email, password });
        }, 1500);
      }
    } else if (result.needsRegistration) {
      toast({
        title: "Registro necessário",
        description: "Redirecionando para a página de registro...",
      });
      setTimeout(() => {
        navigate("/register");
      }, 1500);
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setLoginError(null);
    setErrorType(null);
    setShowRecovery(false);
    
    try {
      console.log(`🔐 [SimpleLogin] Tentativa de login: ${data.email}`);
      
      const result = await loginUser(data.email, data.password);
      
      if (result.error) {
        console.error(`❌ [SimpleLogin] Erro no login para ${data.email}:`, result.error);
        analyzeError(result.error.message, data.email);
        return;
      }
      
      console.log(`🚀 [SimpleLogin] Login bem-sucedido para: ${data.email}`);
      
      queryClient.clear();
      
      toast({
        title: "Login realizado com sucesso ✅",
        description: "Redirecionando para o dashboard...",
      });
      
      navigate("/dashboard", { replace: true });
      
    } catch (error: any) {
      console.error(`❌ [SimpleLogin] Exceção no login para ${data.email}:`, error);
      setErrorType('other');
      setLoginError(error.message || "Erro inesperado no login");
    } finally {
      setIsLoading(false);
    }
  };

  if (!authChecked) {
    return (
      <AuthLayout title="Verificando...">
        <div className="flex justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </AuthLayout>
    );
  }

  const getErrorIcon = () => {
    switch (errorType) {
      case 'credentials':
        return <AlertTriangle className="h-4 w-4" />;
      case 'confirmation':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getRecoveryButtonText = () => {
    switch (errorType) {
      case 'credentials':
        return "Recuperar Usuário";
      case 'confirmation':
        return "Confirmar Email";
      default:
        return "Tentar Recuperação";
    }
  };

  return (
    <AuthLayout title="Acesso ao Sistema">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {loginError && (
            <Alert variant="destructive">
              {getErrorIcon()}
              <AlertDescription>
                <div className="space-y-3">
                  <div>
                    <strong>Erro de Login:</strong> {loginError}
                  </div>
                  {showRecovery && (
                    <>
                      <div className="text-sm">
                        {errorType === 'credentials' && 
                          "Este usuário pode ter problemas de autenticação. Clique abaixo para tentar recuperar automaticamente."
                        }
                        {errorType === 'confirmation' && 
                          "O email não foi confirmado. Clique abaixo para confirmar automaticamente."
                        }
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRecovery(form.getValues("email"))}
                        disabled={isRecovering}
                        className="w-full"
                      >
                        {isRecovering ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Recuperando...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {getRecoveryButtonText()}
                          </>
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="exemplo@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="******" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-primary hover:underline">
              Esqueceu sua senha?
            </Link>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>
      </Form>
      <div className="mt-4 text-center text-sm">
        Não tem uma conta?{" "}
        <Link to="/register" className="text-primary hover:underline flex items-center justify-center gap-1 mt-2">
          <UserPlus className="h-4 w-4" />
          Registrar-se
        </Link>
      </div>
    </AuthLayout>
  );
};

export default SimpleLogin;
