// Async Error Boundary for data fetching and async operations
import { Component, ReactNode } from 'react';

interface Props {
 children: ReactNode;
 fallback?: ReactNode;
}

interface State {
 hasError: boolean;
 error: Error | null;
}

export class AsyncErrorBoundary extends Component<Props, State> {
 constructor(props: Props) {
 super(props);
 this.state = { hasError: false, error: null };
 }

 static getDerivedStateFromError(error: Error): State {
 return { hasError: true, error };
 }

 componentDidCatch(error: Error): void {
 if (typeof window !== 'undefined' && (window as any).Sentry) {
 (window as any).Sentry.captureException(error);
 }
 }

 render(): ReactNode {
 if (this.state.hasError) {
 if (this.props.fallback) {
 return this.props.fallback;
 }

 return (
 <div style={{
 padding: '2rem',
 textAlign: 'center',
 color: '#d32f2f',
 }}>
 <h2>Failed to load data</h2>
 <p>Please try again later.</p>
 <button
 onClick={() => this.setState({ hasError: false, error: null })}
 style={{
 marginTop: '1rem',
 padding: '0.5rem 1rem',
 backgroundColor: '#2563eb',
 color: '#fff',
 border: 'none',
 borderRadius: '4px',
 cursor: 'pointer',
 }}
 >
 Retry
 </button>
 </div>
 );
 }

 return this.props.children;
 }
}

export default AsyncErrorBoundary;
