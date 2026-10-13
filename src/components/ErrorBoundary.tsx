import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-dark, #0f172a)',
            color: 'var(--text-main, #f1f5f9)',
            padding: '20px',
          }}
        >
          <div
            style={{
              maxWidth: '500px',
              width: '100%',
              backgroundColor: 'var(--bg-card, #1e293b)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '12px',
              padding: '32px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                marginBottom: '20px',
              }}
            >
              <AlertTriangle size={32} color="#ef4444" />
            </div>

            <h1
              style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                marginBottom: '12px',
                color: 'var(--text-main, #f1f5f9)',
              }}
            >
              Something went wrong
            </h1>

            <p
              style={{
                fontSize: '0.95rem',
                color: 'var(--text-muted, #94a3b8)',
                marginBottom: '24px',
                lineHeight: 1.6,
              }}
            >
              The application encountered an unexpected error. Please try reloading the page.
              If the problem persists, contact support.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details
                style={{
                  textAlign: 'left',
                  marginBottom: '24px',
                  padding: '12px',
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  color: '#f87171',
                  overflow: 'auto',
                  maxHeight: '150px',
                }}
              >
                <summary style={{ cursor: 'pointer', marginBottom: '8px', fontWeight: 500 }}>
                  Error Details (Development Mode)
                </summary>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <button
              onClick={this.handleReload}
              style={{
                backgroundColor: 'var(--accent-primary, #6366f1)',
                color: 'white',
                padding: '12px 32px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '1rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#4f46e5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-primary, #6366f1)';
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
