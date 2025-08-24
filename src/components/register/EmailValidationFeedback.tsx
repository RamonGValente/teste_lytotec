
import React from 'react';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmailValidationFeedbackProps {
  isChecking: boolean;
  isAuthorized: boolean;
  error: string | null;
  email: string;
}

const EmailValidationFeedback: React.FC<EmailValidationFeedbackProps> = ({
  isChecking,
  isAuthorized,
  error,
  email
}) => {
  if (!email || !email.includes('@')) return null;

  if (isChecking) {
    return (
      <div className="flex items-center space-x-2 text-sm text-blue-600 mt-1">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Verificando autorização do email...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start space-x-2 text-sm text-red-600 mt-1">
        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <div>
          <div className="font-medium">{error}</div>
          <div className="text-xs text-red-500 mt-1">
            Entre em contato com o RH para autorizar seu email
          </div>
        </div>
      </div>
    );
  }

  if (isAuthorized) {
    return (
      <div className="flex items-center space-x-2 text-sm text-green-600 mt-1">
        <CheckCircle className="h-4 w-4" />
        <span className="font-medium">Email autorizado! Você pode prosseguir com o cadastro.</span>
      </div>
    );
  }

  return null;
};

export default EmailValidationFeedback;
