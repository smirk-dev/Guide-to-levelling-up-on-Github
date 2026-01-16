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
                {this.props.context ? `Error loading ${this.props.context}` : 'Something went wrong'}
              </h3>
              <p className="font-pixel text-[8px] text-[var(--gray-medium)] mb-3">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <PixelButton variant="ghost" size="sm" onClick={this.handleRetry}>
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
