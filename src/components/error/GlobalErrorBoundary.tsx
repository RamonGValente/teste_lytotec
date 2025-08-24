import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorType: 'platform' | 'app' | 'unknown';
}

class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorType: 'unknown' };
  }

  static getDerivedStateFromError(error: Error): State {
    // Detectar se é erro da plataforma Lovable
    const isPlatformError = 
      error.message?.includes('UserMessageID') ||
      error.message?.includes('TypeID') ||
      error.message?.includes('must be a valid') ||
      error.stack?.includes('lovable');

    return {
      hasError: true,
      errorType: isPlatformError ? 'platform' : 'app'
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (this.state.errorType === 'platform') {
      // Erro da plataforma - apenas log, não quebrar a aplicação
      console.warn('🚨 Plataforma Lovable Error (IGNORADO):', {
        error: error.message,
        stack: error.stack?.substring(0, 200),
        timestamp: new Date().toISOString()
      });
      
      // Reset automaticamente após 100ms
      setTimeout(() => {
        this.setState({ hasError: false, errorType: 'unknown' });
      }, 100);
    } else {
      // Erro real da aplicação
      console.error('❌ Erro da Aplicação:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError && this.state.errorType === 'app') {
      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-destructive">
              Ops! Algo deu errado
            </h2>
            <p className="text-muted-foreground">
              Por favor, recarregue a página
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    // Para erros da plataforma, renderizar normalmente (erro ignorado)
    return this.props.children;
  }
}

export default GlobalErrorBoundary;