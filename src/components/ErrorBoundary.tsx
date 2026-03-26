import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
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
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full border-2 border-red-500 flex items-center justify-center mb-6">
            <span className="text-red-500 font-bold text-2xl">!</span>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter italic mb-4 glow-text">SYSTEM FAILURE</h2>
          <p className="text-text-secondary text-sm mb-8 max-w-md">
            The Mana Core has encountered a critical error. Attempting to stabilize the system...
          </p>
          <button
            onClick={() => window.location.reload()}
            className="system-button px-8 py-3"
          >
            [REBOOT SYSTEM]
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
