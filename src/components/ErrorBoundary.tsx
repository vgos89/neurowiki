import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('Error caught by boundary:', error, errorInfo);
    }
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-6 sm:p-8">
          <div className="max-w-2xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 sm:p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Something went wrong
            </h1>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              The page hit an unexpected error. Reload the app to retry. If the problem keeps happening, navigate back to the main guides or calculators hub.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-lg bg-neuro-500 text-white hover:bg-neuro-600 transition-colors"
              >
                Reload Page
              </button>
              <a
                href="/"
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                Go Home
              </a>
            </div>
            {import.meta.env.DEV && (
              <>
                <div className="bg-red-100 border-l-4 border-red-500 p-4 mt-6">
                  <h2 className="font-bold text-red-700">Error Message</h2>
                  <pre className="text-sm text-red-900 whitespace-pre-wrap mt-2">
                    {this.state.error?.toString()}
                  </pre>
                </div>
                <div className="bg-slate-100 border-l-4 border-slate-500 p-4 mt-4">
                  <h2 className="font-bold text-slate-700">Stack Trace</h2>
                  <pre className="text-xs text-slate-800 whitespace-pre-wrap mt-2 overflow-auto max-h-96">
                    {this.state.error?.stack}
                  </pre>
                </div>
                {this.state.errorInfo && (
                  <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mt-4">
                    <h2 className="font-bold text-blue-700">Component Stack</h2>
                    <pre className="text-xs text-blue-900 whitespace-pre-wrap mt-2 overflow-auto max-h-96">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
