import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorId: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Application Error Caught:', error, errorInfo);
    
    // Log error to monitoring service (Sentry, LogRocket, etc.)
    this.logErrorToService(error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Show user-friendly toast notification
    toast({
      title: "Oops! Something went wrong",
      description: "We've been notified and are working on a fix. Please try refreshing the page.",
      variant: "destructive",
    });
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // In production, send to error monitoring service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: 'demo-user', // Get from auth context in real app
    };

    // Mock logging (replace with actual service)
    console.group('🔍 Error Report');
    console.table(errorReport);
    console.groupEnd();

    // Example: Send to Sentry
    // Sentry.captureException(error, { extra: errorReport });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportIssue = () => {
    const subject = `Bug Report - ${this.state.errorId}`;
    const body = `
Error Details:
- Error ID: ${this.state.errorId}
- Message: ${this.state.error?.message}
- Page: ${window.location.href}
- Time: ${new Date().toLocaleString()}

Please describe what you were doing when this error occurred:
[Your description here]
    `.trim();

    const mailtoLink = `mailto:support@piggyupi.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-pink-50">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Oops! Something went wrong
              </CardTitle>
              <p className="text-gray-600 mt-2">
                We encountered an unexpected error. Don't worry, your data is safe!
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700 font-medium">Error ID</p>
                <p className="text-xs text-gray-500 font-mono">{this.state.errorId}</p>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={this.handleReload} 
                  className="w-full bg-primary hover:bg-primary/90"
                  size="lg"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Page
                </Button>

                <Button 
                  onClick={this.handleGoHome} 
                  variant="outline" 
                  className="w-full"
                  size="lg"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go to Homepage
                </Button>

                <Button 
                  onClick={this.handleReportIssue} 
                  variant="ghost" 
                  className="w-full text-gray-600"
                  size="sm"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Report this issue
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 p-3 bg-red-50 rounded-lg border border-red-200">
                  <summary className="text-sm font-medium text-red-800 cursor-pointer">
                    Developer Details
                  </summary>
                  <div className="mt-2 text-xs text-red-700 font-mono whitespace-pre-wrap">
                    {this.state.error.stack}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for easier usage
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

export default ErrorBoundary;
