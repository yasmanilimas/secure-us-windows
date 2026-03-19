import React from 'react';

interface AppErrorBoundaryState {
  hasError: boolean;
}

class AppErrorBoundary extends React.Component<React.PropsWithChildren, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('App crashed:', error);
  }

  componentDidMount() {
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  componentWillUnmount() {
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    const message = reason instanceof Error ? reason.message : String(reason ?? '');

    // Ignorar advertencias no fatales para no tumbar toda la UI
    if (
      message.includes('A component suspended while responding to synchronous input') ||
      message.includes('ResizeObserver loop limit exceeded') ||
      message.includes('AbortError')
    ) {
      console.warn('Ignored non-fatal rejection:', message);
      return;
    }

    this.setState({ hasError: true });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
          <div className="max-w-md w-full border border-border bg-card rounded-lg p-6 text-center space-y-4">
            <h1 className="text-2xl font-anton text-foreground">Algo salió mal</h1>
            <p className="text-muted-foreground">
              Ocurrió un error al cargar la página. Intenta recargar.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
