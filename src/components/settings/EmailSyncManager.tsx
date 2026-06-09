import { useEffect, useState, useCallback } from 'react';
import { emailAccountsHelper } from '../../lib/dataHelpers';
import { EmailAccount } from '../../types/supabase';
import { Mail, RefreshCw, Link, Unlink, CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';

export default function EmailSyncManager() {
  const [accounts, setAccounts] = useState<EmailAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await emailAccountsHelper.getAll();
      setAccounts(data || []);
    } catch (e: any) {
      // In demo mode (non-authenticated), just show empty state
      setAccounts([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const connectGmail = () => {
    window.location.href = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gmail-sync?action=auth`;
  };

  const disconnect = async (id: string) => {
    await emailAccountsHelper.delete(id);
    await load();
  };

  const triggerSync = async () => {
    setSyncing(true);
    try {
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gmail-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ action: 'sync' }),
      });
      await load();
    } catch (err) {
      console.error('Sync failed:', err);
    }
    setSyncing(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>;

  if (error) return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Email Sync</h2>
          <p className="text-sm text-gray-500">Σύνδεση Gmail για αμφίδρομο συγχρονισμό email</p>
        </div>
        <button onClick={load} className="btn-ghost p-2"><RefreshCw size={14} /></button>
      </div>
      <div className="card p-8 text-center">
        <Mail size={48} className="mx-auto mb-4 text-gray-600 opacity-30" />
        <h3 className="font-medium text-gray-300 mb-2">Δεν ήταν δυνατή η φόρτωση</h3>
        <p className="text-sm text-gray-500 mb-2">{error}</p>
        <button onClick={connectGmail} className="btn-primary mt-4">
          <ExternalLink size={16} /> Σύνδεση Gmail
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Email Sync</h2>
          <p className="text-sm text-gray-500">Σύνδεση Gmail για αμφίδρομο συγχρονισμό email</p>
        </div>
        <button onClick={load} className="btn-ghost p-2"><RefreshCw size={14} /></button>
      </div>

      {accounts.length === 0 ? (
        <div className="card p-8 text-center">
          <Mail size={48} className="mx-auto mb-4 text-gray-600 opacity-30" />
          <h3 className="font-medium text-gray-300 mb-2">Καμία σύνδεση email</h3>
          <p className="text-sm text-gray-500 mb-6">Σύνδεσε το Gmail σου για αυτόματο συγχρονισμό εισερχομένων και αποστολών.</p>
          <button onClick={connectGmail} className="btn-primary">
            <ExternalLink size={16} /> Σύνδεση Gmail
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map(acc => (
            <div key={acc.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-gray-100">{acc.email}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        {acc.is_active ? <CheckCircle size={10} className="text-green-400" /> : <XCircle size={10} className="text-red-400" />}
                        {acc.is_active ? 'Ενεργός' : 'Ανενεργός'}
                      </span>
                      {acc.last_sync_at && (
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          Τελευταίος συγχρονισμός: {new Date(acc.last_sync_at).toLocaleString('el-GR')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={triggerSync} disabled={syncing} className="btn-ghost text-xs px-3 py-1.5">
                    <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} /> Συγχρονισμός
                  </button>
                  <button onClick={() => disconnect(acc.id)} className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors text-xs font-medium">
                    <Unlink size={12} /> Αποσύνδεση
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button onClick={connectGmail} className="btn-ghost text-sm">
            <Link size={14} /> Σύνδεση άλλου λογαριασμού
          </button>
        </div>
      )}

      <div className="card p-5 space-y-2">
        <h3 className="text-sm font-semibold">Πώς λειτουργεί</h3>
        <ul className="text-xs text-gray-500 space-y-1.5 list-disc list-inside">
          <li>Σύνδεσε τον Gmail λογαριασμό σου με ένα κλικ</li>
          <li>Τα email από τη φόρμα επικοινωνίας συγχρονίζονται αυτόματα στο Inbox</li>
          <li>Οι απαντήσεις σου από Gmail εμφανίζονται στο ίδιο thread</li>
          <li>Ο συγχρονισμός γίνεται κάθε 5 λεπτά αυτόματα</li>
          <li>Μπορείς να κάνεις χειροκίνητο sync ανά πάσα στιγμή</li>
        </ul>
      </div>
    </div>
  );
}
