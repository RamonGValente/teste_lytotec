
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AuthLayout from "@/components/AuthLayout";
import RegistrationSuccess from "@/components/register/RegistrationSuccess";
import EmailValidationFeedback from "@/components/register/EmailValidationFeedback";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { registerUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";

const registerSchema = z
  .object({
    nome_completo: z.string().min(3, "Nome completo deve ter pelo menos 3 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  
  const { isAuthorized, isChecking, error: emailError, verifyEmail, clearVerification } = useEmailVerification();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nome_completo: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const watchedEmail = form.watch("email");

  // Verificação de email em tempo real com debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (watchedEmail && watchedEmail.includes('@')) {
        verifyEmail(watchedEmail);
      } else {
        clearVerification();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [watchedEmail, verifyEmail, clearVerification]);

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setGeneralError(null);
    
    try {
      console.log("📧 Iniciando processo de registro para:", data.email);
      
      // Verificação final do email antes do registro
      if (!isAuthorized) {
        const isEmailAuthorized = await verifyEmail(data.email);
        if (!isEmailAuthorized) {
          setIsLoading(false);
          return;
        }
      }

      console.log("✅ Email autorizado, prosseguindo com o registro...");
      
      const result = await registerUser(
        data.email, 
        data.password, 
        data.nome_completo
      );

      if (result.success) {
        // Garantir que o profile seja criado com funcao_permissao = NULL
        if (result.data?.user?.id) {
          console.log("👤 Criando perfil do usuário...");
          await supabase
            .from('profiles')
            .update({ funcao_sistema: 'Usuário' })
            .eq('id', result.data.user.id);
        }

        console.log("🎉 Registro concluído com sucesso!");
        setIsRegistered(true);
        toast({
          title: "Conta criada com sucesso! 🎉",
          description: "Aguarde a aprovação do administrador para acessar o sistema",
        });
      } else {
        console.error("❌ Falha no registro:", result.error);
        const errorMessage = result.error?.message || "Ocorreu um erro ao criar sua conta";
        setGeneralError(errorMessage);
        toast({
          title: "Falha no registro",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("❌ Exceção durante o registro:", error);
      
      let errorMessage = "Ocorreu um erro inesperado. Tente novamente.";
      
      if (error.message?.includes('row-level security') || error.message?.includes('permission')) {
        errorMessage = "Erro de permissão. Contate o suporte técnico.";
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
      }
      
      setGeneralError(errorMessage);
      toast({
        title: "Erro no cadastro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAnother = () => {
    setIsRegistered(false);
    form.reset();
    clearVerification();
    setGeneralError(null);
  };

  if (isRegistered) {
    return <RegistrationSuccess onCreateAnother={handleCreateAnother} />;
  }

  const canSubmit = isAuthorized && !isChecking && !emailError;

  return (
    <AuthLayout title="Criar Conta" description="Junte-se à Lytorânea Construtora">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {generalError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{generalError}</AlertDescription>
            </Alert>
          )}
          
          <FormField
            control={form.control}
            name="nome_completo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo *</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="João da Silva" 
                    {...field}
                    disabled={isLoading}
                    aria-describedby="nome-help"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Corporativo *</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="joao@empresa.com" 
                    {...field}
                    disabled={isLoading}
                    aria-describedby="email-help email-validation"
                  />
                </FormControl>
                <div id="email-validation">
                  <EmailValidationFeedback
                    isChecking={isChecking}
                    isAuthorized={isAuthorized}
                    error={emailError}
                    email={watchedEmail}
                  />
                </div>
                <FormMessage />
                <div id="email-help" className="text-xs text-muted-foreground">
                  Use apenas emails autorizados pela empresa
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha *</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Mínimo 6 caracteres" 
                    {...field}
                    disabled={isLoading}
                    aria-describedby="password-help"
                  />
                </FormControl>
                <FormMessage />
                <div id="password-help" className="text-xs text-muted-foreground">
                  Crie uma senha segura com pelo menos 6 caracteres
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar Senha *</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Digite a senha novamente" 
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !canSubmit}
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isChecking ? "Verificando email..." : "Criando conta..."}
              </>
            ) : (
              "Criar Conta"
            )}
          </Button>
          
          {!canSubmit && watchedEmail && (
            <div className="text-center text-sm text-muted-foreground">
              {isChecking ? "Verificando autorização..." : "Aguarde a verificação do email para continuar"}
            </div>
          )}
        </form>
      </Form>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Já tem uma conta?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Fazer login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Register;
