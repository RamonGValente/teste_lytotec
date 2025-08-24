
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  autoComplete,
  autoFocus = false,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {error && <span className="text-destructive text-xs">{error}</span>}
      </div>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={cn("auth-input", error && "border-destructive")}
        required={required}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
      />
    </div>
  );
};

interface AuthFormProps {
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  error?: string;
  children: React.ReactNode;
  submitText: string;
}

const AuthForm: React.FC<AuthFormProps> = ({
  onSubmit,
  isLoading = false,
  error,
  children,
  submitText,
}) => {
  return (
    <form onSubmit={onSubmit} className="auth-form">
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm mb-6 animate-fade-in">
          {error}
        </div>
      )}
      
      {children}
      
      <Button 
        type="submit" 
        className="auth-button w-full" 
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Carregando...
          </div>
        ) : (
          submitText
        )}
      </Button>
    </form>
  );
};

export { AuthForm, FormField };
