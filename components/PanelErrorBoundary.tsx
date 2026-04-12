import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
  panelName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class PanelErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error(`[PanelError] ${this.props.panelName}:`, error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[200px] bg-gray-900/50 border border-red-500/20 rounded-lg p-6">
          <p className="text-red-400 font-mono text-sm mb-2">
            {this.props.fallbackMessage || 'Panel failed to load'}
          </p>
          <button
            onClick={this.handleRetry}
            className="px-4 py-2 bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono text-xs rounded hover:bg-amber-500/30 transition-colors"
          >
            [RETRY]
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
