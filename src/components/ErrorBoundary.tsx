import React from 'react';
import { reportError } from '../lib/errorMonitor';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface State {
  hasError: boolean;
  message: string | null;
}

/**
 * Root error boundary: a render crash shows a recoverable screen instead of a
 * blank page, and the crash is logged (kind='boundary') with the component
 * stack so the Insights health section shows exactly what failed.
 */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false, message: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    reportError({
      kind: 'boundary',
      message: error.message,
      stack: error.stack,
      component: info.componentStack?.split('\n').slice(0, 4).join(' | '),
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#101210] p-4">
          <div className="bg-white/[0.06] rounded-2xl border border-white/10 shadow-sm p-6 max-w-md w-full space-y-4 text-center">
            <div className="w-10 h-10 bg-red-500/10 text-red-400 rounded-xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </div>
            <h1 className="text-base font-bold text-[#f4f2ec]">Something went wrong on our side</h1>
            <p className="text-xs text-stone-400 leading-relaxed">
              The error was logged and the team can see it in the health dashboard. Your data is safe — nothing you
              saved was affected.
            </p>
            {this.state.message && (
              <p className="text-[10px] text-stone-400 font-mono bg-white/[0.05] border border-white/10 rounded-lg p-2 break-words">
                {this.state.message.slice(0, 200)}
              </p>
            )}
            <button
              onClick={this.handleReload}
              className="btn-ink w-full py-2.5 text-xs inline-flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
            >
              <RefreshCw className="w-4 h-4" aria-hidden="true" /> Reload the app
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
