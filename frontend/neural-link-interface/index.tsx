
import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Error Boundary to catch and display React errors
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    console.error('React Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '40px', 
          background: '#1a1a1a', 
          color: '#ff6b6b', 
          minHeight: '100vh',
          fontFamily: 'monospace'
        }}>
          <h1 style={{ color: '#ff6b6b' }}>Neural Link Error</h1>
          <pre style={{ 
            background: '#111', 
            padding: '20px', 
            borderRadius: '8px',
            overflow: 'auto',
            color: '#f0f0f0'
          }}>
            {this.state.error?.toString()}
          </pre>
          {this.state.errorInfo && (
            <details style={{ marginTop: '20px' }}>
              <summary style={{ cursor: 'pointer', color: '#00d9ff' }}>Component Stack</summary>
              <pre style={{ 
                background: '#111', 
                padding: '20px', 
                borderRadius: '8px',
                overflow: 'auto',
                color: '#888'
              }}>
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
