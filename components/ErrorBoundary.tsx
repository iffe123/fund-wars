import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[FUND_WARS] Application error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleReset = () => {
    // Clear any stored state that might be causing issues
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen bg-black flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="text-red-500 text-4xl font-mono mb-4">⚠ SYSTEM FAULT</div>
            <div className="text-amber-400 text-lg font-mono mb-2">FUND WARS OS v9.2</div>
            <div className="text-slate-400 text-sm mb-6">
              A critical error has occurred. The trading floor is experiencing technical difficulties.
            </div>

            <div className="bg-slate-900 border border-slate-700 p-4 mb-6 text-left">
              <div className="text-red-400 text-xs font-mono mb-2">ERROR DUMP:</div>
              <div className="text-slate-500 text-xs font-mono overflow-auto max-h-32">
                {this.state.error?.message || 'Unknown error'}
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full bg-green-900 hover:bg-green-800 text-green-400 border border-green-700 py-3 px-6 font-mono text-sm transition-colors"
              >
                [REBOOT SYSTEM]
              </button>
              <button
                onClick={this.handleReset}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-600 py-2 px-6 font-mono text-xs transition-colors"
              >
                [FACTORY RESET - Clear All Data]
              </button>
            </div>

            <div className="text-slate-600 text-xs mt-6">
              If this error persists, try clearing your browser cache or using Guest Mode.
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
