import { Component, type ErrorInfo, type ReactNode } from "react";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

/**
 * 配下で発生したレンダリング時例外を捕捉し、フォールバックUIを表示する。
 * React の制約上、クラスコンポーネントとしてのみ実装可能。
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
