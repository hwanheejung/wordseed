import { Component, type ErrorInfo, type ReactNode } from "react";

interface AppErrorBoundaryFallbackProps {
  retry: () => void;
}

interface AppErrorBoundaryProps {
  children: ReactNode;
  fallback: (props: AppErrorBoundaryFallbackProps) => ReactNode;
}

interface AppErrorBoundaryState {
  error: Error | null;
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Dictionary screen failed to render.", error, info);
  }

  private handleRetry = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    if (this.state.error !== null) {
      return this.props.fallback({ retry: this.handleRetry });
    }

    return this.props.children;
  }
}
