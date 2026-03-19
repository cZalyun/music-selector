import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full min-h-[50vh] flex-col items-center justify-center p-6 text-center">
          <div className="rounded-2xl bg-brand-50/10 p-6 ring-1 ring-brand-500/20 max-w-md w-full">
            <h2 className="text-xl font-bold text-brand-500 mb-2">Something went wrong</h2>
            <p className="text-surface-400 text-sm mb-6">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-surface-800 text-surface-50 rounded-lg font-medium hover:bg-surface-700 transition-colors"
            >
              Reload application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
