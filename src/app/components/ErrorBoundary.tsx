import { Component, type ErrorInfo, type ReactNode } from "react";
import { Landmark } from "lucide-react";

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Memoirium application error", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-6">
          <div className="max-w-xl rounded-lg border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
            <Landmark size={42} className="mx-auto mb-5 text-[var(--gold-primary)]" />
            <h1 className="text-4xl mb-4 text-[var(--gold-primary)]">The gallery needs a reset</h1>
            <p className="mb-8 text-[var(--text-secondary)]">
              Something interrupted Memoirium. Refresh the page to reopen the museum.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center border border-[var(--gold-primary)] bg-[var(--gold-primary)] px-6 py-3 text-[#0F1115] transition-colors hover:bg-[var(--gold-secondary)]"
            >
              Refresh Memoirium
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
