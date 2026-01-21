'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { PixelFrame, PixelButton } from './ui/PixelComponents';
import { IconWarning } from './icons/PixelIcons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  context?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Error in ${this.props.context || 'component'}:`, error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private getErrorMessage = (): string => {
    if (!this.state.error) return 'An unexpected error occurred';

    const message = this.state.error.message.toLowerCase();

    if (message.includes('fetch') || message.includes('network')) {
      return 'Unable to load this component. Please check your internet connection and try again.';
    }
    if (message.includes('not found')) {
      return 'The requested resource could not be found.';
    }
    if (message.includes('unauthorized') || message.includes('forbidden')) {
      return 'You do not have permission to access this resource.';
    }

    return this.state.error.message || 'An unexpected error occurred';
  };

  private getErrorTitle = (): string => {
    if (!this.state.error) return 'Error';

    const message = this.state.error.message.toLowerCase();

    if (message.includes('fetch') || message.includes('network')) {
      return 'Connection Error';
    }
    if (message.includes('not found')) {
      return 'Not Found';
    }
    if (message.includes('unauthorized') || message.includes('forbidden')) {
      return 'Access Denied';
    }

    return 'Error';
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <PixelFrame variant="critical" padding="md">
          <div className="flex items-start gap-3">
            <IconWarning size={24} color="var(--critical-light)" />
            <div className="flex-1">
              <h3 className="font-pixel text-[11px] text-[var(--critical-light)] mb-2">
                {this.getErrorTitle()}
              </h3>
              <p className="font-pixel text-[10px] text-[var(--gray-medium)] mb-3 leading-relaxed">
                {this.getErrorMessage()}
              </p>
              <PixelButton variant="health" size="sm" onClick={this.handleRetry}>
                TRY AGAIN
              </PixelButton>
            </div>
          </div>
        </PixelFrame>
      );
    }

    return this.props.children;
  }
}

// Hook-based error boundary wrapper for functional components
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  context?: string
) {
  return function WithErrorBoundaryWrapper(props: P) {
    return (
      <ErrorBoundary context={context}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
}
