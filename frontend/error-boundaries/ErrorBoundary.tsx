// BrandLens Error Boundary for React
// Wrap your App with this boundary to catch rendering errors

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
 children: ReactNode;
 fallback?: ReactNode;
 onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
 hasError: boolean;
 error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
 constructor(props: Props) {
 super(props);
 this.state = { hasError: false, error: null };
 }

 static getDerivedStateFromError(error: Error): State {
 return { hasError: true, error };
 }

 componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
 // Log error to Sentry if available
 if (typeof window !== 'undefined' && (window as any).Sentry) {
 (window as any).Sentry.captureException(error, {
 contexts: {
 react: {
 componentStack: errorInfo.componentStack,
 },
 },
 });
 }

 // Call optional error handler
 if (this.props.onError) {
 this.props.onError(error, errorInfo);
 }

 // Log to console in development
 if (process.env.NODE_ENV !== 'production') {
 console.error('ErrorBoundary caught an error:', error, errorInfo);
 }
 }

 handleReset = (): void => {
 this.setState({ hasError: false, error: null });
 };

 render(): ReactNode {
 if (this.state.hasError) {
 if (this.props.fallback) {
 return this.props.fallback;
 }

 return (
 <div className="error-boundary" style={{
 display: 'flex',
 flexDirection: 'column',
 alignItems: 'center',
 justifyContent: 'center',
 minHeight: '100vh',
 padding: '2rem',
 backgroundColor: '#fafafa',
 fontFamily: 'system-ui, -apple-system, sans-serif',
 }}>
 <div style={{
 maxWidth: '600px',
 textAlign: 'center',
 }}>
 <h1 style={{
 fontSize: '2rem',
 marginBottom: '1rem',
 color: '#1a1a1a',
 }}>
 Something went wrong
 </h1>
 <p style={{
 color: '#666',
 marginBottom: '2rem',
 lineHeight: '1.6',
 }}>
 We're sorry, but something unexpected happened. Please try refreshing the page.
 </p>
 {process.env.NODE_ENV === 'development' && this.state.error && (
 <details style={{
 textAlign: 'left',
 marginBottom: '2rem',
 padding: '1rem',
 backgroundColor: '#fff',
 borderRadius: '8px',
 border: '1px solid #e0e0e0',
 }}>
 <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '0.5rem' }}>
 Error Details (Dev Only)
 </summary>
 <pre style={{
 overflow: 'auto',
 fontSize: '0.875rem',
 color: '#d32f2f',
 }}>
 {this.state.error.toString()}
 </pre>
 </details>
 )}
 <button
 onClick={this.handleReset}
 style={{
 padding: '0.75rem 2rem',
 backgroundColor: '#2563eb',
 color: '#fff',
 border: 'none',
 borderRadius: '6px',
 fontSize: '1rem',
 cursor: 'pointer',
 }}
 >
 Try Again
 </button>
 </div>
 </div>
 );
 }

 return this.props.children;
 }
}

export default ErrorBoundary;
