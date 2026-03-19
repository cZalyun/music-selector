import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryInner extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60dvh] p-8 text-center">
          <AlertTriangle size={48} className="text-dislike mb-4" />
          <h1 className="text-xl font-bold text-surface-100 mb-2">
            Something went wrong
          </h1>
          <p className="text-surface-400 mb-6 max-w-sm">
            {this.state.error?.message ?? 'An unexpected error occurred.'}
          </p>
          <button
            onClick={this.handleReload}
            className="flex items-center gap-2 px-6 py-3 bg-accent-500 text-white rounded-xl font-medium hover:bg-accent-600 transition-colors"
          >
            <RefreshCw size={18} />
            Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export function ErrorBoundary({ children }: Props): ReactNode {
  return <ErrorBoundaryInner>{children}</ErrorBoundaryInner>;
}

export function ErrorFallback(): ReactNode {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60dvh] p-8 text-center">
      <AlertTriangle size={48} className="text-dislike mb-4" />
      <h1 className="text-xl font-bold text-surface-100 mb-2">
        {t('errors.genericError')}
      </h1>
      <button
        onClick={() => window.location.reload()}
        className="flex items-center gap-2 px-6 py-3 bg-accent-500 text-white rounded-xl font-medium hover:bg-accent-600 transition-colors"
      >
        <RefreshCw size={18} />
        {t('errors.reloadButton')}
      </button>
    </div>
  );
}
