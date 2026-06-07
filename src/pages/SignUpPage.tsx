import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Zap, Eye, EyeOff, AlertCircle, MailCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { signUp, isDemoMode } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: signUpError, needsEmailConfirm } = await signUp(email, password);

    if (signUpError) {
      setError(signUpError);
      setLoading(false);
    } else if (needsEmailConfirm) {
      setSuccess(true);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  if (isDemoMode) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-cyan-600/6 rounded-full blur-3xl" />
        </div>
        <div className="relative w-full max-w-sm text-center">
          <div className="card p-8">
            <h1 className="text-xl font-bold mb-4">Μη διαθέσιμο</h1>
            <p className="text-gray-500 text-sm mb-6">Η εγγραφή είναι διαθέσιμη μόνο σε live mode (με Supabase).</p>
            <Link to="/login" className="text-blue-400 hover:text-blue-300 text-sm">← Επιστροφή στη σύνδεση</Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-cyan-600/6 rounded-full blur-3xl" />
        </div>
        <div className="relative w-full max-w-sm text-center animate-fade-in">
          <div className="card p-8">
            <div className="size-14 mx-auto mb-5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <MailCheck size={28} />
            </div>
            <h1 className="text-xl font-bold mb-3">Επιβεβαίωση email</h1>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Στείλαμε ένα email επιβεβαίωσης στο <strong className="text-gray-200">{email}</strong>.
              Κάνε κλικ στο link που λάβες για να ενεργοποιήσεις τον λογαριασμό σου.
            </p>
            <Link to="/login" className="text-blue-400 hover:text-blue-300 text-sm">
              ← Παω στη συνδεση
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-cyan-600/6 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm animate-fade-in">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold mb-1">Δημιουργία λογαριασμού</h1>
          <p className="text-gray-500 text-sm">AION FLOW Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Κωδικός</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="input pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : null}
            {loading ? 'Εγγραφή...' : 'Εγγραφή'}
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-500">
          Εχεις ήδη λογαριασμό;{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300">Συνδέσου</Link>
        </p>

        <p className="text-center mt-4 text-xs text-gray-600">
          <Link to="/" className="hover:text-gray-400 transition-colors">← Επιστροφή στην αρχική</Link>
        </p>
      </div>
    </div>
  );
}
