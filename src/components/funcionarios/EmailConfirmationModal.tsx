
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuthRecovery } from "@/hooks/useAuthRecovery";
import { confirmUserEmail, confirmUserEmailWithPassword } from "@/services/adminService";
import { diagnoseUser } from "@/services/authRecoveryService";
import { Loader2, Mail, UserCheck, AlertTriangle, CheckCircle2, RefreshCw, Search, Key, Copy } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

interface EmailConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

interface DiagnosisResult {
  funcionario: any;
  userExistsInAuth: boolean;
  recommendations: string;
}

const EmailConfirmationModal: React.FC<EmailConfirmationModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = ""
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmingWithPassword, setIsConfirmingWithPassword] = useState(false);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [showDiagnosis, setShowDiagnosis] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const { toast } = useToast();
  const { recoverUser, isRecovering } = useAuthRecovery();

  // Reset ao abrir modal
  useEffect(() => {
    if (isOpen) {
      setEmail(defaultEmail);
      setDiagnosis(null);
      setShowDiagnosis(false);
      setTemporaryPassword(null);
    }
  }, [isOpen, defaultEmail]);

  const handleDiagnoseUser = async () => {
    if (!email.trim()) {
      toast({
        title: "Erro",
        description: "Digite um email válido para diagnóstico",
        variant: "destructive",
      });
      return;
    }

    setIsDiagnosing(true);
    try {
      console.log(`🔍 Iniciando diagnóstico para: ${email}`);
      const result = await diagnoseUser(email);
      setDiagnosis(result);
      setShowDiagnosis(true);
      
      console.log('📋 Resultado do diagnóstico:', result);
      
      toast({
        title: "Diagnóstico concluído",
        description: `Usuário ${result.funcionario ? 'encontrado' : 'não encontrado'} na base de funcionários`,
      });
    } catch (error: any) {
      console.error('❌ Erro no diagnóstico:', error);
      toast({
        title: "Erro no diagnóstico",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleConfirmEmail = async () => {
    if (!email.trim()) {
      toast({
        title: "Erro",
        description: "Digite um email válido",
        variant: "destructive",
      });
      return;
    }

    setIsConfirming(true);
    try {
      console.log(`🔧 Confirmando email: ${email}`);
      await confirmUserEmail(email);
      toast({
        title: "Sucesso ✅",
        description: `Email ${email} confirmado com sucesso!`,
      });
      
      // Reset e fechar modal
      setEmail("");
      setDiagnosis(null);
      setShowDiagnosis(false);
      setTemporaryPassword(null);
      onClose();
    } catch (error: any) {
      console.error('❌ Erro ao confirmar email:', error);
      toast({
        title: "Erro ao confirmar email",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleConfirmEmailWithPassword = async () => {
    if (!email.trim()) {
      toast({
        title: "Erro",
        description: "Digite um email válido",
        variant: "destructive",
      });
      return;
    }

    setIsConfirmingWithPassword(true);
    try {
      console.log(`🔑 Confirmando email com senha temporária: ${email}`);
      const result = await confirmUserEmailWithPassword(email);
      
      if (result.success) {
        if (result.temporaryPassword) {
          setTemporaryPassword(result.temporaryPassword);
          toast({
            title: "Sucesso! 🎉",
            description: `Email confirmado e senha temporária criada para ${email}`,
          });
        } else {
          toast({
            title: "Sucesso ✅",
            description: `Email ${email} confirmado com sucesso!`,
          });
        }
      } else {
        toast({
          title: "Erro na confirmação",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('❌ Erro ao confirmar email com senha:', error);
      toast({
        title: "Erro ao confirmar email com senha",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsConfirmingWithPassword(false);
    }
  };

  const handleRecoverUser = async () => {
    if (!email.trim()) {
      toast({
        title: "Erro",
        description: "Digite um email válido",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log(`🚀 Iniciando recuperação para: ${email}`);
      const result = await recoverUser(email);
      
      if (result.success) {
        toast({
          title: "Usuário recuperado com sucesso! ✅",
          description: "O usuário agora pode fazer login normalmente.",
        });
        
        // Reset e fechar modal
        setEmail("");
        setDiagnosis(null);
        setShowDiagnosis(false);
        setTemporaryPassword(null);
        onClose();
      } else if (result.needsRegistration) {
        toast({
          title: "Registro necessário",
          description: "Este usuário precisa se registrar primeiro através da página de registro.",
        });
      }
    } catch (error: any) {
      console.error('❌ Erro na recuperação:', error);
      toast({
        title: "Erro na recuperação",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCopyPassword = () => {
    if (temporaryPassword) {
      navigator.clipboard.writeText(temporaryPassword);
      toast({
        title: "Copiado! 📋",
        description: "Senha temporária copiada para a área de transferência",
      });
    }
  };

  const handleClose = () => {
    setEmail("");
    setDiagnosis(null);
    setShowDiagnosis(false);
    setTemporaryPassword(null);
    onClose();
  };

  const getDiagnosisIcon = () => {
    if (!diagnosis) return <Search className="h-4 w-4" />;
    
    if (diagnosis.funcionario && diagnosis.userExistsInAuth) {
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    } else if (diagnosis.funcionario && !diagnosis.userExistsInAuth) {
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    } else {
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  const getDiagnosisColor = () => {
    if (!diagnosis) return "border-gray-200";
    
    if (diagnosis.funcionario && diagnosis.userExistsInAuth) {
      return "border-green-200 bg-green-50";
    } else if (diagnosis.funcionario && !diagnosis.userExistsInAuth) {
      return "border-yellow-200 bg-yellow-50";
    } else {
      return "border-red-200 bg-red-50";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Sistema de Recuperação de Usuários
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Campo de Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email do usuário</Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isConfirming || isRecovering || isDiagnosing || isConfirmingWithPassword}
            />
          </div>

          {/* Botão de Diagnóstico */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={handleDiagnoseUser}
              disabled={isDiagnosing || !email.trim()}
              className="w-full"
            >
              {isDiagnosing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Diagnosticando...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Diagnosticar Usuário
                </>
              )}
            </Button>
          </div>

          {/* Resultado do Diagnóstico */}
          {showDiagnosis && diagnosis && (
            <>
              <Separator />
              <Alert className={getDiagnosisColor()}>
                {getDiagnosisIcon()}
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="font-semibold">Resultado do Diagnóstico:</div>
                    <div className="text-sm space-y-1">
                      <div>• <strong>Funcionário:</strong> {diagnosis.funcionario ? `✅ ${diagnosis.funcionario.nome_completo}` : '❌ Não encontrado'}</div>
                      <div>• <strong>Auth Supabase:</strong> {diagnosis.userExistsInAuth ? '✅ Existe' : '❌ Não existe'}</div>
                      <div>• <strong>Recomendação:</strong> {diagnosis.recommendations}</div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </>
          )}

          {/* Senha Temporária */}
          {temporaryPassword && (
            <>
              <Separator />
              <Alert className="border-green-200 bg-green-50">
                <Key className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  <div className="space-y-3">
                    <div className="font-semibold text-green-800">Senha Temporária Criada! 🎉</div>
                    <div className="text-sm">
                      <div>Use esta senha para fazer login:</div>
                      <div className="flex items-center gap-2 mt-2">
                        <code className="bg-white px-2 py-1 rounded border text-green-700 font-mono">
                          {temporaryPassword}
                        </code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCopyPassword}
                          className="p-1 h-7 w-7"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="text-xs text-green-600 mt-2">
                        ⚠️ Troque esta senha após o primeiro login por segurança
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            </>
          )}

          {/* Ações Disponíveis */}
          {showDiagnosis && diagnosis && !temporaryPassword && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground font-medium">
                  Ações disponíveis:
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  {/* Confirmação de Email Apenas */}
                  <Button
                    variant="outline"
                    onClick={handleConfirmEmail}
                    disabled={isConfirming || !diagnosis.funcionario}
                    className="w-full"
                  >
                    {isConfirming ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Confirmando...
                      </>
                    ) : (
                      <>
                        <UserCheck className="mr-2 h-4 w-4" />
                        Confirmar Email Apenas
                      </>
                    )}
                  </Button>

                  {/* Confirmação com Senha Temporária */}
                  <Button
                    variant="default"
                    onClick={handleConfirmEmailWithPassword}
                    disabled={isConfirmingWithPassword || !diagnosis.funcionario}
                    className="w-full"
                  >
                    {isConfirmingWithPassword ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Key className="mr-2 h-4 w-4" />
                        Confirmar Email + Senha Temporária
                      </>
                    )}
                  </Button>

                  {/* Recuperação Completa */}
                  <Button
                    variant="secondary"
                    onClick={handleRecoverUser}
                    disabled={isRecovering || !diagnosis.funcionario}
                    className="w-full"
                  >
                    {isRecovering ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Recuperando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Recuperação Completa
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Instruções */}
          <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded-md">
            <div className="font-semibold mb-1">Como usar:</div>
            <div className="space-y-1">
              <div>1. Digite o email e clique em "Diagnosticar"</div>
              <div>2. Analise o resultado do diagnóstico</div>
              <div>3. Use "Confirmar Email + Senha Temporária" para correção definitiva</div>
              <div>4. Use "Recuperação Completa" para problemas complexos</div>
              <div>5. Compartilhe a senha temporária com o usuário</div>
            </div>
          </div>

          {/* Botões de Controle */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isConfirming || isRecovering || isDiagnosing || isConfirmingWithPassword}
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailConfirmationModal;
