import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Rendered in place of the crashed subtree. Defaults to a full-page error card. */
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global Error Boundary — catches any unhandled React render / lifecycle error
 * and shows a recovery UI instead of a white screen.
 *
 * Usage:
 *   Wrap the root <App> (or any subtree) in <ErrorBoundary>.
 *   On Product Hunt traffic a white screen = instant bounce. This prevents that.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Log to an external error-tracking service here if available (Sentry, etc.)
    // For now, log quietly to console — only fires in actual crash, not normal usage.
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Navigate home so user ends up on a working page
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) return this.props.fallback;

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#010814',
          color: '#B8D9FF',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          padding: '24px',
          textAlign: 'center',
          gap: '20px',
        }}
      >
        {/* Breathing orb placeholder */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #7AC4FF, #3A82F7 70%)',
            boxShadow: '0 0 40px #3A82F755',
            marginBottom: 8,
          }}
        />
        <h1 style={{ fontSize: 22, fontWeight: 300, color: '#fff', margin: 0 }}>
          Something went wrong
        </h1>
        <p style={{ fontSize: 14, color: '#4A7AAA', maxWidth: 360, lineHeight: 1.6, margin: 0 }}>
          An unexpected error occurred. Your breathing data is safe — refresh the
          page or tap below to return home.
        </p>
        <button
          onClick={this.handleReset}
          style={{
            marginTop: 8,
            padding: '12px 32px',
            borderRadius: 999,
            background: 'linear-gradient(135deg,#1A5FCC,#3A82F7)',
            color: '#fff',
            border: 'none',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
            letterSpacing: '0.05em',
          }}
        >
          ← Back to Home
        </button>
        {import.meta.env.DEV && this.state.error && (
          <pre
            style={{
              marginTop: 16,
              padding: 12,
              background: '#0B1628',
              borderRadius: 8,
              fontSize: 11,
              color: '#FF8A8A',
              maxWidth: 480,
              overflowX: 'auto',
              textAlign: 'left',
            }}
          >
            {this.state.error.message}
          </pre>
        )}
      </div>
    );
  }
}
