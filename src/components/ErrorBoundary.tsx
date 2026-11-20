import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  onResetData?: () => void;
  viewLabel?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Error handled gracefully by fallback UI
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  handleReset = () => {
    if (this.props.onResetData) {
      this.props.onResetData();
    }
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 min-w-0 bg-white px-6 py-10 flex items-center justify-center">
          <div className="max-w-md w-full rounded-lg border border-red-200 bg-red-50/50 p-6 text-center">
            <AlertTriangle className="w-6 h-6 text-[#B91C1C] mx-auto mb-2.5" />
            <h2 className="text-base font-bold text-[#0F172A]">
              Unable to render {this.props.viewLabel ?? 'this view'}
            </h2>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              The current dataset or view state ran into an unexpected display issue. You
              can retry or restore the built-in Q3 data.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={this.handleRetry}
                className="px-3.5 py-1.5 text-xs font-semibold text-[#0F172A] bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Retry view
              </button>
              {this.props.onResetData && (
                <button
                  type="button"
                  onClick={this.handleReset}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0F172A] rounded hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset data
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
