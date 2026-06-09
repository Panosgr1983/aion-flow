import { useEffect, useState } from 'react';
import { crmHealthHelper } from '../../lib/dataHelpers';
import { X, RefreshCw, Activity } from 'lucide-react';

interface HealthStatus {
  smtp: { ok: boolean; lastCheck?: string; error?: string };
  sync: { ok: boolean; submissions: number; messages: number; lastSync?: string };
  storage: { ok: boolean; fileCount: number };
  edgeFunction: { ok: boolean };
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function HealthPanel({ open, onClose }: Props) {
  const [status, setStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const s = await crmHealthHelper.getStatus();
    setStatus(s);
    setLoading(false);
  };

  useEffect(() => { if (open) load(); }, [open]);

  if (!open) return null;

  const Row = ({ icon, label, ok, detail }: { icon: string; label: string; ok: boolean; detail: string }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-800/30 last:border-0">
      <div className="flex items-center gap-2.5">
        <span className={ok ? 'text-green-400' : 'text-red-400'}>{ok ? '🟢' : '🔴'}</span>
        <span className="text-sm text-gray-300">{label}</span>
      </div>
      <span className="text-xs text-gray-500">{detail}</span>
    </div>
  );

  const timeAgo = (d?: string) => {
    if (!d) return '—';
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'τώρα';
    if (mins < 60) return `${mins}λ πριν`;
    return `${Math.floor(mins / 60)}ω πριν`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-blue-400" />
            <h3 className="text-sm font-semibold">CRM Health</h3>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="p-1.5 text-gray-500 hover:text-gray-300 rounded-lg hover:bg-gray-800 transition-colors">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={onClose} className="p-1.5 text-gray-500 hover:text-gray-300 rounded-lg hover:bg-gray-800 transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="p-5">
          {loading && !status ? (
            <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" /></div>
          ) : status ? (
            <div className="space-y-1">
              <Row icon="📧" label="SMTP" ok={status.smtp.ok} detail={status.smtp.ok ? `Ρυθμισμένο` : 'Δεν έχει ρυθμιστεί'} />
              <Row icon="🔄" label="Contact Sync" ok={status.sync.ok} detail={`${status.sync.messages} msgs / ${status.sync.submissions} subs`} />
              <Row icon="📎" label="Storage" ok={status.storage.ok} detail={`${status.storage.fileCount} αρχεία`} />
              <Row icon="⚡" label="Edge Function" ok={status.edgeFunction.ok} detail={status.edgeFunction.ok ? 'Ανταποκρίνεται' : 'Δεν ανταποκρίνεται'} />
              {status.sync.lastSync && (
                <div className="flex items-center justify-between pt-2 text-[11px] text-gray-600">
                  <span>Τελευταίο μήνυμα</span>
                  <span>{timeAgo(status.sync.lastSync)}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">Αποτυχία φόρτωσης</p>
          )}
        </div>
      </div>
    </div>
  );
}
