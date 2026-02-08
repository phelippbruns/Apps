
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
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
        <div className="min-h-screen bg-charcoal flex items-center justify-center p-8">
          <div className="bg-darkgray border border-white/10 p-12 rounded-3xl max-w-lg w-full text-center space-y-6">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="text-red-500 w-10 h-10" />
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Something went wrong</h1>
            <p className="text-gray-400 text-sm">
              LEMON 6 encountered an unexpected error. Your files were not affected as all processing is local.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-lemon text-charcoal font-black rounded-full hover:bg-white transition-all active:scale-95"
            >
              RELOAD APPLICATION
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
