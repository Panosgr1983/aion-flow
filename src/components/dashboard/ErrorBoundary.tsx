/*
  ═══════════════════════════════════════════════════════════════
  AION Flow — Error Boundary (T6)
  
  Πιάνει unhandled errors και εμφανίζει φιλικό μήνυμα.
  Ποτέ ξανά μαύρη / λευκή οθόνη.
  
  Χρήση:
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  ═══════════════════════════════════════════════════════════════
*/

import { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  title?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[AION ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} className="text-red-400" />
            </div>
            <h2 className="text-lg font-semibold mb-2">{this.props.title || 'Προέκυψε σφάλμα'}</h2>
            <p className="text-sm text-gray-500 mb-6">Η σελίδα δεν μπόρεσε να φορτωθεί. Δοκίμασε να ανανεώσεις.</p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
              className="btn-primary"
            >
              <RefreshCw size={16} /> Ανανέωση σελίδας
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
